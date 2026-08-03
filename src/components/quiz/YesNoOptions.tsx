interface YesNoOptionsProps {
  value?: boolean;
  onSelect: (value: boolean) => void;
}

export function YesNoOptions({ value, onSelect }: YesNoOptionsProps) {
  const options: { value: boolean; label: string }[] = [
    { value: true, label: "はい" },
    { value: false, label: "いいえ" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4" role="radiogroup">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(opt.value)}
            className={`min-h-[6rem] rounded-3xl px-4 py-6 text-2xl font-extrabold border-2 transition-all duration-150 active:scale-[0.97] flex flex-col items-center justify-center gap-2 ${
              selected
                ? "bg-navy-800 border-navy-800 text-white shadow-soft"
                : "bg-white border-navy-100 text-navy-800 hover:border-skyfog-400 hover:bg-skyfog-50"
            }`}
          >
            <span className="text-3xl" aria-hidden="true">
              {opt.value ? "○" : "×"}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
