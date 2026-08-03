import "server-only";
import { getSupabaseAdminClient } from "./supabase/server";
import { PROFILE_QUESTIONS } from "./questions";
import { SLEEP_TYPE_LABELS } from "./types";
import type { AdminStats } from "./types";

const MAX_ROWS = 5000;

function labelMap<T extends string>(choices: { value: T; label: string }[]): Record<T, string> {
  return Object.fromEntries(choices.map((c) => [c.value, c.label])) as Record<T, string>;
}

const AGE_LABELS = labelMap(PROFILE_QUESTIONS.ageBand.choices);
const GENDER_LABELS = labelMap(PROFILE_QUESTIONS.gender.choices);

function countBy<T extends string>(values: T[], labels: Record<string, string>): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    const label = labels[v] ?? v;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
}

interface ResultRow {
  id: string;
  created_at: string;
  local_id: string;
  age_band: string;
  gender: string;
  total_score: number;
  sleep_type: string;
  category_scores: Record<string, number>;
}

interface ClickRow {
  result_id: string;
  target: string;
}

/**
 * 管理画面の集計データを取得します。
 * 実装メモ: クリニック規模の想定データ量（最大5000件）を前提に、生データをまとめて取得し
 * JavaScript側で集計しています。データ量が大きくなる場合はSupabaseのRPC(SQL関数)による
 * 集計に切り替えることを推奨します。
 */
export async function getAdminStats(): Promise<AdminStats> {
  const client = getSupabaseAdminClient();
  if (!client) {
    return emptyStats("Supabase未設定のため、データがありません。.env.local を設定してください。");
  }

  const { data: results, error: resultsError } = await client
    .from("sleep_check_results")
    .select("id, created_at, local_id, age_band, gender, total_score, sleep_type, category_scores")
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);

  if (resultsError) {
    throw new Error(`Supabaseからのデータ取得に失敗しました: ${resultsError.message}`);
  }

  const rows = (results ?? []) as ResultRow[];

  const { data: clicks } = await client.from("click_events").select("result_id, target").limit(MAX_ROWS * 3);
  const clickRows = (clicks ?? []) as ClickRow[];

  if (rows.length === 0) {
    return emptyStats("まだ回答データがありません。診断が実施されるとここに集計結果が表示されます。");
  }

  const totalResponses = rows.length;
  const averageScore = Math.round(rows.reduce((sum, r) => sum + r.total_score, 0) / totalResponses);

  const byAgeBand = countBy(rows.map((r) => r.age_band), AGE_LABELS);
  const byGender = countBy(rows.map((r) => r.gender), GENDER_LABELS);
  const bySleepType = countBy(rows.map((r) => r.sleep_type), SLEEP_TYPE_LABELS);

  const nocturiaRiskCount = rows.filter((r) => (r.category_scores?.nocturia ?? 100) < 50).length;
  const nocturiaRiskRate = Math.round((nocturiaRiskCount / totalResponses) * 1000) / 10;

  const resultIdsWithClick = (targets: string[]) =>
    new Set(clickRows.filter((c) => targets.includes(c.target)).map((c) => c.result_id));

  const bookingClickIds = resultIdsWithClick(["booking", "tel"]);
  const lineClickIds = resultIdsWithClick(["line"]);
  const bookingClickRate = Math.round((bookingClickIds.size / totalResponses) * 1000) / 10;
  const lineClickRate = Math.round((lineClickIds.size / totalResponses) * 1000) / 10;

  // 改善率: 同一デバイス(local_id)で2回以上回答があり、最新スコアが初回より高いものの割合
  const byLocalId = new Map<string, ResultRow[]>();
  rows.forEach((r) => {
    if (!r.local_id) return;
    const list = byLocalId.get(r.local_id) ?? [];
    list.push(r);
    byLocalId.set(r.local_id, list);
  });
  const repeatUsers = Array.from(byLocalId.values()).filter((list) => list.length >= 2);
  const improvedUsers = repeatUsers.filter((list) => {
    const sorted = list.slice().sort((a, b) => a.created_at.localeCompare(b.created_at));
    const first = sorted[0]!;
    const last = sorted[sorted.length - 1]!;
    return last.total_score > first.total_score;
  });
  const improvementRate = repeatUsers.length > 0 ? Math.round((improvedUsers.length / repeatUsers.length) * 1000) / 10 : 0;

  const monthlyMap = new Map<string, { count: number; scoreSum: number }>();
  rows.forEach((r) => {
    const month = r.created_at.slice(0, 7);
    const entry = monthlyMap.get(month) ?? { count: 0, scoreSum: 0 };
    entry.count += 1;
    entry.scoreSum += r.total_score;
    monthlyMap.set(month, entry);
  });
  const monthlyTrend = Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => ({ month, count: v.count, averageScore: Math.round(v.scoreSum / v.count) }));

  return {
    totalResponses,
    averageScore,
    byAgeBand,
    byGender,
    bySleepType,
    nocturiaRiskRate,
    bookingClickRate,
    lineClickRate,
    improvementRate,
    monthlyTrend,
    generatedAt: new Date().toISOString(),
    dataWindowNote: `直近最大${MAX_ROWS}件のデータを集計しています。`,
  };
}

function emptyStats(note: string): AdminStats {
  return {
    totalResponses: 0,
    averageScore: 0,
    byAgeBand: [],
    byGender: [],
    bySleepType: [],
    nocturiaRiskRate: 0,
    bookingClickRate: 0,
    lineClickRate: 0,
    improvementRate: 0,
    monthlyTrend: [],
    generatedAt: new Date().toISOString(),
    dataWindowNote: note,
  };
}

export async function exportResultsCsv(): Promise<string> {
  const client = getSupabaseAdminClient();
  if (!client) return "";
  const { data, error } = await client
    .from("sleep_check_results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);
  if (error || !data) return "";
  if (data.length === 0) return "";

  const headers = Object.keys(data[0] as Record<string, unknown>);
  const escapeCsv = (val: unknown) => {
    const s = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(",")];
  for (const row of data as Record<string, unknown>[]) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(","));
  }
  return lines.join("\n");
}
