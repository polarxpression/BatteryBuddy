import { useState } from "react";
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

interface BatteryInventoryTableProps {
  batteries: Battery[];
  onEdit: (battery: Battery) => void;
  onDelete: (id: string) => void;
  onDuplicate: (battery: Battery) => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
}

export function BatteryInventoryTable({
  batteries,
  onEdit,
  onDelete,
  onDuplicate,
  onQuantityChange,
}: BatteryInventoryTableProps) {
  const [sortColumn, setSortColumn] = useState<keyof Battery | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { t } = useTranslation();

  const sortedBatteries = [...batteries].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    // Fallback for other types or mixed types
    return 0;
  });

  const handleSort = (column: keyof Battery) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              <Checkbox />
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("brand")}
            >
              <div className="flex items-center">
                Marca
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("model")}
            >
              <div className="flex items-center">
                Modelo
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("type")}
            >
              <div className="flex items-center">
                Tipo
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Código de Barras
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("packSize")}
            >
              <div className="flex items-center">
                Embalagem
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort("quantity")}
            >
              <div className="flex items-center">
                Quantidade
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedBatteries.map((battery) => (
            <TableRow key={battery.id} className={battery.location === "gondola" && battery.gondolaCapacity !== undefined && battery.quantity <= battery.gondolaCapacity / 2 ? "bg-red-50/50" : ""}>
              <TableCell className="text-center font-medium">
                <Checkbox />
              </TableCell>
              <TableCell className="text-center font-medium">
                <div className="flex items-center gap-2 justify-center">
                  <BatteryImageOrIcon
                    imageUrl={battery.imageUrl}
                    alt={battery.brand}
                    batteryType={battery.type}
                    width={40}
                    height={40}
                    className="object-cover rounded-md"
                  />
                  {battery.brand}
                </div>
              </TableCell>
              <TableCell className="text-center">{battery.model}</TableCell>
              <TableCell className="text-center">{battery.type}</TableCell>
              <TableCell className="text-center">{battery.barcode}</TableCell>
              <TableCell className="text-center">{battery.packSize}</TableCell>
              <TableCell className="text-center">
                <EditableQuantity
                  value={battery.quantity}
                  onChange={(newQuantity) => onQuantityChange(battery.id, newQuantity)}
                  variant="default"
                />
              </TableCell>
              <TableCell className="text-center">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
