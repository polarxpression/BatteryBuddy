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
import { MoreHorizontal } from "lucide-react";
import { BatteryIcon } from "./icons/battery-icon";
import type { Battery } from "@/lib/types";
import { Badge } from "./ui/badge";
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
}

export function BatteryInventoryTable({ batteries, onEdit, onDelete }: BatteryInventoryTableProps) {
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
                            <span className="sr-only">Icon</span>
                        </TableHead>
                        <TableHead>Brand & Model</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
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
                            {battery.brand}
                            <div className="text-sm text-muted-foreground md:hidden">{battery.model}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{battery.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge variant={getQuantityBadgeVariant(battery.quantity)} className="text-lg">
                                {battery.quantity}
                            </Badge>
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
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => onEdit(battery)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onDelete(battery.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No batteries in your inventory yet.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    );
}
