import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { scoreBodyCheck } from "@/lib/bodycheck/scoring";
import { getBodyCheckConfig } from "@/lib/bodycheck/registry";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileAnswers } from "@/lib/types";

export const runtime = "nodejs";

interface SubmitBody {
  localId: string;
  diagnosisId: string;
  profile: ProfileAnswers;
  answers: Record<string, boolean>;
}

function isValidProfile(profile: unknown): profile is ProfileAnswers {
  if (!profile || typeof profile !== "object") return false;
  const p = profile as Record<string, unknown>;
  return typeof p.ageBand === "string" && typeof p.gender === "string";
}

export async function POST(request: Request) {
  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
  }

  if (!body || typeof body.localId !== "string" || typeof body.diagnosisId !== "string" || !body.answers) {
    return NextResponse.json({ error: "回答データが不足しています。" }, { status: 400 });
  }

  const config = getBodyCheckConfig(body.diagnosisId);
  if (!config) {
    return NextResponse.json({ error: "不正な診断種別です。" }, { status: 400 });
  }
  if (!isValidProfile(body.profile)) {
    return NextResponse.json({ error: "回答データが不足しています。" }, { status: 400 });
  }

  const result = scoreBodyCheck(config, body.answers);
  const id = randomUUID();

  const client = getSupabaseServerClient();
  if (client) {
    const { error } = await client.from("body_check_results").insert({
      id,
      local_id: body.localId,
      diagnosis_id: result.diagnosisId,
      age_band: body.profile.ageBand,
      gender: body.profile.gender,
      score: result.score,
      result_type: result.typeKey ?? result.tier,
      primary_menu: result.primaryMenu,
      secondary_menu: result.secondaryMenu ?? null,
      answers: body.answers,
    });
    if (error) {
      // Supabase保存に失敗しても、診断結果自体はユーザーに返却する（体験を止めない）
      console.error("Supabase insert failed (body_check_results):", error.message);
    }
  }

  return NextResponse.json({ id, result });
}
