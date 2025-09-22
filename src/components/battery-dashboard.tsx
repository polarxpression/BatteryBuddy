"use client";

import { useState, useEffect, useMemo } from "react";



import {
  addBattery,
  deleteBattery,
  onBatteriesSnapshot,
  updateBattery,
  saveDailyBatteryRecord,
  getDailyBatteryRecords,
  calculateAndSaveWeeklyAverage,
  calculateAndSaveMonthlyAverage,
} from "@/lib/firebase";
import type { Battery } from "@/lib/types";

import { AddEditBatterySheet } from "./add-edit-battery-sheet";
import { BatteryInventoryTable } from "./battery-inventory-table";
import { BatteryInventoryTableMobile } from "./battery-inventory-table-mobile";
import { RestockSuggestions } from "./restock-suggestions";
import { Button } from "./ui/button";
import { PlusCircle, Settings, Zap, Download, HelpCircle, Warehouse } from "lucide-react";
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
} from "./ui/card";
import { ThemeToggle } from "./theme-toggle";
import { SettingsModal } from "./settings-modal";
import { useMobile } from "@/hooks/use-mobile";
import Papa from "papaparse";
import { Input } from "./ui/input";
import { BatteryReport } from "./battery-report";

import { SearchHelpSheet } from "./search-help-sheet";
import { filterBatteries } from "@/lib/search";
import { getAggregatedQuantitiesByLocation } from "@/lib/utils";

import { useAppSettings } from "@/contexts/app-settings-context";

