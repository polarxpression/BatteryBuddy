"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { AppSettings } from "@/lib/types";
import { updateAppSettings, db } from "@/lib/firebase";
import { doc, updateDoc, deleteField } from "firebase/firestore";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appSettings: AppSettings | null;
}

export function SettingsModal({ open, onOpenChange, appSettings }: SettingsModalProps) {
  const { toast } = useToast();
  const [newType, setNewType] = useState("");
  const [newPackSize, setNewPackSize] = useState("");
  const [newBrand, setNewBrand] = useState("");

  const [newModel, setNewModel] = useState("");
  const [types, setTypes] = useState<Record<string, string>>({});
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [brands, setBrands] = useState<Record<string, string>>({});
  const [models, setModels] = useState<Record<string, string>>({});
  const [gondolaCapacity, setgondolaCapacity] = useState(appSettings?.gondolaCapacity || 5);

  useEffect(() => {
    if (appSettings) {
      setTypes(appSettings.batteryTypes || {});
      setSizes(appSettings.packSizes || {});
      setBrands(appSettings.batteryBrands || {});
      setModels(appSettings.batteryModels || {});
      setgondolaCapacity(appSettings.gondolaCapacity || 5);
    }
  }, [appSettings]);



  const handleUpdategondolaCapacity = async () => {
    const newThresholdString = (document.getElementById('gondolaCapacityInput') as HTMLInputElement).value;
    const newThreshold = parseInt(newThresholdString, 10);

    if (isNaN(newThreshold) || newThreshold < 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um número válido e não negativo para a capacidade máxima da gôndola.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAppSettings({ gondolaCapacity: newThreshold });
      toast({ title: "Sucesso!", description: `Capacidade máxima da gôndola atualizada para ${newThreshold}.` });
    } catch (error) {
      console.error("Failed to update gondola capacity:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar a capacidade máxima da gôndola. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    }
  };

  const handleAddType = async () => {
    if (newType && !types[newType]) {
      const updatedTypes = { ...types, [newType]: newType };
      await updateAppSettings({ batteryTypes: updatedTypes });
      toast({ title: "Sucesso!", description: `Tipo de bateria ${newType} adicionado.` });
      setNewType("");
    }
  };

  const handleRemoveType = async (typeToRemove: string) => {
    const settingsRef = doc(db, "settings", "app-settings");
    await updateDoc(settingsRef, {
      [`batteryTypes.${typeToRemove}`]: deleteField()
    });
    toast({ title: "Sucesso!", description: `Tipo de bateria ${typeToRemove} removido.` });
  };

  const handleAddPackSize = async () => {
    const size = parseInt(newPackSize, 10);
    if (size && !Object.values(sizes).includes(size)) {
      const updatedSizes = { ...sizes, [newPackSize]: size };
      await updateAppSettings({ packSizes: updatedSizes });
      toast({ title: "Sucesso!", description: `Tamanho de embalagem ${size} adicionado.` });
      setNewPackSize("");
    }
  };

  const handleRemovePackSize = async (sizeToRemove: number) => {
    const keyToRemove = Object.keys(sizes).find(key => sizes[key] === sizeToRemove);
      if (keyToRemove) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [keyToRemove]: _, ...updatedSizes } = sizes;
        await updateAppSettings({ packSizes: updatedSizes });
        toast({ title: "Sucesso!", description: `Tamanho de embalagem ${sizeToRemove} removido.` });
      }
  };

  const handleAddBrand = async () => {
    if (newBrand && !brands[newBrand]) {
      const updatedBrands = { ...brands, [newBrand]: newBrand };
      await updateAppSettings({ batteryBrands: updatedBrands });
      toast({ title: "Sucesso!", description: `Marca ${newBrand} adicionada.` });
      setNewBrand("");
    }
  };

  const handleRemoveBrand = async (brandToRemove: string) => {
    const settingsRef = doc(db, "settings", "app-settings");
    await updateDoc(settingsRef, {
      [`batteryBrands.${brandToRemove}`]: deleteField()
    });
    toast({ title: "Sucesso!", description: `Marca ${brandToRemove} removida.` });
  };

  const handleAddModel = async () => {
    if (newModel && !models[newModel]) {
      const updatedModels = { ...models, [newModel]: newModel };
      await updateAppSettings({ batteryModels: updatedModels });
      toast({ title: "Sucesso!", description: `Modelo ${newModel} adicionado.` });
      setNewModel("");
    }
  };

  const handleRemoveModel = async (modelToRemove: string) => {
    const settingsRef = doc(db, "settings", "app-settings");
    await updateDoc(settingsRef, {
      [`batteryModels.${modelToRemove}`]: deleteField()
    });
    toast({ title: "Sucesso!", description: `Modelo ${modelToRemove} removido.` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>Gerencie os tipos de bateria, tamanhos de embalagem e marcas.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Bateria</CardTitle>
              <CardDescription>Gerencie os tipos de bateria disponíveis para seus registros.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                {Object.keys(types).length > 0 ? (
                  Object.keys(types).map(type => (
                    <Badge key={type} variant="secondary" className="flex items-center gap-1 pr-1">
                      {type}
                      <button
                        onClick={() => handleRemoveType(type)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                        aria-label={`Remover tipo '${type}'`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum tipo de bateria adicionado ainda.</p>
                )}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tamanhos de Embalagem</CardTitle>
              <CardDescription>Defina os tamanhos de embalagem para suas baterias.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                {Object.values(sizes).length > 0 ? (
                  Object.values(sizes).sort((a,b) => a-b).map(size => (
                    <Badge key={size} variant="secondary" className="flex items-center gap-1 pr-1">
                      {size}
                      <button
                        onClick={() => handleRemovePackSize(size)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                        aria-label={`Remover tamanho '${size}'`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum tamanho de embalagem adicionado ainda.</p>
                )}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marcas de Bateria</CardTitle>
              <CardDescription>Gerencie as marcas de bateria que você utiliza.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                {Object.keys(brands).length > 0 ? (
                  Object.keys(brands).map(brand => (
                    <Badge key={brand} variant="secondary" className="flex items-center gap-1 pr-1">
                      {brand}
                      <button
                        onClick={() => handleRemoveBrand(brand)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                        aria-label={`Remover marca '${brand}'`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma marca de bateria adicionada ainda.</p>
                )}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modelos de Bateria</CardTitle>
              <CardDescription>Gerencie os modelos de bateria que você utiliza.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                {Object.keys(models).length > 0 ? (
                  Object.keys(models).map(model => (
                    <Badge key={model} variant="secondary" className="flex items-center gap-1 pr-1">
                      {model}
                      <button
                        onClick={() => handleRemoveModel(model)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                        aria-label={`Remover modelo '${model}'`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum modelo de bateria adicionado ainda.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="Novo modelo de bateria"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddModel()}
                  className="flex-grow"
                />
                <Button onClick={handleAddModel} className="shrink-0">Adicionar</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Capacidade Máxima da Gôndola</CardTitle>
              <CardDescription>Defina a capacidade máxima de baterias na gôndola.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex gap-2">
                <Input
                  id="gondolaCapacityInput"
                  value={gondolaCapacity}
                  onChange={(e) => setgondolaCapacity(parseInt(e.target.value, 10))}                  type="number"
                  placeholder="Capacidade máxima da gôndola"
                  className="flex-grow"
                />
                <Button onClick={handleUpdategondolaCapacity} className="shrink-0">Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
