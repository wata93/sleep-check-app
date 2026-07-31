"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;

/**
 * Supabase未設定（.env.local未作成）の環境でも画面確認ができるよう、
 * 設定が無い場合は null を返します。呼び出し側は null チェックの上、
 * localStorageキャッシュ等へフォールバックしてください。
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return browserClient;
}
