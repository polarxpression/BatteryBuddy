"use client";

import { useState, useEffect } from "react";
import { type Battery } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

import { EditableQuantity } from "./ui/editable-quantity";
import { BatteryImageOrIcon } from "./battery-image-or-icon";
import { useTranslation } from "../hooks/use-translation";
import { TranslationKey } from "@/lib/translations";

interface BatteryInventoryTableMobileProps {
  batteries: Battery[];
  onEdit: (battery: Battery) => void;
  onDuplicate: (battery: Battery) => void;
  onDelete: (id: string) => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function BatteryInventoryTableMobile({
  batteries,
  onEdit,
  onDuplicate,
  onDelete,
  onQuantityChange,
  onSelectionChange,
}: BatteryInventoryTableMobileProps) {
  const [selectedBatteries, setSelectedBatteries] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    onSelectionChange?.(selectedBatteries);
  }, [selectedBatteries, onSelectionChange]);

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedBatteries(batteries.map((battery) => battery.id));
    } else {
      setSelectedBatteries([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedBatteries((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    selectedBatteries.length === batteries.length && batteries.length > 0;
  const isIndeterminate =
    selectedBatteries.length > 0 && !isAllSelected;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex items-center justify-between px-4 py-2 bg-card/50 backdrop-blur-lg rounded-lg">
        <Checkbox
          checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
          onCheckedChange={handleSelectAll}
          aria-label="Selecionar todas as linhas"
        />
        <span className="text-sm font-medium text-foreground">Selecionar Todos</span>
      </div>
      {batteries.map((battery) => (
        <div
          key={battery.id}
          className={`rounded-lg border border-border bg-card/50 backdrop-blur-lg p-4 shadow-sm ${battery.location === "gondola" && battery.gondolaCapacity !== undefined && battery.quantity <= battery.gondolaCapacity / 2 ? "bg-red-700/30" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div className="h-full flex items-center gap-2">
              <Checkbox
                checked={selectedBatteries.includes(battery.id)}
                onCheckedChange={() => handleSelect(battery.id)}
                aria-label={`Selecionar ${battery.brand} ${battery.model}`}
                className="mr-2"
              />
              <BatteryImageOrIcon
                imageUrl={battery.imageUrl}
                alt={battery.brand}
                batteryType={battery.type || ''}
                width={40}
                height={40}
                className="object-cover rounded-md"
              />
              <div>
                <p className="font-medium text-foreground">{battery.brand}</p>
                <p className="text-sm text-muted-foreground">{battery.type}</p>
                <p className="text-sm text-muted-foreground">{battery.model}</p>
                <p className="text-sm text-muted-foreground">Tamanho do Pacote: {battery.packSize}</p>
                <p className="text-xs text-muted-foreground">Localização: {battery.location === 'gondola' && battery.gondolaName ? `${t(`location:${battery.location}` as TranslationKey)} - ${battery.gondolaName}` : t(`location:${battery.location}` as TranslationKey)}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(battery)}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(battery)}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(battery.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">Código de Barras: {battery.barcode}</p>
            <EditableQuantity
              value={battery.quantity}
              onChange={(newQuantity) => onQuantityChange(battery.id, newQuantity)}
              variant="default"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
