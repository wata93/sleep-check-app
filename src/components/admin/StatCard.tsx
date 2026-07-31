import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <Card className="!p-4">
      <p className="text-xs font-medium text-navy-400 mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-navy-900 tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-navy-400 mt-1">{sub}</p>}
    </Card>
  );
}
