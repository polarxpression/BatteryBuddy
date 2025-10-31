"use client";


import { Battery } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BatteryImageOrIcon } from "./battery-image-or-icon";

import { forwardRef } from "react";

interface RestockReportProps {
  itemsForExternalPurchase: Battery[];
  layout?: 'grid' | 'single';
  onExport: (format: 'image' | 'pdf' | 'zip') => Promise<void>;
}

export const RestockReport = forwardRef<HTMLDivElement, RestockReportProps>(({ itemsForExternalPurchase, layout = 'grid', onExport }, ref) => {

  return (
    <div className="p-4 sm:p-6 md:p-8" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Relatório de Reabastecimento</h1>
          <div id="export-buttons" className="flex gap-2">
            <Button onClick={() => onExport('image')}>Exportar como Imagem</Button>
            <Button onClick={() => onExport('pdf')}>Exportar como PDF</Button>
            <Button onClick={() => onExport('zip')}>Exportar como ZIP</Button>
          </div>
        </div>
        {itemsForExternalPurchase.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-center text-center">
                <CardTitle className="text-2xl font-bold">Nenhuma Bateria Encontrada</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Não há baterias para exibir neste relatório com os filtros selecionados.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className={`${ 
            layout === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              : 'flex flex-col gap-4'
          }`}>
            {itemsForExternalPurchase.map((battery) => (
                        <Card key={battery.id} className="transition-shadow duration-300 ease-in-out rounded-lg battery-card">
              <CardHeader className="p-0">
                <BatteryImageOrIcon
                  imageUrl={battery.imageUrl}
                  alt={`${battery.brand} ${battery.model}`}
                  batteryType={battery.type || ''}
                  width={160}
                  height={160}
                  className="w-full h-40 object-contain"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold text-foreground truncate">{battery.brand} {battery.model}</CardTitle>
                <p className="text-sm text-muted-foreground">{battery.type}</p>
                <p className="text-sm text-muted-foreground">Embalagem com: {battery.packSize}</p>
                <div className="mt-4 pt-4">
                  <p className="text-sm text-muted-foreground">Cartelas Necessárias:</p>
                  <p className="text-2xl font-bold text-red-600">
                    {battery.quantity}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

      </div>
    </div>
  );
});

RestockReport.displayName = "RestockReport";