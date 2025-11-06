import { useState, useEffect } from "react";
import { type Battery } from "@/lib/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { EditableQuantity } from "./ui/editable-quantity";
import { BatteryImageOrIcon } from "./battery-image-or-icon";
import { useTranslation } from "../hooks/use-translation";
import { TranslationKey } from "@/lib/translations";
import { useAppSettings } from "@/contexts/app-settings-context";

interface BatteryInventoryTableProps {
  batteries: Battery[];
  onEdit: (battery: Battery) => void;
  onDelete: (id: string) => void;
  onDuplicate: (battery: Battery) => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function BatteryInventoryTable({
  batteries,
  onEdit,
  onDelete,
  onDuplicate,
  onQuantityChange,
  onSelectionChange,
}: BatteryInventoryTableProps) {
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

  const handleSort = (column: keyof Battery) => {
    if (sortPriority[0] === column) {
        setSortDirections(prevDirections => ({
            ...prevDirections,
            [column]: prevDirections[column] === 'asc' ? 'desc' : 'asc'
        }));
    } else {
        const newPriority = [column, ...sortPriority.filter(p => p !== column)];
        setSortPriority(newPriority);
        setSortDirections(prevDirections => ({
            ...prevDirections,
            [column]: 'asc'
        }));
    }
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedBatteries(sortedBatteries.map((battery) => battery.id));
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
    selectedBatteries.length === sortedBatteries.length && sortedBatteries.length > 0;
  const isIndeterminate =
    selectedBatteries.length > 0 && !isAllSelected;

  return (
    <div className="overflow-x-auto rounded-lg border border-opacity-50 bg-card/50 backdrop-blur-lg">
      <table className="min-w-full divide-y divide-border">
        <thead className="">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
            >
              <Checkbox
                checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
                onCheckedChange={handleSelectAll}
                aria-label="Selecionar todas as linhas"
              />
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("brand")}
            >
              <div className="flex items-center">
                Marca
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("model")}
            >
              <div className="flex items-center">
                Modelo
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("type")}
            >
              <div className="flex items-center">
                Tipo
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider"
            >
              Código de Barras
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("packSize")}
            >
              <div className="flex items-center">
                Embalagem
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("quantity")}
            >
              <div className="flex items-center justify-center">
                Quantidade
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("location")}
            >
              <div className="flex items-center">
                Localização
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedBatteries.map((battery) => {
            const gondolaLimit = battery.gondolaCapacity !== undefined
              ? battery.gondolaCapacity
              : (appSettings?.gondolaCapacity || 0);

            const isLowStock = battery.location === "gondola" && battery.quantity <= gondolaLimit / 2;

            return (
              <TableRow
                key={battery.id}
                className={isLowStock ? "bg-red-700/30" : ""}
                data-state={selectedBatteries.includes(battery.id) ? "selected" : ""}
              >
              <TableCell>
                <Checkbox
                  checked={selectedBatteries.includes(battery.id)}
                  onCheckedChange={() => handleSelect(battery.id)}
                  aria-label={`Selecionar ${battery.brand} ${battery.model}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <BatteryImageOrIcon
                    imageUrl={battery.imageUrl}
                    alt={battery.brand}
                    batteryType={battery.type || ''}
                    width={40}
                    height={40}
                    className="object-cover rounded-md"
                  />
                  {battery.brand}
                </div>
              </TableCell>
              <TableCell>{battery.model}</TableCell>
              <TableCell>{battery.type}</TableCell>
              <TableCell>{battery.barcode}</TableCell>
              <TableCell>{battery.packSize}</TableCell>
              <TableCell className="text-center">
                <EditableQuantity
                  value={battery.quantity}
                  onChange={(newQuantity) => onQuantityChange(battery.id, newQuantity)}
                  variant="default"
                />
              </TableCell>
              <TableCell>
                {battery.location === 'gondola' && battery.gondola 
                  ? `${t(`location:${battery.location}` as TranslationKey)} - ${battery.gondola}`
                  : t(`location:${battery.location}` as TranslationKey)}
              </TableCell>
              <TableCell className="text-right">
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
              </TableCell>
            </TableRow>
          )})}
        </tbody>
      </table>
    </div>
  );
}
