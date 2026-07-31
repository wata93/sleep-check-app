"use client";

import type { ProfileAnswers, ScoringResult, StoredResult } from "./types";

const LOCAL_ID_KEY = "sc_local_id";
const HISTORY_INDEX_KEY = "sc_history_index";
const RESULT_CACHE_PREFIX = "sc_result_";
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
