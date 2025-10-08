'use client';

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { RestockReport } from "@/components/restock-report";
import { Battery } from "@/lib/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { getBatteries, getAppSettings } from "@/lib/firebase";

function ReportView() {
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<Battery[] | null>(null);
  const [reportOptions, setReportOptions] = useState<{ layout: string; selectedBrands: string[]; selectedPackSizes: string[]; } | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const settings = await getAppSettings();
      const gondolaCapacity = settings?.gondolaCapacity || 5;
      const batteriesString = sessionStorage.getItem('reportBatteries');
      const batteries = batteriesString ? JSON.parse(batteriesString) : await getBatteries();
      if (batteriesString) {
        sessionStorage.removeItem('reportBatteries');
      }

      const layout = searchParams.get('layout') || 'grid';
      const selectedBrands = searchParams.getAll('selectedBrands');
      const selectedPackSizes = searchParams.getAll('selectedPackSizes');

      const reportData = batteries
        .filter((battery: Battery) => !battery.discontinued)
        .filter((battery: Battery) => selectedBrands.length === 0 || selectedBrands.includes(battery.brand))
        .filter((battery: Battery) => selectedPackSizes.length === 0 || selectedPackSizes.includes(battery.packSize.toString()))
        .filter((battery: Battery) => battery.quantity <= ((battery.gondolaCapacity || gondolaCapacity) / 2))
        .map((battery: Battery) => ({
          ...battery,
          quantity: Math.max(0, (battery.gondolaCapacity || gondolaCapacity) - battery.quantity),
        }));

      setReportData(reportData);
      setReportOptions({ layout, selectedBrands, selectedPackSizes });
    };
    fetchData();
  }, [searchParams]);

  const handleExport = async (format: 'image' | 'pdf' | 'zip') => {
    if (!reportRef.current) return;

    const element = reportRef.current;
    const exportButtons = element.querySelector('#export-buttons');
    if (exportButtons) {
      (exportButtons as HTMLElement).style.display = 'none';
    }

    const canvas = await html2canvas(element, { useCORS: true });

    if (exportButtons) {
      (exportButtons as HTMLElement).style.display = 'flex';
    }

    switch (format) {
      case 'image':
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'relatorio-reabastecimento.png';
        link.href = dataUrl;
        link.click();
        break;
      case 'pdf':
        const pdfDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);
        const width = canvasWidth * ratio;
        const height = canvasHeight * ratio;
        pdf.addImage(pdfDataUrl, 'JPEG', 0, 0, width, height);
        pdf.save('relatorio-reabastecimento.pdf');
        break;
      case 'zip':
        const zip = new JSZip();
        const cardElements = element.querySelectorAll('.battery-card');
        for (let i = 0; i < cardElements.length; i++) {
          const card = cardElements[i] as HTMLElement;
          const cardCanvas = await html2canvas(card, { useCORS: true });
          const cardDataUrl = cardCanvas.toDataURL('image/png');
          zip.file(`bateria-${i + 1}.png`, cardDataUrl.split(',')[1], { base64: true });
        }
        zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
          const link = document.createElement('a');
          const url = URL.createObjectURL(content);
          link.setAttribute('href', url);
          link.setAttribute('download', 'relatorio-reabastecimento.zip');
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
        break;
    }
  };

  return (
    <>
      {reportData && reportOptions && (
        <div>
          <RestockReport
            ref={reportRef}
            itemsForExternalPurchase={reportData}
            layout={reportOptions.layout as 'grid' | 'single'}
            onExport={handleExport}
          />
        </div>
      )}
    </>
  );
}

export default function ReportViewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportView />
    </Suspense>
  );
}