import { Card } from "@/components/ui/Card";
import { CATEGORY_LABELS, type CategoryResult } from "@/lib/types";

const ICONS: Record<CategoryResult["category"], string> = {
  quality: "🌙",
  autonomic: "🍃",
  stress: "💭",
  brain: "🧠",
  nocturia: "💧",
};

function tone(score: number) {
  if (score >= 80) return "text-navy-600 bg-navy-50";
  if (score >= 50) return "text-amber-600 bg-amber-50";
  return "text-rose-600 bg-rose-50";
}

export function CategoryDetailCards({ categories }: { categories: CategoryResult[] }) {
  return (
    <div className="flex flex-col gap-3">
      {categories.map((c) => (
        <Card key={c.category} className="!p-4 sm:!p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">
                {ICONS[c.category]}
              </span>
              <h3 className="font-bold text-navy-900">{CATEGORY_LABELS[c.category]}</h3>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${tone(c.score)}`}>{c.status}</span>
          </div>
          <div className="h-2 rounded-full bg-navy-50 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-navy-600"
              style={{ width: `${c.score}%` }}
            />
          </div>
          <p className="text-sm text-navy-500 leading-relaxed mb-2">{c.description}</p>
          <p className="text-sm text-navy-700 leading-relaxed font-medium bg-skyfog-50 rounded-xl px-3 py-2">
            💡 {c.advice}
          </p>
        </Card>
      ))}
    </div>
  );
}
