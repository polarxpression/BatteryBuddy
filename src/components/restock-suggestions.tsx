"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Battery } from "@/lib/types";
import { AlertTriangle } from "lucide-react";
import { BatteryIcon } from "./icons/battery-icon";

const LOW_STOCK_THRESHOLD = 5;

export function RestockSuggestions({ batteries }: { batteries: Battery[] }) {
  const lowStockItems = batteries.filter(
    (battery) => battery.quantity < LOW_STOCK_THRESHOLD
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <AlertTriangle className="text-destructive" />
          Restock Suggestions
        </CardTitle>
        <CardDescription>
          These items are running low (less than {LOW_STOCK_THRESHOLD} left).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockItems.length > 0 ? (
          <ul className="space-y-4">
            {lowStockItems.map((battery) => (
              <li key={battery.id} className="flex items-center gap-4">
                <BatteryIcon type={battery.type} className="h-8 w-8 text-muted-foreground" />
                <div className="flex-grow">
                  <p className="font-semibold">{battery.brand} {battery.model}</p>
                  <p className="text-sm text-muted-foreground">Type: {battery.type}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-destructive">{battery.quantity}</p>
                    <p className="text-sm text-muted-foreground">in stock</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            All batteries are well-stocked. Great job!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
