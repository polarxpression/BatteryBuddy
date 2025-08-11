"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { Badge } from "./ui/badge";
import { onAppSettingsSnapshot, updateAppSettings } from "@/lib/firebase";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { toast } = useToast();
  const [newType, setNewType] = useState("");
  const [newPackSize, setNewPackSize] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [sizes, setSizes] = useState<number[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAppSettingsSnapshot((settings) => {
      if (settings) {
        setTypes(settings.batteryTypes);
        setSizes(settings.packSizes);
        setBrands(settings.batteryBrands);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddType = async () => {
    if (newType && !types.includes(newType)) {
      const updatedTypes = [...types, newType];
      await updateAppSettings({ batteryTypes: updatedTypes, packSizes: sizes, batteryBrands: brands });
      toast({ title: "Sucesso!", description: `Tipo de bateria ${newType} adicionado.` });
      setNewType("");
    }
  };

  const handleRemoveType = async (typeToRemove: string) => {
    const updatedTypes = types.filter(t => t !== typeToRemove);
    await updateAppSettings({ batteryTypes: updatedTypes, packSizes: sizes, batteryBrands: brands });
    toast({ title: "Sucesso!", description: `Tipo de bateria ${typeToRemove} removido.` });
  };

  const handleAddPackSize = async () => {
    const size = parseInt(newPackSize, 10);
    if (size && !sizes.includes(size)) {
      const updatedSizes = [...sizes, size].sort((a, b) => a - b);
      await updateAppSettings({ batteryTypes: types, packSizes: updatedSizes, batteryBrands: brands });
      toast({ title: "Sucesso!", description: `Tamanho de embalagem ${size} adicionado.` });
      setNewPackSize("");
    }
  };

  const handleRemovePackSize = async (sizeToRemove: number) => {
    const updatedSizes = sizes.filter(s => s !== sizeToRemove);
    await updateAppSettings({ batteryTypes: types, packSizes: updatedSizes, batteryBrands: brands });
    toast({ title: "Sucesso!", description: `Tamanho de embalagem ${sizeToRemove} removido.` });
  };

  const handleAddBrand = async () => {
    if (newBrand && !brands.includes(newBrand)) {
      const updatedBrands = [...brands, newBrand];
      await updateAppSettings({ batteryTypes: types, packSizes: sizes, batteryBrands: updatedBrands });
      toast({ title: "Sucesso!", description: `Marca ${newBrand} adicionada.` });
      setNewBrand("");
    }
  };

  const handleRemoveBrand = async (brandToRemove: string) => {
    const updatedBrands = brands.filter(b => b !== brandToRemove);
    await updateAppSettings({ batteryTypes: types, packSizes: sizes, batteryBrands: updatedBrands });
    toast({ title: "Sucesso!", description: `Marca ${brandToRemove} removida.` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>Gerencie os tipos de bateria, tamanhos de embalagem e marcas.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Tipos de Bateria</h3>
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1 pr-1">
                  {type}
                  <button
                    onClick={() => handleRemoveType(type)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    aria-label={`Remover tipo ${type}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Novo tipo de bateria"
                onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                className="flex-grow"
              />
              <Button onClick={handleAddType} className="shrink-0">Adicionar</Button>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Tamanhos de Embalagem</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <Badge key={size} variant="secondary" className="flex items-center gap-1 pr-1">
                  {size}
                  <button
                    onClick={() => handleRemovePackSize(size)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    aria-label={`Remover tamanho ${size}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newPackSize}
                onChange={(e) => setNewPackSize(e.target.value)}
                type="number"
                placeholder="Novo tamanho de embalagem"
                onKeyDown={(e) => e.key === 'Enter' && handleAddPackSize()}
                className="flex-grow"
              />
              <Button onClick={handleAddPackSize} className="shrink-0">Adicionar</Button>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Marcas de Bateria</h3>
            <div className="flex flex-wrap gap-2">
              {brands.map(brand => (
                <Badge key={brand} variant="secondary" className="flex items-center gap-1 pr-1">
                  {brand}
                  <button
                    onClick={() => handleRemoveBrand(brand)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                    aria-label={`Remover marca ${brand}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="Nova marca de bateria"
                onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
                className="flex-grow"
              />
              <Button onClick={handleAddBrand} className="shrink-0">Adicionar</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
