"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateReportModal } from "./generate-report-modal";

import { Battery } from "@/lib/types";

interface BatteryReportProps {
  brands: string[];
  packSizes: string[];
  batteries: Battery[];
}

export function BatteryReport({ brands, packSizes, batteries }: BatteryReportProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);



  return (
    <>
      <Card className="bg-polar-2 text-polar-6">
        <CardHeader>
          <CardTitle>Relatório de Baterias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end gap-2 flex-wrap">
            <Button onClick={() => setIsModalOpen(true)} className="bg-card border text-white transition">Gerar Relatório de Reabastecimento</Button>
          </div>
        </CardContent>
      </Card>
      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brands={brands}
        packSizes={packSizes}
        batteries={batteries}
      />
    </>
  );
}