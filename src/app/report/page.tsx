"use client";

import { useEffect, useState } from "react";
import { RestockReport } from "@/components/restock-report";
import { AppSettings, Battery } from "@/lib/types";

export default function ReportPage() {
  const [lowStockItems, setLowStockItems] = useState<Battery[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<Battery[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const lowStockData = localStorage.getItem("lowStockItems");
    const outOfStockData = localStorage.getItem("outOfStockItems");
    const appSettingsData = localStorage.getItem("appSettings");

    if (lowStockData) {
      setLowStockItems(JSON.parse(lowStockData));
    }
    if (outOfStockData) {
      setOutOfStockItems(JSON.parse(outOfStockData));
    }
    if (appSettingsData) {
      setAppSettings(JSON.parse(appSettingsData));
    }
  }, []);

  return (
    <RestockReport
      lowStockItems={lowStockItems}
      outOfStockItems={outOfStockItems}
      appSettings={appSettings}
    />
  );
}
