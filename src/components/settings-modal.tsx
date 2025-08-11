"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [types, setTypes] = useState<string[]>([]);
  const [sizes, setSizes] = useState<number[]>([]);

  useEffect(() => {
    const unsubscribe = onAppSettingsSnapshot((settings) => {
      if (settings) {
        setTypes(settings.batteryTypes);
        setSizes(settings.packSizes);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddType = async () => {
    if (newType && !types.includes(newType)) {
      const updatedTypes = [...types, newType];
      await updateAppSettings({ batteryTypes: updatedTypes, packSizes: sizes });
      toast({ title: "Sucesso!", description: `Tipo de bateria ${newType} adicionado.` });
      setNewType("");
    }
  };

  const handleRemoveType = async (typeToRemove: string) => {
    const updatedTypes = types.filter(t => t !== typeToRemove);
    await updateAppSettings({ batteryTypes: updatedTypes, packSizes: sizes });
    toast({ title: "Sucesso!", description: `Tipo de bateria ${typeToRemove} removido.` });
  };

  const handleAddPackSize = async () => {
    const size = parseInt(newPackSize, 10);
    if (size && !sizes.includes(size)) {
      const updatedSizes = [...sizes, size].sort((a, b) => a - b);
      await updateAppSettings({ batteryTypes: types, packSizes: updatedSizes });
      toast({ title: "Sucesso!", description: `Tamanho de embalagem ${size} adicionado.` });
      setNewPackSize("");
    }
  };

  const handleRemovePackSize = async (sizeToRemove: number) => {
    const updatedSizes = sizes.filter(s => s !== sizeToRemove);
    await updateAppSettings({ batteryTypes: types, packSizes: updatedSizes });
    toast({ title: "Sucesso!", description: `Tamanho de embalagem ${sizeToRemove} removido.` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>Gerencie os tipos de bateria e tamanhos de embalagem.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tipos de Bateria</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {types.map(type => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <button onClick={() => handleRemoveType(type)} className="ml-1 rounded-full hover:bg-muted-foreground/20">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="Novo tipo" onKeyDown={(e) => e.key === 'Enter' && handleAddType()} />
              <Button onClick={handleAddType}>Adicionar</Button>
            </div>
          </div>
          <div>
            <Label>Tamanhos de Embalagem</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {sizes.map(size => (
                <Badge key={size} variant="secondary" className="flex items-center gap-1">
                  {size}
                  <button onClick={() => handleRemovePackSize(size)} className="ml-1 rounded-full hover:bg-muted-foreground/20">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input value={newPackSize} onChange={(e) => setNewPackSize(e.target.value)} type="number" placeholder="Novo tamanho" onKeyDown={(e) => e.key === 'Enter' && handleAddPackSize()} />
              <Button onClick={handleAddPackSize}>Adicionar</Button>
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
