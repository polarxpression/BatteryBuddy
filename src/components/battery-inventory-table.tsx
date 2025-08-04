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
import { Pencil, Trash2 } from "lucide-react";
import { BatteryIcon } from "./icons/battery-icon";
import type { Battery } from "@/lib/types";
import { Badge } from "./ui/badge";

interface BatteryInventoryTableProps {
    batteries: Battery[];
    onEdit: (battery: Battery) => void;
    onDelete: (id: string) => void;
}

export function BatteryInventoryTable({ batteries, onEdit, onDelete }: BatteryInventoryTableProps) {
    const getQuantityBadgeVariant = (quantity: number): "default" | "destructive" | "secondary" => {
        if (quantity === 0) return "destructive";
        if (quantity < 5) return "secondary";
        return "default";
    };
    
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">Type</TableHead>
                        <TableHead>Brand & Model</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {batteries.length > 0 ? (
                    batteries.map((battery) => (
                    <TableRow key={battery.id}>
                        <TableCell>
                            <BatteryIcon type={battery.type} className="h-8 w-8" />
                        </TableCell>
                        <TableCell>
                            <div className="font-medium">{battery.brand}</div>
                            <div className="text-sm text-muted-foreground">{battery.model} ({battery.type})</div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge variant={getQuantityBadgeVariant(battery.quantity)} className="text-lg">
                                {battery.quantity}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end gap-2">
                                <Button variant="outline" size="icon" onClick={() => onEdit(battery)}>
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => onDelete(battery.id)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                           </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No batteries in your inventory yet.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    );
}
