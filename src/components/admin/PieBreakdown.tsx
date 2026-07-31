"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#284373", "#478ed3", "#8aa0c9", "#d99a3f", "#c15b4a", "#5c7aae", "#9dcbf0"];

interface PieBreakdownProps {
  data: { label: string; count: number }[];
  height?: number;
}

export function PieBreakdown({ data, height = 220 }: PieBreakdownProps) {
  if (data.length === 0) {
    return <p className="text-sm text-navy-400 text-center py-8">データがありません</p>;
  }
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="label" innerRadius="45%" outerRadius="80%" paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
