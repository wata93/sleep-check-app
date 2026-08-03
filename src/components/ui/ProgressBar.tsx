interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  const remaining = Math.max(0, total - current + 1);
  return (
    <div className="w-full" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-navy-500">
        <span>{label ?? `あと${remaining}問`}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-navy-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-skyfog-400 to-navy-600 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
