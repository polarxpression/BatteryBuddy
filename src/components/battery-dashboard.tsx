"use client";

import { useState, useEffect } from "react";
import {
  addBattery,
  deleteBattery,
  onBatteriesSnapshot,
  updateBattery,
} from "@/lib/firebase";
import type { Battery } from "@/lib/types";

import { AddEditBatterySheet } from "./add-edit-battery-sheet";
import { BatteryInventoryTable } from "./battery-inventory-table";
import { RestockSuggestions } from "./restock-suggestions";
import { Button } from "./ui/button";
import { PlusCircle, Settings, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { InventorySummary } from "./inventory-summary";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";

export function BatteryDashboard() {
  const { toast } = useToast();
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [batteryToEdit, setBatteryToEdit] = useState<Battery | null>(null);
  const [batteryToDelete, setBatteryToDelete] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onBatteriesSnapshot((newBatteries) => {
      setBatteries(
        newBatteries.sort(
          (a, b) =>
            a.type.localeCompare(b.type) || a.brand.localeCompare(b.brand)
        )
      );
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAddSheet = () => {
    setBatteryToEdit(null);
    setIsSheetOpen(true);
  };

  const handleOpenEditSheet = (battery: Battery) => {
    setBatteryToEdit(battery);
    setIsSheetOpen(true);
  };

  const handleSubmit = async (data: Battery) => {
    const isEditing = batteries.some((b) => b.id === data.id);
    if (isEditing) {
      await updateBattery(data);
      toast({
        title: "Sucesso!",
        description: "Bateria atualizada com sucesso.",
      });
    } else {
      await addBattery(data);
      toast({
        title: "Sucesso!",
        description: "Nova bateria adicionada ao seu inventário.",
      });
    }
  };

  const handleDelete = (id: string) => {
    setBatteryToDelete(id);
  };

  const confirmDelete = async () => {
    if (batteryToDelete) {
      await deleteBattery(batteryToDelete);
      toast({
        title: "Excluído",
        description: "Bateria removida do inventário.",
      });
      setBatteryToDelete(null);
    }
  };

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    const battery = batteries.find((b) => b.id === id);
    if (battery) {
      await updateBattery({ ...battery, quantity: newQuantity });
    }
  };

  const totalBatteries = batteries.reduce((acc, b) => acc + b.quantity, 0);
  const batteryTypesCount = new Set(batteries.map(b => b.type)).size;


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="hidden text-xl font-bold sm:block">Battery Buddy</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <Link href="/settings">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Configurações</span>
            </Button>
          </Link>
          <Button onClick={handleOpenAddSheet}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Bateria
          </Button>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total de Baterias</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalBatteries}</div>
                    <p className="text-xs text-muted-foreground">em {batteryTypesCount} tipos</p>
                </CardContent>
            </Card>
            <RestockSuggestions batteries={batteries} />
        </div>
        <InventorySummary batteries={batteries} />
        
        <Card>
            <CardHeader>
                <CardTitle>Inventário Completo</CardTitle>
                <CardDescription>Todas as baterias em sua coleção.</CardDescription>
            </CardHeader>
            <CardContent>
                <BatteryInventoryTable batteries={batteries} onEdit={handleOpenEditSheet} onDelete={handleDelete} onQuantityChange={handleQuantityChange} />
            </CardContent>
        </Card>
      </main>

      <AddEditBatterySheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        batteryToEdit={batteryToEdit}
        onSubmit={handleSubmit}
      />
      
      <AlertDialog open={!!batteryToDelete} onOpenChange={() => setBatteryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a bateria
              do seu inventário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBatteryToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
