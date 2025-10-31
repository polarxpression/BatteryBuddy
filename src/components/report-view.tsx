'use client';

import { useState, useRef, useEffect } from "react";
import { RestockReport } from "@/components/restock-report";
import { Battery } from "@/lib/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowLeft } from "lucide-react";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReportView() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = useState<Battery[] | null>(null);
  const [reportOptions, setReportOptions] = useState<{ selectedBrands: string[]; selectedPackSizes: string[]; } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

    useEffect(() => {
    console.log('localStorage:', localStorage);
    const reportDataString = localStorage.getItem('reportData');
    console.log('reportDataString:', reportDataString);
    if (reportDataString) {
      const { batteries, selectedBrands, selectedPackSizes } = JSON.parse(reportDataString);
      console.log('Parsed batteries:', batteries);
      setReportData(batteries);
      setReportOptions({ selectedBrands, selectedPackSizes });
    }
    setLoading(false);
  }, []);

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

      const backButton = element.querySelector('#back-button');

      if (exportButtons) {

        (exportButtons as HTMLElement).style.display = 'none';

      }
      if (backButton) {

        (backButton as HTMLElement).style.display = 'none';

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

      if (backButton) {

        (backButton as HTMLElement).style.display = 'block';

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

  

    if (loading) {

      return (

        <div className="flex items-center justify-center h-screen">

          <Card className="w-full max-w-md">

            <CardHeader className="flex flex-row items-center justify-center text-center">

              <Zap className="h-8 w-8 mr-2 text-primary animate-pulse" />

              <CardTitle className="text-2xl font-bold">Carregando Relatório...</CardTitle>

            </CardHeader>

            <CardContent className="text-center">

              <p className="text-muted-foreground">

                Aguarde enquanto preparamos seu relatório.

              </p>

            </CardContent>

          </Card>

        </div>

      );

    }

  

    return (

  

        <>

  

          {reportData && reportOptions ? (

  

            reportData.length > 0 ? (

  

              <div className="w-full flex justify-start">
                <Button id="back-button" onClick={() => router.push('/')} className="mr-4 mt-4" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>

  

                  ref={reportRef}

  

                  itemsForExternalPurchase={reportData}

  

                  layout={'grid'}

  

                  onExport={handleExport}

  

                />

  

              </div>

  

            ) : (

  

              <div className="flex items-center justify-center h-screen">

  

                <Card className="w-full max-w-md">

  

                  <CardHeader className="flex flex-row items-center justify-center text-center">

  

                    <Zap className="h-8 w-8 mr-2 text-primary" />

  

                    <CardTitle className="text-2xl font-bold">Nenhuma Bateria Encontrada</CardTitle>

  

                  </CardHeader>

  

                  <CardContent className="text-center">

  

                    <p className="text-muted-foreground">

  

                      Não há baterias para serem compradas com os filtros selecionados.

  

                    </p>

  

                  </CardContent>

  

                </Card>

  

              </div>

  

            )

  

          ) : (

  

            <div className="flex items-center justify-center h-screen">

  

            <Card className="w-full max-w-md">

  

              <CardHeader className="flex flex-row items-center justify-center text-center">

  

                <Zap className="h-8 w-8 mr-2 text-destructive" />

  

                <CardTitle className="text-2xl font-bold">Dados do Relatório Não Encontrados</CardTitle>

  

              </CardHeader>

  

              <CardContent className="text-center">

  

                <p className="text-muted-foreground">

  

                  Não foi possível encontrar os dados do relatório. Por favor, gere o relatório novamente.

  

                </p>

  

              </CardContent>

  

            </Card>

  

          </div>

  

          )}

  

        </>

  

      );
}
