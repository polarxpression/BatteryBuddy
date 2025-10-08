'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { GenerateReportModal } from "@/components/generate-report-modal";
import { getBatteries } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

import { Battery } from "@/lib/types";

export default function ReportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [packSizes, setPackSizes] = useState<string[]>([]);
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const router = useRouter();

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

  const handleGenerateReport = (options: { layout: string; selectedBrands: string[]; selectedPackSizes: string[]; batteries: Battery[] }) => {
    const { layout, selectedBrands, selectedPackSizes, batteries } = options;
    const query = new URLSearchParams();
    query.set('layout', layout);
    selectedBrands.forEach(brand => query.append('selectedBrands', brand));
    selectedPackSizes.forEach(size => query.append('selectedPackSizes', size));
    query.set('batteries', JSON.stringify(batteries));
    router.push(`/report/view?${query.toString()}`);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Button onClick={() => setIsModalOpen(true)}>Gerar Relatório de Reabastecimento</Button>
      <GenerateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateReport}
        brands={brands}
        packSizes={packSizes}
        batteries={batteries}
      />
    </div>
  );
}
