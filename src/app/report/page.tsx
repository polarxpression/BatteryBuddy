'use client';

import { BatteryReport } from "@/components/battery-report";

export default function ReportPage() {
  const handleGenerateReport = (options: {
    layout: string;
    selectedBrands: string[];
    selectedPackSizes:string[];
  }) => {
    console.log("Generating report with options:", options);
  };

  const brands = ["Brand A", "Brand B", "Brand C"];
  const packSizes = ["Size 1", "Size 2", "Size 3"];

  return (
    <BatteryReport
      onGenerateReport={handleGenerateReport}
      brands={brands}
      packSizes={packSizes}
    />
  );
}