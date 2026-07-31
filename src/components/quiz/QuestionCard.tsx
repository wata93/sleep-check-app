import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface QuestionCardProps {
  current: number;
  total: number;
  questionText: string;
  onBack?: () => void;
  children: ReactNode;
}

export function QuestionCard({ current, total, questionText, onBack, children }: QuestionCardProps) {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in" key={current}>
      <ProgressBar current={current} total={total} />
      <Card className="mt-5">
        <h2 className="text-lg sm:text-xl font-bold text-navy-900 leading-relaxed mb-6 min-h-[3.5rem]">
          {questionText}
        </h2>
        {children}
      </Card>
      {onBack && current > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-sm font-medium text-navy-400 hover:text-navy-600 mx-auto flex items-center gap-1"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          前の質問に戻る
        </button>
      )}
    </div>
  );
}
