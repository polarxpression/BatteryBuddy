"use client";

import { useState, useEffect } from "react";
import { type Battery } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Copy, ArrowUp, ArrowDown } from "lucide-react";
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
import { useAppSettings } from "@/contexts/app-settings-context";

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
  const [sortPriority, setSortPriority] = useState<Array<keyof Battery>>(['brand', 'model', 'type', 'packSize', 'quantity', 'location']);
  const [sortDirections, setSortDirections] = useState<{[key in keyof Battery]?: 'asc' | 'desc'}>({
    brand: 'asc',
    model: 'asc',
    type: 'asc',
    packSize: 'asc',
    quantity: 'asc',
    location: 'asc'
  });
  const [selectedBatteries, setSelectedBatteries] = useState<string[]>([]);
  const { t } = useTranslation();
  const { appSettings } = useAppSettings();

  useEffect(() => {
    onSelectionChange?.(selectedBatteries);
  }, [selectedBatteries, onSelectionChange]);

  const handleSort = (column: keyof Battery) => {
    if (sortPriority[0] !== column) {
        const newPriority = [column, ...sortPriority.filter(p => p !== column)];
        setSortPriority(newPriority);
        setSortDirections(prevDirections => ({
            ...prevDirections,
            [column]: 'asc'
        }));
    }
  };

  const toggleSortDirection = () => {
    const primaryColumn = sortPriority[0];
    setSortDirections(prevDirections => ({
        ...prevDirections,
        [primaryColumn]: prevDirections[primaryColumn] === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedBatteries = [...batteries].sort((a, b) => {
    for (const column of sortPriority) {
        const aValue = a[column];
        const bValue = b[column];
        const direction = sortDirections[column] || 'asc';

        let comparison = 0;
        if (aValue === null || aValue === undefined) comparison = 1;
        else if (bValue === null || bValue === undefined) comparison = -1;
        else if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
        }

        if (comparison !== 0) {
            return direction === 'asc' ? comparison : -comparison;
        }
    }
    return 0;
  });

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
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
            onCheckedChange={handleSelectAll}
            aria-label="Selecionar todas as linhas"
          />
          <span className="text-sm font-medium text-foreground">Selecionar Todos</span>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                {t(sortPriority[0] as TranslationKey)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              {['brand', 'model', 'type', 'packSize', 'quantity', 'location'].map(column => (
                <DropdownMenuItem key={column} onClick={() => handleSort(column as keyof Battery)}>
                  {t(column as TranslationKey)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" onClick={toggleSortDirection}>
            {sortDirections[sortPriority[0]] === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {sortedBatteries.map((battery) => {
        const gondolaLimit = battery.gondolaCapacity !== undefined
          ? battery.gondolaCapacity
          : (appSettings?.gondolaCapacity || 0);

        const isLowStock = battery.location === "gondola" && battery.quantity <= gondolaLimit / 2;

        return (
          <div
            key={battery.id}
            className={`rounded-lg border border-border bg-card/50 backdrop-blur-lg p-4 shadow-sm ${isLowStock ? "bg-red-700/30" : ""}`}
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
      )})}
    </div>
  );
}
