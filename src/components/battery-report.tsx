"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BatteryReportProps {
  onGenerateReport: (outputType: "print" | "download") => void;
  onGenerateSuggestion: () => void;
}

export function BatteryReport({ onGenerateReport, onGenerateSuggestion }: BatteryReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Baterias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end gap-2">
          <Button onClick={() => onGenerateSuggestion()}>Pedir sugestão de compra para IA</Button>
          <Button onClick={() => onGenerateReport("print")}>Imprimir</Button>
          <Button onClick={() => onGenerateReport("download")}>Baixar PDF</Button>
        </div>
      </CardContent>
    </Card>
  );
}
