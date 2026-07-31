import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/analytics-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (e) {
    const message = e instanceof Error ? e.message : "集計データの取得に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
