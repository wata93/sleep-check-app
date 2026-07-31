import { LIKERT_OPTIONS, type LikertValue } from "@/lib/types";

interface LikertOptionsProps {
  value?: LikertValue;
  onSelect: (value: LikertValue) => void;
}

export function LikertOptions({ value, onSelect }: LikertOptionsProps) {
  return (
    <div className="flex flex-col gap-3" role="radiogroup">
      {LIKERT_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(opt.value)}
            className={`w-full min-h-[3.5rem] rounded-2xl px-6 py-4 text-left text-base sm:text-lg font-semibold border-2 transition-all duration-150 active:scale-[0.98] ${
              selected
                ? "bg-navy-800 border-navy-800 text-white shadow-soft"
                : "bg-white border-navy-100 text-navy-800 hover:border-skyfog-400 hover:bg-skyfog-50"
            }`}
          >
            <span className="flex items-center justify-between">
              {opt.label}
              {selected && (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
