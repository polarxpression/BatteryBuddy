import { Suspense } from "react";
import { ReportView } from "@/components/report-view";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ReportViewPage({ searchParams }: { searchParams: any }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportView searchParams={searchParams} />
    </Suspense>
  );
}
