import "server-only";
import { getSupabaseAdminClient } from "./supabase/server";
import { PROFILE_QUESTIONS } from "./questions";
import { SLEEP_TYPE_LABELS } from "./types";
import type { AdminStats } from "./types";
import { DIAGNOSIS_MENU_ITEMS } from "./bodycheck/registry";
import { MENU_DEFS } from "./bodycheck/menus";
import type { MenuKey } from "./bodycheck/types";

const MAX_ROWS = 5000;

function labelMap<T extends string>(choices: { value: T; label: string }[]): Record<T, string> {
  return Object.fromEntries(choices.map((c) => [c.value, c.label])) as Record<T, string>;
}

const AGE_LABELS = labelMap(PROFILE_QUESTIONS.ageBand.choices);
const GENDER_LABELS = labelMap(PROFILE_QUESTIONS.gender.choices);
const DIAGNOSIS_LABELS: Record<string, string> = Object.fromEntries(
  DIAGNOSIS_MENU_ITEMS.map((item) => [item.id, item.title])
);

function countBy<T extends string>(values: T[], labels: Record<string, string>): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    const label = labels[v] ?? v;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
}

interface SleepResultRow {
  id: string;
  created_at: string;
  local_id: string;
  age_band: string;
  gender: string;
  total_score: number;
  sleep_type: string;
  category_scores: Record<string, number>;
}

interface BodyResultRow {
  id: string;
  created_at: string;
  local_id: string;
  diagnosis_id: string;
  age_band: string | null;
  gender: string | null;
  score: number;
  result_type: string;
  primary_menu: string;
  secondary_menu: string | null;
}

interface ClickRow {
  result_id: string;
  target: string;
  diagnosis_id: string | null;
  menu_key: string | null;
}

/** 診断の種類を問わず共通で扱うための正規化済み1件分のレコード */
interface UnifiedRow {
  id: string;
  createdAt: string;
  localId: string;
  diagnosisId: string;
  ageBand: string | null;
  gender: string | null;
  score: number;
  primaryMenu: string;
}

/**
 * 管理画面の集計データを取得します（睡眠チェック＋ボディチェック5診断の合算）。
 * 実装メモ: クリニック規模の想定データ量（各テーブル最大5000件）を前提に、生データをまとめて取得し
 * JavaScript側で集計しています。データ量が大きくなる場合はSupabaseのRPC(SQL関数)による
 * 集計に切り替えることを推奨します。
 */
