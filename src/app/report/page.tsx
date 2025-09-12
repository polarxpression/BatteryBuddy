"use client";

import { useEffect, useState, useMemo } from "react";
import { AppSettings, Battery } from "@/lib/types";
import { onBatteriesSnapshot, onAppSettingsSnapshot } from "@/lib/firebase";
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
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeBatteries = onBatteriesSnapshot((newBatteries) => {
      setBatteries(newBatteries);
      setIsLoading(false);
    });
    const unsubscribeAppSettings = onAppSettingsSnapshot((settings) => {
      setAppSettings(settings);
    });

    return () => {
      unsubscribeBatteries();
      unsubscribeAppSettings();
    };
  }, []);

  const lowStockItems = useMemo(() => {
    if (!appSettings) return [];
    return batteries.filter(
      (battery) => {
        const totalQuantity = battery.quantity * battery.packSize;
        return !battery.discontinued && totalQuantity > 0 && totalQuantity < (appSettings.lowStockThreshold || 5);
      }
    );
  }, [batteries, appSettings]);

  const outOfStockItems = useMemo(() => {
    return batteries.filter(battery => !battery.discontinued && battery.quantity * battery.packSize === 0);
  }, [batteries]);

  if (isLoading) {
    return (
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
    );
  }

  return (
    <RestockReport
      lowStockItems={lowStockItems}
      outOfStockItems={outOfStockItems}
      appSettings={appSettings}
    />
  );
}
