import { Stars } from "@/components/ui/Stars";
import { TIER_COPY } from "@/lib/constants";
import type { ResultTier } from "@/lib/types";

export function TierHero({ tier }: { tier: ResultTier }) {
  const copy = TIER_COPY[tier];
  return (
    <div className="text-center flex flex-col items-center gap-3">
      <Stars count={copy.stars} />
      <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">{copy.title}</h1>
      <p className="text-sm sm:text-base text-navy-600 leading-relaxed whitespace-pre-line">{copy.comment}</p>
      {copy.showMedicalNotice && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2 leading-relaxed">
          ※本チェックは医療機関の診断に代わるものではありません。強い症状がある場合は医療機関を受診してください。
        </p>
      )}
    </div>
  );
}
