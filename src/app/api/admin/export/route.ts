import { NextResponse } from "next/server";
import { exportResultsCsv } from "@/lib/analytics-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const csv = await exportResultsCsv();
  const bom = "﻿"; // Excelで文字化けしないようUTF-8 BOMを付与
  const body = csv || "message\nSupabase未設定、またはデータがまだありません。";
  return new NextResponse(bom + body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sleep_check_results_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
