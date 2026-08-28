import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ClickTarget } from "@/lib/types";

export const runtime = "nodejs";

const VALID_TARGETS: ClickTarget[] = ["line", "booking", "tel"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resultId = typeof body?.resultId === "string" ? body.resultId : null;
    const target = body?.target as ClickTarget;
    const diagnosisId = typeof body?.diagnosisId === "string" ? body.diagnosisId : null;
    const menuKey = typeof body?.menuKey === "string" ? body.menuKey : null;

    if (!resultId || !VALID_TARGETS.includes(target)) {
      return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
    }

    const client = getSupabaseServerClient();
    if (client) {
      await client.from("click_events").insert({ result_id: resultId, target, diagnosis_id: diagnosisId, menu_key: menuKey });
    }
    return NextResponse.json({ ok: true });
  } catch {
    // 計測失敗はユーザー体験に影響させない
    return NextResponse.json({ ok: true });
  }
}
