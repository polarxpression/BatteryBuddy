"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Battery } from "@/lib/types";
import { AlertTriangle, Zap } from "lucide-react";
import { BatteryIcon } from "./icons/battery-icon";

const LOW_STOCK_THRESHOLD = 5;

export function RestockSuggestions({ batteries }: { batteries: Battery[] }) {
  const lowStockItems = batteries.filter(
    (battery) => battery.quantity > 0 && battery.quantity < LOW_STOCK_THRESHOLD
  );

  const outOfStockItems = batteries.filter(battery => battery.quantity === 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Restock Suggestions
        </CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
           <div className="text-center text-muted-foreground py-4">
             <p>All items are well-stocked.</p>
           </div>
        ) : (
            <div className="space-y-2">
            {outOfStockItems.map((battery) => (
                <div key={battery.id} className="flex items-center gap-4">
                    <div className="font-medium text-destructive">{battery.brand} {battery.model} ({battery.type})</div>
                    <div className="ml-auto font-bold text-destructive">Out of stock</div>
                </div>
            ))}
            {lowStockItems.map((battery) => (
                <div key={battery.id} className="flex items-center gap-4">
                    <div className="font-medium">{battery.brand} {battery.model} ({battery.type})</div>
                    <div className="ml-auto font-bold">{battery.quantity} left</div>
                </div>
            ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
