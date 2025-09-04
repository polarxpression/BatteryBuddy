"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Battery } from "@/lib/types";
import { AlertTriangle } from "lucide-react";


const LOW_STOCK_THRESHOLD = 5;

export function RestockSuggestions({ batteries }: { batteries: Battery[] }) {
  const lowStockItems = batteries.filter(
    (battery) => {
      const totalQuantity = battery.quantity * battery.packSize;
      return !battery.discontinued && totalQuantity > 0 && totalQuantity < LOW_STOCK_THRESHOLD;
    }
  );

  const outOfStockItems = batteries.filter(battery => !battery.discontinued && battery.quantity * battery.packSize === 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Sugestões de Reabastecimento
        </CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
           <div className="text-center text-muted-foreground py-4">
             <p>Todos os itens estão bem abastecidos.</p>
           </div>
        ) : (
            <div className="space-y-2">
            {outOfStockItems.map((battery) => (
                <div key={battery.id} className="flex items-center gap-4">
                    <div className="font-medium text-destructive break-words">{battery.brand} {battery.model} ({battery.type}, Embalagem com {battery.packSize})</div>
                    <div className="ml-auto font-bold text-destructive">Fora de estoque</div>
                </div>
            ))}
            {lowStockItems.map((battery) => (
                <div key={battery.id} className="flex items-center gap-4">
                    <div className="font-medium break-words">{battery.brand} {battery.model} ({battery.type}, Embalagem com {battery.packSize})</div>
                    <div className="ml-auto font-bold">{battery.quantity * battery.packSize} restantes</div>
                </div>
            ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
