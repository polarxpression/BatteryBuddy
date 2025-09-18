"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { type Battery } from "@/lib/types";
import { Warehouse, ArrowRight } from "lucide-react";

interface RestockSuggestionsProps {
  lowStockItems: Battery[];
  outOfStockItems: Battery[];
  batteries: Battery[];
}

export function RestockSuggestions({ lowStockItems, outOfStockItems, batteries }: RestockSuggestionsProps) {
  const stockBatteries = batteries.filter(b => b.location === 'stock');

  const getStockAvailability = (battery: Battery) => {
    return stockBatteries.find(b => b.brand === battery.brand && b.model === battery.model && b.type === battery.type && b.packSize === battery.packSize);
  }

  const outOfStockWithStock = outOfStockItems.map(item => ({ item, stock: getStockAvailability(item) })).filter(data => data.stock && data.stock.quantity > 0);
  const lowStockWithStock = lowStockItems.map(item => ({ item, stock: getStockAvailability(item) })).filter(data => data.stock && data.stock.quantity > 0);

  const restockItems = [...outOfStockWithStock, ...lowStockWithStock];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Sugestões de Reabastecimento (Estoque -&gt; Gôndola)
        </CardTitle>
        <Warehouse className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {restockItems.length === 0 ? (
           <div className="text-center text-muted-foreground py-4">
             <p>Nenhuma sugestão de reabastecimento no momento.</p>
           </div>
        ) : (
            <div className="space-y-2">
            {restockItems.map(({ item, stock }) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg shadow-sm">
                    {item.imageUrl && (
                        <Image src={item.imageUrl} alt={item.brand} width={48} height={48} className="rounded-md object-cover" />
                    )}
                    <div className="flex-1 font-medium break-words flex items-center gap-2">
                        {item.brand} {item.model} ({item.type}, Embalagem com {item.packSize})
                    </div>
                    <div className="ml-auto font-bold flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Estoque: {stock?.quantity}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="text-sm">Gôndola</span>
                    </div>
                </div>
            ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
