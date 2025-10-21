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
    <Card className="text-polar-6">
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
            <div className="flex flex-wrap justify-center gap-4">
            {itemsForInternalRestock.map((item) => (
                <Card key={item.id} className="flex flex-col items-center gap-2 p-4 shadow-sm max-w-sm">
                    <BatteryImageOrIcon
                        imageUrl={item.imageUrl}
                        alt={item.brand}
                        batteryType={item.type || ''}
                        width={80}
                        height={80}
                        className="h-full rounded-md object-cover mb-2"
                    />
                    <div className="text-center w-full">
                        <p className="font-medium break-words">{item.brand} {item.model} ({item.type})</p>
                        <p className="text-sm text-muted-foreground">Embalagem com {item.packSize}</p>
                    </div>
                    <div className="mt-auto mx-auto font-bold">
                        <Button onClick={() => onMoveBatteries([item])} size="sm" className="flex items-center gap-1 bg-polar-7 text-white">
                            Mover: {item.quantity} <ArrowRight className="h-4 w-4" /> Gôndola
                        </Button>
                    </div>
                </Card>
            ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
