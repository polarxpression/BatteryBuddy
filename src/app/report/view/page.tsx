import { Suspense } from "react";
import { ReportView } from "@/components/report-view";
import ErrorBoundary from "@/components/error-boundary";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ReportViewPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <ReportView />
      </Suspense>
    </ErrorBoundary>
  );
}
