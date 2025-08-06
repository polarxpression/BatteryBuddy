"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function Settings() {
  const { toast } = useToast();
  const [newType, setNewType] = useState("");
  const [newPackSize, setNewPackSize] = useState("");

  const handleAddType = () => {
    console.log("New type:", newType);
    toast({ title: "Sucesso!", description: `Tipo de bateria ${newType} adicionado.` });
    setNewType("");
  };

  const handleAddPackSize = () => {
    console.log("New pack size:", newPackSize);
    toast({ title: "Sucesso!", description: `Tamanho de embalagem ${newPackSize} adicionado.` });
    setNewPackSize("");
  };

  return (
    <div className="space-y-4 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Tipo de Bateria</CardTitle>
          <CardDescription>Adicione um novo tipo de bateria para ser usado no inventário.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="w-full">
            <Label htmlFor="new-type">Novo Tipo</Label>
            <Input id="new-type" value={newType} onChange={(e) => setNewType(e.target.value)} />
          </div>
          <Button onClick={handleAddType} className="self-end">Adicionar</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Tamanho de Embalagem</CardTitle>
          <CardDescription>Adicione um novo tamanho de embalagem para ser usado no inventário.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="w-full">
            <Label htmlFor="new-pack-size">Novo Tamanho</Label>
            <Input id="new-pack-size" type="number" value={newPackSize} onChange={(e) => setNewPackSize(e.target.value)} />
          </div>
          <Button onClick={handleAddPackSize} className="self-end">Adicionar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
