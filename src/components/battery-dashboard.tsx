"use client";

import { useState } from "react";
import type { Battery } from "@/lib/types";
import { initialBatteries } from "@/lib/initial-data";
import { AddEditBatterySheet } from "./add-edit-battery-sheet";
import { BatteryInventoryTable } from "./battery-inventory-table";
import { RestockSuggestions } from "./restock-suggestions";
import { Button } from "./ui/button";
import { PlusCircle, Zap } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

export function BatteryDashboard() {
  const { toast } = useToast();
  const [batteries, setBatteries] = useState<Battery[]>(initialBatteries);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [batteryToEdit, setBatteryToEdit] = useState<Battery | null>(null);
  const [batteryToDelete, setBatteryToDelete] = useState<string | null>(null);

  const handleOpenAddSheet = () => {
    setBatteryToEdit(null);
    setIsSheetOpen(true);
  };

  const handleOpenEditSheet = (battery: Battery) => {
    setBatteryToEdit(battery);
    setIsSheetOpen(true);
  };

  const handleSubmit = (data: Battery) => {
    const isEditing = batteries.some(b => b.id === data.id);
    if (isEditing) {
      setBatteries(batteries.map((b) => (b.id === data.id ? data : b)));
      toast({ title: "Success!", description: "Battery updated successfully." });
    } else {
      setBatteries([data, ...batteries].sort((a, b) => a.type.localeCompare(b.type) || a.brand.localeCompare(b.brand)));
      toast({ title: "Success!", description: "New battery added to your inventory." });
    }
  };

  const handleDelete = (id: string) => {
    setBatteryToDelete(id);
  };

  const confirmDelete = () => {
    if (batteryToDelete) {
      setBatteries(batteries.filter((b) => b.id !== batteryToDelete));
      toast({ title: "Deleted", description: "Battery removed from inventory."});
      setBatteryToDelete(null);
    }
  };

  const totalBatteries = batteries.reduce((acc, b) => acc + b.quantity, 0);
  const batteryTypesCount = new Set(batteries.map(b => b.type)).size;


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Zap className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Battery Buddy</h1>
        </div>
        <div className="ml-auto">
          <Button onClick={handleOpenAddSheet}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Battery
          </Button>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Batteries</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalBatteries}</div>
                    <p className="text-xs text-muted-foreground">across {batteryTypesCount} types</p>
                </CardContent>
            </Card>
            <RestockSuggestions batteries={batteries} />
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Full Inventory</CardTitle>
                <CardDescription>All batteries in your collection.</CardDescription>
            </CardHeader>
            <CardContent>
                <BatteryInventoryTable batteries={batteries} onEdit={handleOpenEditSheet} onDelete={handleDelete} />
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the battery
              from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBatteryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
