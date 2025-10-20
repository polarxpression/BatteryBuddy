'use client';

import { useState, useEffect } from "react";
import { GenerateReportModal } from "@/components/generate-report-modal";
import { getBatteries } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

import { Battery } from "@/lib/types";

export default function ReportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [packSizes, setPackSizes] = useState<string[]>([]);
  const [batteries, setBatteries] = useState<Battery[]>([]);


  useEffect(() => {
    const fetchFilterOptions = async () => {
      const batteries = await getBatteries();
      const uniqueBrands = [...new Set(batteries.map(b => b.brand))];
      const uniquePackSizes = [...new Set(batteries.map(b => b.packSize.toString()))];
      setBrands(uniqueBrands);
      setPackSizes(uniquePackSizes);
      setBatteries(batteries);
    };
    fetchFilterOptions();
  }, []);



  return (
    <div className="flex justify-center items-center h-screen">
      <Button onClick={() => setIsModalOpen(true)}>Gerar Relatório de Reabastecimento</Button>
      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brands={brands}
        packSizes={packSizes}
        batteries={batteries}
      />
    </div>
  );
}
