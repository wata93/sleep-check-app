import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { scoreQuiz } from "@/lib/scoring";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileAnswers, SymptomAnswers } from "@/lib/types";

export const runtime = "nodejs";

interface SubmitBody {
  localId: string;
  profile: ProfileAnswers;
  answers: SymptomAnswers;
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

  if (!body || typeof body.localId !== "string" || !isValidProfile(body.profile) || !body.answers) {
    return NextResponse.json({ error: "回答データが不足しています。" }, { status: 400 });
  }

  const result = scoreQuiz(body.profile, body.answers);
  const id = randomUUID();

  const client = getSupabaseServerClient();
  if (client) {
    const { error } = await client.from("sleep_check_results").insert({
      id,
      local_id: body.localId,
      age_band: body.profile.ageBand,
      gender: body.profile.gender,
      total_score: result.totalScore,
      sleep_age: result.sleepAge,
      sleep_type: result.sleepType,
      tier: result.tier,
      category_scores: Object.fromEntries(result.categories.map((c) => [c.category, c.score])),
      answers: body.answers,
    });
    if (error) {
      // Supabase保存に失敗しても、診断結果自体はユーザーに返却する（体験を止めない）
      console.error("Supabase insert failed:", error.message);
    }
  }

  return NextResponse.json({ id, result });
}
