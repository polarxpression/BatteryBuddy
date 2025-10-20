"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateReportModal } from "./generate-report-modal";

import { Battery } from "@/lib/types";

interface BatteryReportProps {
  onGenerateReport: (options: { layout: string; selectedBrands: string[]; selectedPackSizes: string[]; }) => void;
  brands: string[];
  packSizes: string[];
  batteries: Battery[];
}

export function BatteryReport({ onGenerateReport, brands, packSizes, batteries }: BatteryReportProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerateReport = (options: { layout: string; selectedBrands: string[]; selectedPackSizes: string[]; }) => {
    onGenerateReport(options);
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="bg-polar-2 text-polar-6">
        <CardHeader>
          <CardTitle>Relatório de Baterias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end gap-2 flex-wrap">
            <Button onClick={() => setIsModalOpen(true)} className="bg-polar-7 text-white">Gerar Relatório de Reabastecimento</Button>
          </div>
        </CardContent>
      </Card>
      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateReport}
        brands={brands}
        packSizes={packSizes}
        batteries={batteries}
      />
    </>
  );
}