import { Suspense } from "react";
import { ReportView } from "@/components/report-view";
import ErrorBoundary from "@/components/error-boundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ReportViewPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
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
      }>
        <ReportView />
      </Suspense>
    </ErrorBoundary>
  );
}
