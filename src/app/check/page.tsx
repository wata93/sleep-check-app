import { Suspense } from "react";
import { CheckFlow } from "@/components/quiz/CheckFlow";

export default function CheckPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-navy-100 border-t-navy-700 animate-spin" />
        </main>
      }
    >
      <CheckFlow />
    </Suspense>
  );
}
