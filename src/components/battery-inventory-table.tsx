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
import { type Battery, AppSettings } from "@/lib/types";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "./ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { onAppSettingsSnapshot } from "@/lib/firebase";

interface BatteryInventoryTableProps {
    batteries: Battery[];
    onEdit: (battery: Battery) => void;
    onDelete: (id: string) => void;
    onQuantityChange: (id: string, newQuantity: number) => void;
}

export function BatteryInventoryTable({ batteries, onEdit, onDelete, onQuantityChange }: BatteryInventoryTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        const unsubscribe = onAppSettingsSnapshot(setAppSettings);
        return () => unsubscribe();
    }, []);

    const filteredBatteries = useMemo(() => {
        return batteries.filter(battery => {
            const brandMatch = battery.brand.toLowerCase().includes(searchTerm.toLowerCase());
            const typeMatch = typeFilter === "all" || battery.type === typeFilter;
            return brandMatch && typeMatch;
        });
    }, [batteries, searchTerm, typeFilter]);

    const getQuantityBadgeVariant = (quantity: number): "default" | "destructive" | "secondary" => {
        if (quantity === 0) return "destructive";
        if (quantity < 5) return "secondary";
        return "default";
    };
    
    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <Input 
                    placeholder="Filtrar por marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        {appSettings?.batteryTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Ícone</span>
                        </TableHead>
                        <TableHead>Marca & Modelo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Embalagem</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>
                            <span className="sr-only">Ações</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {filteredBatteries.length > 0 ? (
                    filteredBatteries.map((battery) => (
                    <TableRow key={battery.id}>
                        <TableCell className="hidden sm:table-cell">
                            <BatteryIcon type={battery.type} className="h-8 w-8 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="font-medium">
                            {battery.brand}
                            <div className="text-sm text-muted-foreground">{battery.model}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{battery.type}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{battery.packSize}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1 md:gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => onQuantityChange(battery.id, battery.quantity - 1)}
                                    disabled={battery.quantity === 0}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Badge variant={getQuantityBadgeVariant(battery.quantity)} className="min-w-10 justify-center text-base">
                                    {battery.quantity}
                                </Badge>
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
                        <TableCell className="text-right font-medium">
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
