"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateReportModal } from "./generate-report-modal";

interface BatteryReportProps {
  onGenerateReport: (options: { layout: string; selectedBrands: string[]; selectedPackSizes: string[]; }) => void;
  onGenerateSuggestion: () => void;
  onGenerateAIReport: () => void;
  brands: string[];
  packSizes: string[];
}

export function BatteryReport({ onGenerateReport, onGenerateSuggestion, onGenerateAIReport, brands, packSizes }: BatteryReportProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerateReport = (options: { layout: string; selectedBrands: string[]; selectedPackSizes: string[]; }) => {
    onGenerateReport(options);
    setIsModalOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Baterias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end gap-2">
            <Button onClick={() => onGenerateSuggestion()}>Pedir sugestão de compra para IA</Button>
            <Button onClick={() => onGenerateAIReport()}>Gerar Relatório com IA</Button>
            <Button onClick={() => setIsModalOpen(true)}>Gerar Relatório de Reabastecimento</Button>
          </div>
        </CardContent>
      </Card>
      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateReport}
        brands={brands}
        packSizes={packSizes}
      />
    </>
  );
}