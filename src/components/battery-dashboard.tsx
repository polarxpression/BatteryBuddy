"use client";

import { useState, useEffect, useMemo } from "react";
import { createRoot } from 'react-dom/client';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  addBattery,
  deleteBattery,
  onBatteriesSnapshot,
  updateBattery,
  onAppSettingsSnapshot,
  saveDailyBatteryRecord,
  getDailyBatteryRecords,
  calculateAndSaveWeeklyAverage,
  calculateAndSaveMonthlyAverage,
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
} from "./ui/card";
import { InventorySummary } from "./inventory-summary";
import { ThemeToggle } from "./theme-toggle";
import { SettingsModal } from "./settings-modal";
import { useMobile } from "@/hooks/use-mobile";
import Papa from "papaparse";
import { Input } from "./ui/input";
import { BatteryReport } from "./battery-report";
import { AiManager } from "./ai-manager";

import { AiOrb } from "./ai-orb";

import { filterBatteries } from "@/lib/search";

export function BatteryDashboard() {
  const { toast } = useToast();
  const isMobile = useMobile();
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiManagerOpen, setIsAiManagerOpen] = useState(false);
  const [batteryToEdit, setBatteryToEdit] = useState<Battery | null>(null);
  const [batteryToDelete, setBatteryToDelete] = useState<string | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const lowStockItems = useMemo(() => batteries.filter(
    (battery) => {
      const totalQuantity = battery.quantity * battery.packSize;
      return battery.location === "gondola" && !battery.discontinued && totalQuantity > 0 && totalQuantity < (appSettings?.lowStockThreshold || 5);
    }
  ), [batteries, appSettings]);

  const outOfStockItems = useMemo(() => batteries.filter(battery => battery.location === "gondola" && !battery.discontinued && battery.quantity * battery.packSize === 0), [batteries]);

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

  const updateBatteryQuantity = async (brand: string, model: string, newQuantity: number) => {
    const battery = batteries.find(b => b.brand === brand && b.model === model);
    if (battery) {
      await updateBattery({ ...battery, quantity: newQuantity });
      toast({
        title: "Sucesso!",
        description: `A quantidade da bateria ${brand} ${model} foi atualizada para ${newQuantity}.`,
      });
    } else {
      toast({
        title: "Erro!",
        description: `Bateria ${brand} ${model} não encontrada.`, 
        variant: "destructive",
      });
      throw new Error(`Battery ${brand} ${model} not found.`);
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

  

  

  const handleGenerateAIReport = async () => {
    try {
      toast({
        title: "Gerando relatório...",
        description: "Aguarde enquanto a IA gera o relatório.",
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Gerar um relatório detalhado sobre o inventário de baterias, incluindo itens em falta, itens com baixo estoque e sugestões de compra. O relatório deve ser formatado em Markdown.",
          history: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader?.read() || { value: undefined, done: true };
        done = readerDone;
        if (value) {
          result += decoder.decode(value);
        }
      }

      const parsedResult = JSON.parse(result.split('\n').filter(Boolean).pop() || '{}');
      const functionCall = parsedResult.functionCalls?.[0];

      if (functionCall && functionCall.name === "generate_report") {
        const markdownContent = functionCall.args.reportContent;

        const tempDiv = document.createElement("div");
        const root = createRoot(tempDiv);
        root.render(<ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>);

        import("html2pdf.js").then(html2pdf => {
          html2pdf.default().from(tempDiv).save("relatorio_ia.pdf");
          toast({
            title: "Sucesso!",
            description: "Relatório gerado e baixado com sucesso.",
          });
        });

      } else {
        toast({
          title: "Erro!",
          description: "A IA não retornou o conteúdo do relatório esperado.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Erro ao gerar relatório com IA:", error);
      toast({
        title: "Erro!",
        description: "Ocorreu um erro ao gerar o relatório com IA.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = () => {
    localStorage.setItem("lowStockItems", JSON.stringify(lowStockItems));
    localStorage.setItem("outOfStockItems", JSON.stringify(outOfStockItems));
    localStorage.setItem("appSettings", JSON.stringify(appSettings));
    window.open("/report", "_blank");
  };

  const handleGenerateSuggestion = () => {
    const prompt = "Com base no inventário atual, nos dados históricos diários, nas médias semanais e nas médias mensais, por favor, sugira quais baterias devo comprar e em que quantidade para manter um estoque ideal. Priorize as médias mensais, depois as semanais e, por fim, os dados diários para uma análise mais detalhada.";
    setAiManagerInitialPrompt(prompt);
    setIsAiManagerOpen(true);
  };

  const handleClearInitialPrompt = () => {
    setAiManagerInitialPrompt(undefined);
  };

  const [aiManagerInitialPrompt, setAiManagerInitialPrompt] = useState<string | undefined>(undefined);

  const totalBatteries = filteredBatteries.reduce((acc, b) => acc + b.quantity, 0);
  const batteryTypesCount = new Set(filteredBatteries.map(b => b.type)).size;


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
                        <RestockSuggestions lowStockItems={lowStockItems} outOfStockItems={outOfStockItems} />
        </div>
        <InventorySummary batteries={filteredBatteries} appSettings={appSettings} />
        
        <BatteryReport onGenerateReport={handleGenerateReport} onGenerateSuggestion={handleGenerateSuggestion} onGenerateAIReport={handleGenerateAIReport} />

        <Card>
            <CardHeader>
                <h2 className="text-2xl font-bold">Inventário Completo</h2>
                <p className="text-muted-foreground">Todas as baterias em sua coleção.</p>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Input 
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <BatteryInventoryTable batteries={filteredBatteries} onEdit={handleOpenEditSheet} onDelete={handleDelete} onQuantityChange={handleQuantityChange} />
            </CardContent>
        </Card>
      </main>

      <AddEditBatterySheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        batteryToEdit={batteryToEdit}
        onSubmit={handleSubmit}
        appSettings={appSettings}
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

      <AiOrb onClick={() => setIsAiManagerOpen(prev => !prev)} />

      {isAiManagerOpen && (
        <div className="fixed bottom-24 right-8 z-50">
          <AiManager 
            addBattery={handleSubmit}
            updateBatteryQuantity={updateBatteryQuantity}
            handleExport={handleExport}
            handleGenerateReport={handleGenerateReport}
            batteries={filteredBatteries}
            initialPrompt={aiManagerInitialPrompt}
            onInitialPromptSent={handleClearInitialPrompt}
          />
        </div>
      )}
    </div>
  );
}
