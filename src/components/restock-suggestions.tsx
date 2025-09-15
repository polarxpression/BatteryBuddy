"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { type Battery } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

export function RestockSuggestions({ lowStockItems, outOfStockItems }: { lowStockItems: Battery[], outOfStockItems: Battery[] }) {
  

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
                <div key={battery.id} className="flex items-center gap-4 p-4 border rounded-lg shadow-sm">
                    {battery.imageUrl && (
                        <Image src={battery.imageUrl} alt={battery.brand} width={48} height={48} className="rounded-md object-cover" />
                    )}
                    <div className="flex-1 font-medium text-destructive break-words flex items-center gap-2">
                        {battery.brand} {battery.model} ({battery.type}, Embalagem com{" "}
                        <span className="flex items-center justify-center w-5 h-5 bg-accent text-accent-foreground rounded-full text-xs">
                            {battery.packSize}
                        </span>
                        )
                    </div>
                    <div className="ml-auto font-bold text-destructive">Fora de estoque</div>
                </div>
            ))}
            {lowStockItems.map((battery) => (
                <div key={battery.id} className="flex items-center gap-4 p-4 border rounded-lg shadow-sm">
                    {battery.imageUrl && (
                        <Image src={battery.imageUrl} alt={battery.brand} width={48} height={48} className="rounded-md object-cover" />
                    )}
                    <div className="flex-1 font-medium break-words flex items-center gap-2">
                        {battery.brand} {battery.model} ({battery.type}, Embalagem com{" "}
                        <span className="flex items-center justify-center w-5 h-5 bg-accent text-accent-foreground rounded-full text-xs">
                            {battery.packSize}
                        </span>
                        )
                    </div>
                    <div className="ml-auto font-bold">{battery.quantity} restantes</div>
                </div>
            ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
