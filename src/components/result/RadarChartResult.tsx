"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { CATEGORY_LABELS, type CategoryResult } from "@/lib/types";

export function RadarChartResult({ categories }: { categories: CategoryResult[] }) {
  const data = categories.map((c) => ({
    subject: CATEGORY_LABELS[c.category],
    score: c.score,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-72 sm:h-80" role="img" aria-label="5項目のレーダーチャート">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#dbe2ee" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#284373", fontWeight: 600 }} />
          <Radar name="スコア" dataKey="score" stroke="#3a5a8f" fill="#478ed3" fillOpacity={0.35} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
