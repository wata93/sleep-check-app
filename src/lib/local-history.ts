"use client";

import type { BodyCheckResult, BodyCheckStoredResult, DiagnosisId } from "./bodycheck/types";
import { getDiagnosisMenuItem } from "./bodycheck/registry";
import type { ProfileAnswers, ScoringResult, StoredResult } from "./types";
import { SLEEP_TYPE_LABELS } from "./types";

const LOCAL_ID_KEY = "sc_local_id";
const HISTORY_INDEX_KEY = "sc_history_index";
const RESULT_CACHE_PREFIX = "sc_result_";
const BODY_HISTORY_INDEX_KEY = "sc_body_history_index";
const BODY_RESULT_CACHE_PREFIX = "sc_body_result_";
const MAX_HISTORY = 30;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** 端末固有の匿名ID。個人情報は含まず、再診断の改善率トラッキングにのみ利用します。 */
export function getOrCreateLocalId(): string {
  if (typeof window === "undefined") return uuid();
  let id = window.localStorage.getItem(LOCAL_ID_KEY);
  if (!id) {
    id = uuid();
    window.localStorage.setItem(LOCAL_ID_KEY, id);
  }
  return id;
}

export function saveResultToLocalHistory(id: string, result: ScoringResult, profile: ProfileAnswers): void {
  if (typeof window === "undefined") return;
  const stored: StoredResult = { ...result, id, createdAt: new Date().toISOString(), profile };
  try {
    window.localStorage.setItem(`${RESULT_CACHE_PREFIX}${id}`, JSON.stringify(stored));
    const index = getHistoryIndex();
    const updated = [{ id, createdAt: stored.createdAt, totalScore: stored.totalScore }, ...index].slice(0, MAX_HISTORY);
    window.localStorage.setItem(HISTORY_INDEX_KEY, JSON.stringify(updated));
  } catch {
    // localStorage容量超過等は握りつぶし、結果表示自体は継続させる
  }
}

export function getCachedResult(id: string): StoredResult | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(`${RESULT_CACHE_PREFIX}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredResult;
  } catch {
    return null;
  }
}

interface HistoryIndexEntry {
  id: string;
  createdAt: string;
  totalScore: number;
}

function getHistoryIndex(): HistoryIndexEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(HISTORY_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HistoryIndexEntry[];
  } catch {
    return [];
  }
}

export function getLocalHistory(): StoredResult[] {
  const index = getHistoryIndex();
  return index
    .map((entry) => getCachedResult(entry.id))
    .filter((r): r is StoredResult => r !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** ここから: ボディチェック（睡眠以外の5診断）用の履歴保存。睡眠チェックの保存処理とは独立しています。 */

export function saveBodyCheckResultToLocalHistory(id: string, result: BodyCheckResult, profile: ProfileAnswers): void {
  if (typeof window === "undefined") return;
  const stored: BodyCheckStoredResult = {
    ...result,
    id,
    createdAt: new Date().toISOString(),
    ageBand: profile.ageBand,
    gender: profile.gender,
  };
  try {
    window.localStorage.setItem(`${BODY_RESULT_CACHE_PREFIX}${id}`, JSON.stringify(stored));
    const index = getBodyHistoryIndex();
    const updated = [
      { id, createdAt: stored.createdAt, score: stored.score, diagnosisId: stored.diagnosisId },
      ...index,
    ].slice(0, MAX_HISTORY);
    window.localStorage.setItem(BODY_HISTORY_INDEX_KEY, JSON.stringify(updated));
  } catch {
    // localStorage容量超過等は握りつぶし、結果表示自体は継続させる
  }
}

export function getCachedBodyCheckResult(id: string): BodyCheckStoredResult | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(`${BODY_RESULT_CACHE_PREFIX}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BodyCheckStoredResult;
  } catch {
    return null;
  }
}

interface BodyHistoryIndexEntry {
  id: string;
  createdAt: string;
  score: number;
  diagnosisId: DiagnosisId;
}

function getBodyHistoryIndex(): BodyHistoryIndexEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(BODY_HISTORY_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as BodyHistoryIndexEntry[];
  } catch {
    return [];
  }
}

/** 履歴一覧画面（/history）表示用の共通型。睡眠・ボディチェックの両方を1つのリストにまとめます。 */
export interface UnifiedHistoryEntry {
  id: string;
  diagnosisId: DiagnosisId;
  createdAt: string;
  score: number;
  title: string;
  typeLabel: string;
  href: string;
}

export function getAllLocalHistory(): UnifiedHistoryEntry[] {
  const sleepEntries: UnifiedHistoryEntry[] = getLocalHistory().map((r) => ({
    id: r.id,
    diagnosisId: "sleep",
    createdAt: r.createdAt,
    score: r.totalScore,
    title: getDiagnosisMenuItem("sleep")?.title ?? "睡眠チェック",
    typeLabel: SLEEP_TYPE_LABELS[r.sleepType],
    href: `/result?id=${r.id}&type=sleep`,
  }));

  const bodyIndex = getBodyHistoryIndex();
  const bodyEntries: UnifiedHistoryEntry[] = bodyIndex
    .map((entry) => {
      const cached = getCachedBodyCheckResult(entry.id);
      if (!cached) return null;
      const menuItem = getDiagnosisMenuItem(cached.diagnosisId);
      const item: UnifiedHistoryEntry = {
        id: cached.id,
        diagnosisId: cached.diagnosisId,
        createdAt: cached.createdAt,
        score: cached.score,
        title: menuItem?.title ?? cached.diagnosisId,
        typeLabel: cached.typeLabel ?? cached.headline,
        href: `/result?id=${cached.id}&type=${cached.diagnosisId}`,
      };
      return item;
    })
    .filter((e): e is UnifiedHistoryEntry => e !== null);

  return [...sleepEntries, ...bodyEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
