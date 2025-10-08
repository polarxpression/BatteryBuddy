"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Battery } from "@/lib/types";

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: { layout: string; selectedBrands: string[]; selectedPackSizes: string[]; batteries: Battery[] }) => void;
  brands: string[];
  packSizes: string[];
  batteries: Battery[];
}

export function GenerateReportModal({
  isOpen,
  onClose,
  onGenerate,
  brands,
  packSizes,
  batteries,
}: GenerateReportModalProps) {
  const [layout, setLayout] = useState("grid");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPackSizes, setSelectedPackSizes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const layoutOptions = [
    { value: "grid", label: "Grade" },
    { value: "single", label: "Página Única" },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate({
        layout,
        selectedBrands,
        selectedPackSizes,
        batteries,
      });
      onClose(); // Close modal after successful generation
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  const handlePackSizeChange = (size: string) => {
    setSelectedPackSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  const handleSelectAllBrands = () => {
    setSelectedBrands(selectedBrands.length === brands.length ? [] : brands);
  };

  const handleSelectAllPackSizes = () => {
    setSelectedPackSizes(selectedPackSizes.length === packSizes.length ? [] : packSizes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[85vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Gerar Relatório</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <form id="reportForm" className="space-y-6 py-4">


            <div className="space-y-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opções de Layout</div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {layoutOptions.map(({ value, label }) => (
                  <div key={value} className="flex-1">
                    <input 
                      type="radio" 
                      id={`layout-${value}`} 
                      name="layout" 
                      value={value} 
                      className="sr-only" 
                      checked={layout === value} 
                      onChange={() => setLayout(value)} 
                    />
                    <label 
                      htmlFor={`layout-${value}`} 
                      className={`flex items-center justify-center py-2 px-3 border-2 rounded-md cursor-pointer text-sm font-medium transition ${
                        layout === value 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t my-6"></div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Marcas de Bateria</div>
                <label 
                  className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  onClick={handleSelectAllBrands}
                >
                  <span className="w-4 h-4 border rounded flex items-center justify-center transition hover:border-primary">
                    {selectedBrands.length === brands.length && <Check className="h-3 w-3" />}
                  </span>
                  Selecionar Todas
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {brands.map((brand) => (
                  <div key={brand}>
                    <input 
                      type="checkbox" 
                      id={`brand-${brand}`} 
                      name="brands" 
                      value={brand} 
                      className="sr-only peer" 
                      checked={selectedBrands.includes(brand)} 
                      onChange={() => handleBrandChange(brand)} 
                    />
                    <label 
                      htmlFor={`brand-${brand}`} 
                      className="flex items-center py-2 px-3 border rounded-md cursor-pointer transition text-sm peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="w-4 h-4 border rounded mr-2 flex items-center justify-center transition peer-checked:bg-primary peer-checked:border-primary">
                        {selectedBrands.includes(brand) && <Check className="h-3 w-3 text-primary-foreground" />}
                      </span>
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground italic">Selecione as marcas que você quer incluir no relatório</div>
            </div>

            <div className="border-t my-6"></div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtro de Tamanho do Pacote</div>
                <label 
                  className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  onClick={handleSelectAllPackSizes}
                >
                  <span className="w-4 h-4 border rounded flex items-center justify-center transition hover:border-primary">
                    {selectedPackSizes.length === packSizes.length && <Check className="h-3 w-3" />}
                  </span>
                  Selecionar Todos
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {packSizes.map((size) => (
                  <div key={size}>
                    <input 
                      type="checkbox" 
                      id={`pack-${size}`} 
                      name="packSize" 
                      value={size} 
                      className="sr-only peer" 
                      checked={selectedPackSizes.includes(size)} 
                      onChange={() => handlePackSizeChange(size)} 
                    />
                    <label 
                      htmlFor={`pack-${size}`} 
                      className="flex items-center py-2 px-3 border rounded-md cursor-pointer transition text-sm peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="w-4 h-4 border rounded mr-2 flex items-center justify-center transition peer-checked:bg-primary peer-checked:border-primary">
                        {selectedPackSizes.includes(size) && <Check className="h-3 w-3 text-primary-foreground" />}
                      </span>
                      {size} Pack
                    </label>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground italic">Filtrar por tamanhos de pacote de bateria</div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="bg-primary hover:bg-primary/90"
          >
            {isGenerating ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}