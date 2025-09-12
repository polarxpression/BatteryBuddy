"use client";

import Image from "next/image";
import { AppSettings, Battery } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { useRef } from "react";

interface RestockReportProps {
  lowStockItems: Battery[];
  outOfStockItems: Battery[];
  appSettings: AppSettings | null;
}

export function RestockReport({ lowStockItems, outOfStockItems, appSettings }: RestockReportProps) {
  const itemsToRestock = [...outOfStockItems, ...lowStockItems];
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportImage = () => {
    if (reportRef.current) {
      const images = Array.from(reportRef.current.querySelectorAll("img"));
      const promises = images.map(img => {
        return new Promise((resolve, reject) => {
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => reject();
          }
        });
      });

      Promise.all(promises).then(() => {
        if (reportRef.current) {
          html2canvas(reportRef.current).then((canvas) => {
            canvas.toBlob((blob) => {
              if (blob) {
                saveAs(blob, "restock-report.png");
              }
            });
          });
        }
      });
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 md:p-8" ref={reportRef}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Relatório de Reabastecimento</h1>
          <Button onClick={handleExportImage}>Exportar como Imagem</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {itemsToRestock.map((battery) => (
            <Card key={battery.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-lg">
              <CardHeader className="p-0">
                <Image
                  src={battery.imageUrl || "/placeholder.svg"}
                  alt={battery.model || "Battery Image"}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold text-gray-800 truncate">{battery.brand} {battery.model}</CardTitle>
                <p className="text-sm text-gray-500">{battery.type}</p>
                <p className="text-sm text-gray-600">Embalagem com: {battery.packSize}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-base font-bold text-red-600">
                    Necessário Repor: {Math.max(0, Math.ceil(((appSettings?.lowStockThreshold || 5) * 2) / battery.packSize) - battery.quantity)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}