export async function getAdminStats(): Promise<AdminStats> {
  const client = getSupabaseAdminClient();
  if (!client) {
    return emptyStats("Supabase未設定のため、データがありません。.env.local を設定してください。");
  }

  const [sleepRes, bodyRes, clicksRes] = await Promise.all([
    client
      .from("sleep_check_results")
      .select("id, created_at, local_id, age_band, gender, total_score, sleep_type, category_scores")
      .order("created_at", { ascending: false })
      .limit(MAX_ROWS),
    client
      .from("body_check_results")
      .select("id, created_at, local_id, diagnosis_id, age_band, gender, score, result_type, primary_menu, secondary_menu")
      .order("created_at", { ascending: false })
      .limit(MAX_ROWS),
    client.from("click_events").select("result_id, target, diagnosis_id, menu_key").limit(MAX_ROWS * 3),
  ]);

  if (sleepRes.error) {
    throw new Error(`Supabaseからのデータ取得に失敗しました: ${sleepRes.error.message}`);
  }
  // body_check_results / menu_settings はボディチェック拡張で追加した新しいテーブルです。
  // supabase/schema.sql の追加分マイグレーションを未実行の環境でも、既存の睡眠チェック集計は
  // 引き続き表示できるよう、このテーブルのエラーは握りつぶして「0件」として扱います。
  if (bodyRes.error) {
    console.error("body_check_results の取得に失敗しました（未マイグレーションの可能性）:", bodyRes.error.message);
  }

  const sleepRows = (sleepRes.data ?? []) as SleepResultRow[];
  const bodyRows = (bodyRes.data ?? []) as BodyResultRow[];
  const clickRows = (clicksRes.data ?? []) as ClickRow[];

  const unifiedRows: UnifiedRow[] = [
    ...sleepRows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      localId: r.local_id,
      diagnosisId: "sleep",
      ageBand: r.age_band,
      gender: r.gender,
      score: r.total_score,
      primaryMenu: "sleepSeitai",
    })),
    ...bodyRows.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      localId: r.local_id,
      diagnosisId: r.diagnosis_id,
      ageBand: r.age_band,
      gender: r.gender,
      score: r.score,
      primaryMenu: r.primary_menu,
    })),
  ];

  if (unifiedRows.length === 0) {
    return emptyStats("まだ回答データがありません。診断が実施されるとここに集計結果が表示されます。");
  }

  const totalResponses = unifiedRows.length;
  const averageScore = Math.round(unifiedRows.reduce((sum, r) => sum + r.score, 0) / totalResponses);

  const byAgeBand = countBy(
    unifiedRows.map((r) => r.ageBand).filter((v): v is string => !!v),
    AGE_LABELS
  );
  const byGender = countBy(
    unifiedRows.map((r) => r.gender).filter((v): v is string => !!v),
    GENDER_LABELS
  );
  const bySleepType = countBy(sleepRows.map((r) => r.sleep_type), SLEEP_TYPE_LABELS);

  const byDiagnosis = countBy(unifiedRows.map((r) => r.diagnosisId), DIAGNOSIS_LABELS);

  const menuNameLabels: Record<string, string> = Object.fromEntries(
    Object.values(MENU_DEFS).map((m) => [m.key, m.name])
  );
  const byMenu = countBy(unifiedRows.map((r) => r.primaryMenu), menuNameLabels);

  const nocturiaRiskCount = sleepRows.filter((r) => (r.category_scores?.nocturia ?? 100) < 50).length;
  const nocturiaRiskRate = sleepRows.length > 0 ? Math.round((nocturiaRiskCount / sleepRows.length) * 1000) / 10 : 0;

  const resultIdsWithClick = (targets: string[]) =>
    new Set(clickRows.filter((c) => targets.includes(c.target)).map((c) => c.result_id));

  const bookingClickIds = resultIdsWithClick(["booking", "tel"]);
  const lineClickIds = resultIdsWithClick(["line"]);
  const bookingClickRate = Math.round((bookingClickIds.size / totalResponses) * 1000) / 10;
  const lineClickRate = Math.round((lineClickIds.size / totalResponses) * 1000) / 10;

  // 改善率: 睡眠チェックで同一デバイス(local_id)で2回以上回答があり、最新スコアが初回より高いものの割合
  const byLocalId = new Map<string, SleepResultRow[]>();
  sleepRows.forEach((r) => {
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
  unifiedRows.forEach((r) => {
    const month = r.createdAt.slice(0, 7);
    const entry = monthlyMap.get(month) ?? { count: 0, scoreSum: 0 };
    entry.count += 1;
    entry.scoreSum += r.score;
    monthlyMap.set(month, entry);
  });
  const monthlyTrend = Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => ({ month, count: v.count, averageScore: Math.round(v.scoreSum / v.count) }));

  // 診断×メニュー別クリック数・クリック率（「どの診断から、どのメニューの予約ボタンが何回押されたか」）
  const diagnosisCounts = new Map<string, number>();
  unifiedRows.forEach((r) => diagnosisCounts.set(r.diagnosisId, (diagnosisCounts.get(r.diagnosisId) ?? 0) + 1));

  const menuClickCounts = new Map<string, number>();
  clickRows
    .filter((c) => c.target === "booking" || c.target === "tel")
    .forEach((c) => {
      // 旧データ（マイグレーション前）は diagnosis_id / menu_key が空のため、睡眠チェックとして扱う
      const diagId = c.diagnosis_id ?? "sleep";
      const menuKey = c.menu_key ?? "sleepSeitai";
      const key = `${diagId}::${menuKey}`;
      menuClickCounts.set(key, (menuClickCounts.get(key) ?? 0) + 1);
    });

  const menuClicks = Array.from(menuClickCounts.entries())
    .map(([key, clicks]) => {
      const [diagId = "sleep", menuKey = "sleepSeitai"] = key.split("::");
      const diagnosisCount = diagnosisCounts.get(diagId) ?? 0;
      const clickRate = diagnosisCount > 0 ? Math.round((clicks / diagnosisCount) * 1000) / 10 : 0;
      return {
        diagnosisLabel: DIAGNOSIS_LABELS[diagId] ?? diagId,
        menuLabel: MENU_DEFS[menuKey as MenuKey]?.name ?? menuKey,
        diagnosisCount,
        clicks,
        clickRate,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);

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
    dataWindowNote: `直近最大${MAX_ROWS}件（診断種類ごと）のデータを集計しています。`,
    byDiagnosis,
    byMenu,
    menuClicks,
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
    byDiagnosis: [],
    byMenu: [],
    menuClicks: [],
  };
}

const CSV_COLUMNS = [
  "id",
  "created_at",
  "diagnosis_id",
  "local_id",
  "age_band",
  "gender",
  "score",
  "result_type",
  "primary_menu",
  "secondary_menu",
  "sleep_age",
  "tier",
  "category_scores",
  "answers",
] as const;

function escapeCsv(val: unknown): string {
  const s = typeof val === "object" && val !== null ? JSON.stringify(val) : String(val ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

/** 睡眠チェック・ボディチェック5診断すべてを1つのCSVにまとめて出力します。 */
export async function exportResultsCsv(): Promise<string> {
  const client = getSupabaseAdminClient();
  if (!client) return "";

  const [sleepRes, bodyRes] = await Promise.all([
    client.from("sleep_check_results").select("*").order("created_at", { ascending: false }).limit(MAX_ROWS),
    client.from("body_check_results").select("*").order("created_at", { ascending: false }).limit(MAX_ROWS),
  ]);

  const sleepData = (sleepRes.data ?? []) as Record<string, unknown>[];
  const bodyData = (bodyRes.data ?? []) as Record<string, unknown>[];
  if (sleepData.length === 0 && bodyData.length === 0) return "";

  type CsvRow = Record<(typeof CSV_COLUMNS)[number], unknown> & { created_at: string };

  const sleepCsvRows: CsvRow[] = sleepData.map((row) => ({
    id: row.id,
    created_at: row.created_at as string,
    diagnosis_id: "sleep",
    local_id: row.local_id,
    age_band: row.age_band,
    gender: row.gender,
    score: row.total_score,
    result_type: row.sleep_type,
    primary_menu: "sleepSeitai",
    secondary_menu: "",
    sleep_age: row.sleep_age,
    tier: row.tier,
    category_scores: row.category_scores,
    answers: row.answers,
  }));

  const bodyCsvRows: CsvRow[] = bodyData.map((row) => ({
    id: row.id,
    created_at: row.created_at as string,
    diagnosis_id: row.diagnosis_id,
    local_id: row.local_id,
    age_band: row.age_band,
    gender: row.gender,
    score: row.score,
    result_type: row.result_type,
    primary_menu: row.primary_menu,
    secondary_menu: row.secondary_menu ?? "",
    sleep_age: "",
    tier: "",
    category_scores: "",
    answers: row.answers,
  }));

  const allRows = [...sleepCsvRows, ...bodyCsvRows].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const lines = [CSV_COLUMNS.join(",")];
  for (const row of allRows) {
    lines.push(CSV_COLUMNS.map((col) => escapeCsv(row[col])).join(","));
  }
  return lines.join("\n");
}
