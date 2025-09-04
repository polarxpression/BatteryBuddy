"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface BatteryInventoryTableMobileProps {
    batteries: Battery[];
    onEdit: (battery: Battery) => void;
    onDelete: (id: string) => void;
    onQuantityChange: (id: string, newQuantity: number) => void;
}

export function BatteryInventoryTableMobile({ batteries, onEdit, onDelete, onQuantityChange }: BatteryInventoryTableMobileProps) {
    const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([]);

    const toggleCollapsible = (id: string) => {
        setOpenCollapsibles(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const getQuantityBadgeVariant = (quantity: number): "default" | "destructive" | "secondary" => {
        if (quantity === 0) return "destructive";
        if (quantity < 5) return "secondary";
        return "default";
    };
    
    return (
        <div className="w-full">
            {batteries.length > 0 ? (
                batteries.map((battery) => (
                    <Collapsible key={battery.id} open={openCollapsibles.includes(battery.id)} onOpenChange={() => toggleCollapsible(battery.id)} className="border-b">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <BatteryIcon type={battery.type} className="h-8 w-8 text-muted-foreground" />
                                <div className="font-medium">
                                    <div className="font-bold">{battery.brand}</div>
                                    <div className="text-sm">{battery.model}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <EditableQuantity
                                    value={battery.quantity}
                                    onChange={(newQuantity) => onQuantityChange(battery.id, newQuantity)}
                                    variant={getQuantityBadgeVariant(battery.quantity)}
                                />
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        {openCollapsibles.includes(battery.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                </CollapsibleTrigger>
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
                            </div>
                        </div>
                        <CollapsibleContent>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Código de Barras</TableCell>
                                        <TableCell className="text-right">{battery.barcode}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Tipo</TableCell>
                                        <TableCell className="text-right"><Badge variant="outline">{battery.type}</Badge></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Embalagem</TableCell>
                                        <TableCell className="text-right"><Badge variant="outline">{battery.packSize}</Badge></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell className="text-right font-medium">{battery.quantity * battery.packSize}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Quantidade</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
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
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CollapsibleContent>
                    </Collapsible>
                ))
            ) : (
                <div className="h-24 text-center content-center">
                    Nenhuma bateria encontrada.
                </div>
            )}
        </div>
    );
}
