"use client";

import { useState, useEffect, useMemo } from "react";
import {
  addBattery,
  deleteBattery,
  onBatteriesSnapshot,
  updateBattery,
  onAppSettingsSnapshot,
} from "@/lib/firebase";
import type { Battery, AppSettings } from "@/lib/types";

import { AddEditBatterySheet } from "./add-edit-battery-sheet";
import { BatteryInventoryTable } from "./battery-inventory-table";
import { RestockSuggestions } from "./restock-suggestions";
import { Button } from "./ui/button";
import { PlusCircle, Settings, Zap, Download } from "lucide-react";
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
import { SettingsModal } from "./settings-modal";
import { useMobile } from "@/hooks/use-mobile";
import Papa from "papaparse";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

export function BatteryDashboard() {
  const { toast } = useToast();
  const isMobile = useMobile();
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [batteryToEdit, setBatteryToEdit] = useState<Battery | null>(null);
  const [batteryToDelete, setBatteryToDelete] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    const unsubscribe = onAppSettingsSnapshot(setAppSettings);
    return () => unsubscribe();
  }, []);

  const filteredBatteries = useMemo(() => {
    return batteries.filter((battery) => {
      const typeMatch = typeFilter === "all" || battery.type === typeFilter;
      const brandMatch = brandFilter === "all" || battery.brand === brandFilter;
      const modelMatch = modelFilter === "all" || battery.model === modelFilter;

      const searchTermLower = searchTerm.toLowerCase();
      const searchMatch =
        !searchTerm ||
        battery.brand.toLowerCase().includes(searchTermLower) ||
        (battery.model || "").toLowerCase().includes(searchTermLower) ||
        battery.type.toLowerCase().includes(searchTermLower);

      return typeMatch && brandMatch && modelMatch && searchMatch;
    });
  }, [batteries, typeFilter, brandFilter, modelFilter, searchTerm]);

  const handleOpenAddSheet = () => {
    setBatteryToEdit(null);
    setIsSheetOpen(true);
  };

  const handleOpenEditSheet = (battery: Battery) => {
    setBatteryToEdit(battery);
    setIsSheetOpen(true);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
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

  const handleExport = () => {
    const csv = Papa.unparse(filteredBatteries.map(b => ({...b, total: b.quantity * b.packSize})) , {
      header: true,
      columns: ["brand", "model", "type", "packSize", "quantity", "total"],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "battery_inventory.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const totalBatteries = filteredBatteries.reduce((acc, b) => acc + b.quantity, 0);
  const batteryTypesCount = new Set(filteredBatteries.map(b => b.type)).size;


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Battery Buddy</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" size="icon" onClick={handleOpenSettings}>
            <Settings className="h-4 w-4" />
            <span className="sr-only">Configurações</span>
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
            <span className="sr-only">Exportar CSV</span>
          </Button>
          <Button onClick={handleOpenAddSheet} size={isMobile ? "icon" : "default"}>
            <PlusCircle className={isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"} />
            {isMobile ? null : "Adicionar Bateria"}
          </Button>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className={`grid grid-cols-1 ${isMobile ? "sm:grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-2"} gap-4`}>
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
            <RestockSuggestions batteries={filteredBatteries} />
        </div>
        <InventorySummary batteries={filteredBatteries} appSettings={appSettings} />
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Inventário Completo</CardTitle>
                    <CardDescription>Todas as baterias em sua coleção.</CardDescription>
                </div>
                <div className={`flex ${isMobile ? "flex-col" : "items-center gap-2"} gap-4`}>
                    <Input 
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${isMobile ? "w-full" : "max-w-sm"}`}
                    />
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className={`${isMobile ? "w-full" : "w-[180px]"}`}>
                            <SelectValue placeholder="Filtrar por tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Tipos</SelectItem>
                            {appSettings?.batteryTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={brandFilter} onValueChange={setBrandFilter}>
                        <SelectTrigger className={`${isMobile ? "w-full" : "w-[180px]"}`}>
                            <SelectValue placeholder="Filtrar por marca" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Marcas</SelectItem>
                            {appSettings?.batteryBrands.map(brand => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={modelFilter} onValueChange={setModelFilter}>
                        <SelectTrigger className={`${isMobile ? "w-full" : "w-[180px]"}`}>
                            <SelectValue placeholder="Filtrar por modelo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Modelos</SelectItem>
                            {appSettings?.batteryModels.map(model => (
                                <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <BatteryInventoryTable batteries={filteredBatteries} onEdit={handleOpenEditSheet} onDelete={handleDelete} onQuantityChange={handleQuantityChange} />
            </CardContent>
        </Card>
      </main>

      <AddEditBatterySheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        batteryToEdit={batteryToEdit}
        onSubmit={handleSubmit}
      />

      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      
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
