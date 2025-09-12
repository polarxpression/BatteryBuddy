"use client";

import { useEffect, useState } from "react";
import { AppSettings, Battery } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const RestockReport = dynamic(() => import("@/components/restock-report").then(mod => mod.RestockReport), {
  ssr: false,
  loading: () => (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    </div>
  ),
});

export default function ReportPage() {
  const [lowStockItems, setLowStockItems] = useState<Battery[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<Battery[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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

  if (!isClient) {
    return null;
  }

  return (
    <RestockReport
      lowStockItems={lowStockItems}
      outOfStockItems={outOfStockItems}
      appSettings={appSettings}
    />
  );
}
