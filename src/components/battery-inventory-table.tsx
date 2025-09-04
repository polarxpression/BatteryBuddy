"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Minus } from "lucide-react";
import { BatteryIcon } from "./icons/battery-icon";
import { type Battery } from "@/lib/types";
import { Badge } from "./ui/badge";
import { EditableQuantity } from "./ui/editable-quantity";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";


interface BatteryInventoryTableProps {
    batteries: Battery[];
    onEdit: (battery: Battery) => void;
    onDelete: (id: string) => void;
    onQuantityChange: (id: string, newQuantity: number) => void;
}

export function BatteryInventoryTable({ batteries, onEdit, onDelete, onQuantityChange }: BatteryInventoryTableProps) {
    

    const getQuantityBadgeVariant = (quantity: number): "default" | "destructive" | "secondary" => {
        if (quantity === 0) return "destructive";
        if (quantity < 5) return "secondary";
        return "default";
    };
    
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Ícone</span>
                        </TableHead>
                        <TableHead>Marca & Modelo</TableHead>
                        <TableHead>Código de Barras</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Embalagem</TableHead>
                        <TableHead className="min-w-[100px] text-right">Quantidade</TableHead>
                        <TableHead className={`text-right`}>Total</TableHead>
                        <TableHead>
                            <span className="sr-only">Ações</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {batteries.length > 0 ? (
                    batteries.map((battery) => (
                    <TableRow key={battery.id}>
                        <TableCell className="hidden sm:table-cell">
                            <BatteryIcon type={battery.type} className="h-8 w-8 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="font-medium">
                            <div className="font-bold">{battery.brand}</div>
                            <div className="text-sm">{battery.model}</div>
                        </TableCell>
                        <TableCell>
                            {battery.barcode}
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{battery.type}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{battery.packSize}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className={`flex items-center justify-end gap-1 md:gap-2`}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => onQuantityChange(battery.id, battery.quantity - 1)}
                                    disabled={battery.quantity === 0}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <EditableQuantity
                                    value={battery.quantity}
                                    onChange={(newQuantity) => onQuantityChange(battery.id, newQuantity)}
                                    variant={getQuantityBadgeVariant(battery.quantity)}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => onQuantityChange(battery.id, battery.quantity + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                        <TableCell className={`text-right font-medium`}>
                            {battery.quantity * battery.packSize}
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Menu de alternância</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => onEdit(battery)}>Editar</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onDelete(battery.id)}>Excluir</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            Nenhuma bateria encontrada.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    );
}
