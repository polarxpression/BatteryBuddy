"use client";

import { useState, useMemo } from "react";
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

import { useAppSettings } from "@/contexts/app-settings-context";

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: string[];
  packSizes: string[];
  batteries: Battery[];
}

export function GenerateReportModal({
  isOpen,
  onClose,
  brands,
  packSizes,
  batteries,
}: GenerateReportModalProps) {
  const { appSettings } = useAppSettings();
  
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPackSizes, setSelectedPackSizes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredBatteries = useMemo(() => {
    return batteries.filter(battery => {
      const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(battery.brand);
      const packSizeMatch = selectedPackSizes.length === 0 || selectedPackSizes.includes(battery.packSize.toString());
      return brandMatch && packSizeMatch;
    });
  }, [batteries, selectedBrands, selectedPackSizes]);



  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      console.log('Filtered batteries:', filteredBatteries);

      const batteriesToReport = filteredBatteries
        .filter(battery => !battery.discontinued)
        .filter(battery => {
          const gondolaLimit = (battery.gondolaCapacity && battery.gondolaCapacity > 0) ? battery.gondolaCapacity : (appSettings?.gondolaCapacity || 0);
          return battery.quantity <= gondolaLimit / 2;
        })
        .map(battery => {
          const gondolaLimit = (battery.gondolaCapacity && battery.gondolaCapacity > 0) ? battery.gondolaCapacity : (appSettings?.gondolaCapacity || 0);
          const neededQuantity = gondolaLimit - battery.quantity;
          return { ...battery, quantity: neededQuantity > 0 ? neededQuantity : 0 };
        });

      console.log('Batteries to report:', batteriesToReport);

      const reportData = {
        batteries: batteriesToReport,
        selectedBrands,
        selectedPackSizes,
      };

      console.log('Report data:', reportData);

      localStorage.setItem('reportData', JSON.stringify(reportData));

      // Navigate to the report view page
      window.location.href = '/report/view';
      
      onClose(); // Close modal after opening new tab
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
      <DialogContent className="sm:max-w-md h-[85vh] p-0 bg-polar-1 text-polar-6">
        <DialogHeader className="px-6 py-4 border-b border-polar-4">
          <DialogTitle>Gerar Relatório</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {filteredBatteries.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>There is no batteries to purchase with the selected filters.</p>
            </div>
          ) : (
            <form id="reportForm" className="space-y-6 py-4">




<div className="space-y-4 p-4 rounded-lg bg-polar-2">
              <div className="flex justify-between items-center">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Marcas de Bateria</div>
                <label 
                  className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-polar-7"
                  onClick={handleSelectAllBrands}
                >
                  <span className="w-4 h-4 border rounded flex items-center justify-center transition hover:border-polar-7">
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
                                            className="flex items-center py-2 px-3 border rounded-md cursor-pointer transition text-sm peer-checked:border-polar-7 peer-checked:bg-polar-7 peer-checked:text-white bg-card border text-white transition hover:bg-card/80"                    >
                      <span className="w-4 h-4 border rounded mr-2 flex items-center justify-center transition peer-checked:bg-polar-7 peer-checked:border-polar-7">
                        {selectedBrands.includes(brand) && <Check className="h-3 w-3 text-white" />}
                      </span>
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground italic">Selecione as marcas que você quer incluir no relatório</div>
            </div>

            <div className="border-t my-6 border-polar-4"></div>

<div className="space-y-4 p-4 rounded-lg bg-polar-2">
              <div className="flex justify-between items-center">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtro de Tamanho do Pacote</div>
                <label 
                  className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-polar-7"
                  onClick={handleSelectAllPackSizes}
                >
                  <span className="w-4 h-4 border rounded flex items-center justify-center transition hover:border-polar-7">
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
                      className="flex items-center py-2 px-3 border rounded-md cursor-pointer transition text-sm peer-checked:border-polar-7 peer-checked:bg-polar-7 peer-checked:text-white bg-card border text-white transition hover:bg-card/80"
                    >
                      <span className="w-4 h-4 border rounded mr-2 flex items-center justify-center transition peer-checked:bg-polar-7 peer-checked:border-polar-7">
                        {selectedPackSizes.includes(size) && <Check className="h-3 w-3 text-white" />}
                      </span>
                      {size} Pack
                    </label>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground italic">Filtrar por tamanhos de pacote de bateria</div>
            </div>
          </form>
          )}
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-polar-4">
          <Button variant="outline" onClick={onClose} className="border-red-500 text-red-500 hover:bg-red-500/10">
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="bg-card border text-white transition"
          >
            {isGenerating ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}