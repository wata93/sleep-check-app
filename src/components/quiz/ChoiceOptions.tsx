interface Choice {
  value: string;
  label: string;
}

interface ChoiceOptionsProps {
  choices: Choice[];
  value?: string;
  onSelect: (value: string) => void;
}

export function ChoiceOptions({ choices, value, onSelect }: ChoiceOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup">
      {choices.map((choice) => {
        const selected = value === choice.value;
        return (
          <button
            key={choice.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(choice.value)}
            className={`min-h-[3.5rem] rounded-2xl px-4 py-3 text-base font-semibold border-2 transition-all duration-150 active:scale-[0.98] ${
              selected
                ? "bg-navy-800 border-navy-800 text-white shadow-soft"
                : "bg-white border-navy-100 text-navy-800 hover:border-skyfog-400 hover:bg-skyfog-50"
            }`}
          >
            {choice.label}
          </button>
        );
      })}
    </div>
  );
}