export function BatteryDashboard() {
  const { toast } = useToast();
  const isMobile = useMobile();
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpSheetOpen, setIsHelpSheetOpen] = useState(false);
  const [batteryToEdit, setBatteryToEdit] = useState<Battery | null>(null);
  const [batteryToDelete, setBatteryToDelete] = useState<string | null>(null);
  const { appSettings } = useAppSettings();
  const [searchTerm, setSearchTerm] = useState("");

  const aggregatedQuantitiesByLocation = useMemo(() => getAggregatedQuantitiesByLocation(batteries), [batteries]);

  const { itemsForInternalRestock, itemsForExternalPurchase } = useMemo(() => {
    const internalRestock: Battery[] = [];
    const externalPurchase: Battery[] = [];

    const uniqueBatteryTypes = new Map<string, Battery>();
    batteries.forEach(battery => {
      const key = `${battery.brand}-${battery.model}-${battery.type}-${battery.packSize}`;
      if (!uniqueBatteryTypes.has(key)) {
        uniqueBatteryTypes.set(key, battery);
      }
    });

    uniqueBatteryTypes.forEach(battery => {
      const key = `${battery.brand}-${battery.model}-${battery.type}-${battery.packSize}`;
      const quantities = aggregatedQuantitiesByLocation.get(key);
      const gondolaQuantity = quantities?.get("gondola") || 0;
      const stockQuantity = quantities?.get("stock") || 0;
      const totalQuantity = gondolaQuantity + stockQuantity;

      const currentLowStockThreshold = battery.lowStockThreshold !== undefined ? battery.lowStockThreshold : (appSettings?.lowStockThreshold || 5);

      console.log(`Processing battery: ${battery.brand} ${battery.model}`, {
        batteryThreshold: battery.lowStockThreshold,
        globalThreshold: appSettings?.lowStockThreshold,
        currentThreshold: currentLowStockThreshold,
      });

      if (battery.discontinued) return; // Skip discontinued batteries

      // Determine items for internal restock (gondola is low, stock has enough)
      const gondolaLimit = battery.lowStockThreshold !== undefined ? battery.lowStockThreshold : (appSettings?.lowStockThreshold || 5);
      if (gondolaQuantity < gondolaLimit / 2 && stockQuantity > 0) {
        const neededInGondola = gondolaLimit - gondolaQuantity;
        if (neededInGondola <= 0) return;

        const rawCanMove = neededInGondola;
        const adjustedCanMove = Math.ceil(rawCanMove / battery.packSize) * battery.packSize;
        const finalCanMove = Math.min(adjustedCanMove, stockQuantity);

        if (finalCanMove > 0) {
          internalRestock.push({ ...battery, quantity: finalCanMove, location: "stock" });
        }
      }

      // Determine items for external purchase (overall low stock or out of stock)
      if (totalQuantity <= currentLowStockThreshold) {
        externalPurchase.push({ ...battery, quantity: totalQuantity });
      }
    });

    return { itemsForInternalRestock: internalRestock, itemsForExternalPurchase: externalPurchase };
  }, [batteries, appSettings, aggregatedQuantitiesByLocation]);

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
    const saveRecord = async () => {
      const today = new Date().toISOString().split('T')[0];
      const records = await getDailyBatteryRecords();
      const todayRecord = records.find(record => record.date === today);

      if (!todayRecord && batteries.length > 0) {
        await saveDailyBatteryRecord(batteries);
        console.log("Daily battery record saved.");
      }
    };

    saveRecord();
  }, [batteries]);

  useEffect(() => {
    const triggerWeeklyAggregation = async () => {
      const today = new Date();
      if (today.getDay() === 0) { // Sunday
        await calculateAndSaveWeeklyAverage();
        console.log("Weekly average calculated and saved.");
      }
    };
    triggerWeeklyAggregation();
  }, []);

  useEffect(() => {
    const triggerMonthlyAggregation = async () => {
      const today = new Date();
      if (today.getDate() === 1) { // 1st of the month
        await calculateAndSaveMonthlyAverage();
        console.log("Monthly average calculated and saved.");
      }
    };
    triggerMonthlyAggregation();
  }, []);

  const filteredBatteries = useMemo(() => {
    return filterBatteries(batteries, searchTerm);
  }, [batteries, searchTerm]);

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
      const newBattery = {
        ...data,
        id: data.id || crypto.randomUUID(),
      };
      await addBattery(newBattery);
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
      columns: ["brand", "model", "type", "barcode", "packSize", "quantity", "total"],
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

  

  





  const handleGenerateReportFromModal = (options: { layout: string; selectedBrands: string[]; selectedPackSizes: string[]; }) => {
    console.log("Generating report with options:", options);
    const searchParams = new URLSearchParams();
    searchParams.append('layout', options.layout);
    searchParams.append('brands', options.selectedBrands.join(','));
    searchParams.append('packSizes', options.selectedPackSizes.join(','));
    window.open(`/report?${searchParams.toString()}`, "_blank");
  };







  const handleMoveBatteries = async (itemsToMove: Battery[]) => {
    for (const item of itemsToMove) {
      // Find the actual battery in stock
      const stockBattery = batteries.find(
        (b) =>
          b.brand === item.brand &&
          b.model === item.model &&
          b.type === item.type &&
          b.packSize === item.packSize &&
          b.location === "stock"
      );

      // Find the actual battery in gondola
      const gondolaBattery = batteries.find(
        (b) =>
          b.brand === item.brand &&
          b.model === item.model &&
          b.type === item.type &&
          b.packSize === item.packSize &&
          b.location === "gondola"
      );

      if (stockBattery) {
        const newStockQuantity = stockBattery.quantity - item.quantity;
        await updateBattery({ ...stockBattery, quantity: newStockQuantity });
      }

      if (gondolaBattery) {
        const newGondolaQuantity = gondolaBattery.quantity + item.quantity;
        await updateBattery({ ...gondolaBattery, quantity: newGondolaQuantity });
      } else if (item.quantity > 0) {
        // If no gondola battery exists, create one
        await addBattery({
          ...item,
          id: crypto.randomUUID(), // Generate a new ID for the new gondola entry
          quantity: item.quantity,
          location: "gondola",
        });
      }
    }
    toast({
      title: "Sucesso!",
      description: "Baterias movidas com sucesso para a gôndola.",
    });
  };




  const brands = useMemo(() => Array.from(new Set(batteries.map(b => b.brand))), [batteries]);
  const packSizes = useMemo(() => Array.from(new Set(batteries.map(b => b.packSize.toString()))), [batteries]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 w-full">
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
      <main className="flex-1 space-y-4 p-4 md:p-8 w-full">
        <div className="grid grid-cols-1 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Visão Geral do Reabastecimento</CardTitle>
                    <Warehouse className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{itemsForInternalRestock.length}</div>
                    <p className="text-xs text-muted-foreground">itens para reabastecimento interno</p>
                    <div className="text-2xl font-bold mt-2">{itemsForExternalPurchase.length}</div>
                    <p className="text-xs text-muted-foreground">itens para compra externa</p>
                </CardContent>
            </Card>
                        <RestockSuggestions itemsForInternalRestock={itemsForInternalRestock} onMoveBatteries={handleMoveBatteries} />
        </div>
        
        <BatteryReport onGenerateReport={handleGenerateReportFromModal} brands={brands} packSizes={packSizes} />

        <Card>
            <CardHeader>
                <h2 className="text-2xl font-bold">Inventário Completo</h2>
                <p className="text-muted-foreground">Todas as baterias em sua coleção.</p>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center gap-2">
                    <Input 
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button variant="outline" size="icon" onClick={() => setIsHelpSheetOpen(true)}>
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Ajuda</span>
                    </Button>
                </div>
                {isMobile ? (
                    <BatteryInventoryTableMobile batteries={filteredBatteries} onEdit={handleOpenEditSheet} onDelete={handleDelete} onQuantityChange={handleQuantityChange} appSettings={appSettings} />
                ) : (
                    <BatteryInventoryTable batteries={filteredBatteries} onEdit={handleOpenEditSheet} onDelete={handleDelete} onQuantityChange={handleQuantityChange} appSettings={appSettings} />
                )}
            </CardContent>
        </Card>
      </main>

      <AddEditBatterySheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        batteryToEdit={batteryToEdit}
        onSubmit={handleSubmit}
      />

      <SearchHelpSheet open={isHelpSheetOpen} onOpenChange={setIsHelpSheetOpen} />

      <SettingsModal key={JSON.stringify(appSettings)} open={isSettingsOpen} onOpenChange={setIsSettingsOpen} appSettings={appSettings} />
      
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
