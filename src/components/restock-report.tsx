"use client";

import Image from "next/image";
import { Battery } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

import { forwardRef } from "react";

import { useAppSettings } from "@/contexts/app-settings-context";

interface RestockReportProps {
  itemsForExternalPurchase: Battery[];
  layout?: 'grid' | 'single';
  onExport: (format: 'image' | 'pdf' | 'csv') => Promise<void>;
}

export const RestockReport = forwardRef<HTMLDivElement, RestockReportProps>(({ itemsForExternalPurchase, layout = 'grid', onExport }, ref) => {
  const { appSettings } = useAppSettings();

  return (
    <div className="bg-gray-50 p-4 sm:p-6 md:p-8 light" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Relatório de Reabastecimento</h1>
          <div id="export-buttons" className="flex gap-2">
            <Button onClick={() => onExport('image')}>Exportar como Imagem</Button>
            <Button onClick={() => onExport('pdf')}>Exportar como PDF</Button>
            <Button onClick={() => onExport('csv')}>Exportar como CSV</Button>
          </div>
        </div>
        <div className={`${ 
          layout === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
            : 'flex flex-col gap-4'
        }`}>
          {itemsForExternalPurchase.map((battery) => (
            <Card key={battery.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-lg">
              <CardHeader className="p-0">
                <Image
                  src={battery.imageUrl || "/placeholder.svg"}
                  alt={battery.model || "Battery Image"}
                  width={300}
                  height={200}
                  className="w-full h-40 object-contain"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold text-gray-800 truncate">{battery.brand} {battery.model}</CardTitle>
                <p className="text-sm text-gray-500">{battery.type}</p>
                <p className="text-sm text-gray-600">Embalagem com: {battery.packSize}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Quantidade Necessária:</p>
                  <p className="text-2xl font-bold text-red-600">
                    {battery.quantity}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
});

RestockReport.displayName = "RestockReport";