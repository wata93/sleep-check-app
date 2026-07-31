import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultView } from "@/components/result/ResultView";

export const metadata: Metadata = {
  title: "診断結果",
  robots: { index: false, follow: false },
};

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-navy-100 border-t-navy-700 animate-spin" />
        </main>
      }
    >
      <ResultView />
    </Suspense>
  );
}
