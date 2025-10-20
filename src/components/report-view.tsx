'use client';

import { useState, useRef, useEffect } from "react";
import { RestockReport } from "@/components/restock-report";
import { Battery } from "@/lib/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";

interface ReportViewProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ReportView({ searchParams }: ReportViewProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = useState<Battery[] | null>(null);
  const [reportOptions, setReportOptions] = useState<{ layout: string; selectedBrands: string[]; selectedPackSizes: string[]; } | null>(null);

  useEffect(() => {
    const batteriesString = searchParams.batteries as string;
    const reportData = batteriesString ? JSON.parse(batteriesString) : [];

    const layout = (searchParams.layout as string) || 'grid';
    const selectedBrands = (searchParams.selectedBrands as string[]) || [];
    const selectedPackSizes = (searchParams.selectedPackSizes as string[]) || [];

    setReportData(reportData);
    setReportOptions({ layout, selectedBrands, selectedPackSizes });
  }, [searchParams]);

  const waitForImagesToLoad = async (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );
  };

  const handleExport = async (format: 'image' | 'pdf' | 'zip') => {
    if (!reportRef.current) return;

    const element = reportRef.current;
    const exportButtons = element.querySelector('#export-buttons');
    if (exportButtons) {
      (exportButtons as HTMLElement).style.display = 'none';
    }

    // Wait for all images to load
    await waitForImagesToLoad(element);

    const canvas = await html2canvas(element, { 
      useCORS: true,
      allowTaint: true,
      scale: 3,
      logging: false,
      windowHeight: element.scrollHeight,
      height: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Fix image dimensions in the cloned document
        const clonedImages = clonedDoc.querySelectorAll('.battery-card img');
        clonedImages.forEach((img: Element) => {
          const htmlImg = img as HTMLImageElement;
          htmlImg.style.objectFit = 'contain';
          htmlImg.style.maxWidth = '100%';
          htmlImg.style.height = 'auto';
          htmlImg.style.display = 'block';
        });

        // Fix text rendering - ensure proper padding and overflow
        const clonedCards = clonedDoc.querySelectorAll('.battery-card');
        clonedCards.forEach((card: Element) => {
          const htmlCard = card as HTMLElement;
          htmlCard.style.paddingBottom = '8px';
          htmlCard.style.overflow = 'visible';
        });

        // Fix text overflow
        const textElements = clonedDoc.querySelectorAll('.battery-card p, .battery-card h1, .battery-card h2, .battery-card h3, .battery-card h4, .battery-card span, .battery-card div');
        textElements.forEach((el: Element) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.overflow = 'visible';
        });
      }
    });

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
        const pdfDataUrl = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);
        const width = canvasWidth * ratio;
        const height = canvasHeight * ratio;
        pdf.addImage(pdfDataUrl, 'PNG', 0, 0, width, height);
        pdf.save('relatorio-reabastecimento.pdf');
        break;
      case 'zip':
        const zip = new JSZip();
        const cardElements = element.querySelectorAll('.battery-card');
        for (let i = 0; i < cardElements.length; i++) {
          const card = cardElements[i] as HTMLElement;
          
          // Wait for images in this card to load
          await waitForImagesToLoad(card);
          
          const cardCanvas = await html2canvas(card, { 
            useCORS: true,
            allowTaint: true,
            scale: 3,
            logging: false,
            windowHeight: card.scrollHeight,
            height: card.scrollHeight,
            onclone: (clonedDoc) => {
              const clonedImages = clonedDoc.querySelectorAll('img');
              clonedImages.forEach((img: Element) => {
                const htmlImg = img as HTMLImageElement;
                htmlImg.style.objectFit = 'contain';
                htmlImg.style.maxWidth = '100%';
                htmlImg.style.height = 'auto';
                htmlImg.style.display = 'block';
              });

              // Fix text overflow
              const textElements = clonedDoc.querySelectorAll('p, h1, h2, h3, h4, span, div');
              textElements.forEach((el: Element) => {
                const htmlEl = el as HTMLElement;
                htmlEl.style.overflow = 'visible';
              });
            }
          });
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
