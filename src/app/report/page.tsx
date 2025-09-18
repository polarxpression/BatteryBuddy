"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { AppSettings, Battery } from "@/lib/types";
import { onBatteriesSnapshot, onAppSettingsSnapshot } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { saveAs } from "file-saver";
import domtoimage from 'dom-to-image-more';

import { ThemeProvider } from "@/components/theme-provider";

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
  const [layout, setLayout] = useState<'grid' | 'single'>('grid');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPackSizes, setSelectedPackSizes] = useState<string[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    setLayout(params.get('layout') as 'grid' | 'single' || 'grid');
    setSelectedBrands(params.get('brands')?.split(',') || []);
    setSelectedPackSizes(params.get('packSizes')?.split(',') || []);

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

  const toggleExportButtons = (show: boolean) => {
    if (!reportRef.current) return;
    const exportButtons = reportRef.current.querySelector('#export-buttons') as HTMLElement;
    if (exportButtons) {
      exportButtons.style.display = show ? 'flex' : 'none';
    }
  };

  const handleExport = async (format: 'image' | 'pdf' | 'csv') => {
    if (!reportRef.current) return;

    toggleExportButtons(false);

    if (format === 'image') {
      const images = Array.from(reportRef.current.querySelectorAll("img"));
      const promises = images.map(img => {
        return new Promise((resolve, reject) => {
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => reject();
          }
        });
      });

      await Promise.all(promises);
      
      if (reportRef.current) {
        domtoimage.toPng(reportRef.current)
          .then(function (dataUrl: string) {
            saveAs(dataUrl, "restock-report.png");
          })
          .catch(function (error) {
            console.error('oops, something went wrong!', error);
          });
      }
    } else if (format === 'pdf') {
      const { default: html2pdf } = await import('html2pdf.js');
      await html2pdf()
        .from(reportRef.current)
        .save("restock-report.pdf");
    } else if (format === 'csv') {
      const csvContent = [
        ['Brand', 'Model', 'Type', 'Pack Size', 'Current Quantity', 'Restock Amount Needed'].join(','),
        ...lowStockItems.map(battery => [
          battery.brand,
          battery.model,
          battery.type,
          battery.packSize,
          battery.quantity,
          Math.max(0, Math.ceil(((appSettings?.lowStockThreshold || 5) * 2) / battery.packSize) - battery.quantity)
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, "restock-report.csv");
    }

    toggleExportButtons(true);
  };



  const filteredBatteries = useMemo(() => {
    return batteries.filter(battery => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(battery.brand)) {
        return false;
      }
      if (selectedPackSizes.length > 0 && !selectedPackSizes.includes(battery.packSize.toString())) {
        return false;
      }
      return true;
    });
  }, [batteries, selectedBrands, selectedPackSizes]);

  const lowStockItems = useMemo(() => {
    if (!appSettings) return [];
    return filteredBatteries.filter(
      (battery) => {
        const totalQuantity = battery.quantity * battery.packSize;
        return !battery.discontinued && totalQuantity > 0 && totalQuantity < (appSettings.lowStockThreshold || 5);
      }
    );
  }, [filteredBatteries, appSettings]);

  const outOfStockItems = useMemo(() => {
    return filteredBatteries.filter(battery => !battery.discontinued && battery.quantity * battery.packSize === 0);
  }, [filteredBatteries]);

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
    <ThemeProvider forcedTheme="light">
      <RestockReport
        ref={reportRef}
        lowStockItems={lowStockItems}
        outOfStockItems={outOfStockItems}
        appSettings={appSettings}
        layout={layout}
        onExport={handleExport}
      />
    </ThemeProvider>
  );
}
