"use client";

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
import { AppSettings } from "@/lib/types";
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
  appSettings: AppSettings | null;
}

export function BatteryInventoryTableMobile({
  batteries,
  onEdit,
  onDuplicate,
  onDelete,
  onQuantityChange,
  appSettings,
}: BatteryInventoryTableMobileProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4">
      {batteries.map((battery) => (
        <div
          key={battery.id}
          className={`rounded-lg border p-4 shadow-sm ${battery.location === "gondola" && battery.quantity <= (battery.lowStockThreshold !== undefined ? battery.lowStockThreshold : (appSettings?.lowStockThreshold || 5)) ? "bg-red-50/50" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BatteryImageOrIcon
                imageUrl={battery.imageUrl}
                alt={battery.brand}
                batteryType={battery.type}
                width={40}
                height={40}
                className="object-cover rounded-md"
              />
              <div>
                <p className="font-medium">{battery.brand}</p>
                <p className="text-sm text-gray-500">{battery.type}</p>
                <p className="text-sm text-gray-500">Tamanho do Pacote: {battery.packSize}</p>
                <p className="text-xs text-muted-foreground">Localização: {t(`location:${battery.location}` as TranslationKey)}</p>
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
