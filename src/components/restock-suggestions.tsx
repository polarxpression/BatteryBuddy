import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Battery } from "@/lib/types";
import { Warehouse, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { BatteryImageOrIcon } from "./battery-image-or-icon";

interface RestockSuggestionsProps {
  itemsForInternalRestock: Battery[];
  onMoveBatteries: (items: Battery[]) => void;
}

export function RestockSuggestions({ itemsForInternalRestock, onMoveBatteries }: RestockSuggestionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Sugestões de Reabastecimento (Estoque &rarr; Gôndola)
        </CardTitle>
        <Warehouse className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {itemsForInternalRestock.length === 0 ? (
           <div className="text-center text-muted-foreground py-4">
             <p>Nenhuma sugestão de reabastecimento no momento.</p>
           </div>
        ) : (
            <div className="space-y-2">
            {itemsForInternalRestock.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg shadow-sm">
                    <BatteryImageOrIcon
                        imageUrl={item.imageUrl}
                        alt={item.brand}
                        batteryType={item.type}
                        width={48}
                        height={48}
                        className="rounded-md object-cover"
                    />
                    <div className="flex-1 font-medium break-words flex items-center gap-2">
                        {item.brand} {item.model} ({item.type}, Embalagem com {item.packSize})
                    </div>
                    <div className="ml-auto font-bold">
                        <Button onClick={() => onMoveBatteries([item])} size="sm" className="flex items-center gap-1">
                            Mover: {item.quantity} <ArrowRight className="h-4 w-4" /> Gôndola
                        </Button>
                    </div>
                </div>
            ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
