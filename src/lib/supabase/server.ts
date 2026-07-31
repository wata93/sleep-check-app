import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let adminClient: SupabaseClient | null = null;
let anonServerClient: SupabaseClient | null = null;

/**
 * Service Role Keyを使うサーバー専用クライアント（管理画面の集計・CSV出力用）。
 * このファイルは "server-only" のためAPI Route / Server Componentからのみ呼び出せます。
 * Service Role Keyは絶対にクライアントへ渡さないでください。
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!url || !serviceRoleKey) return null;
  if (!adminClient) {
    adminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}

/** 回答の受信・保存(insert)用。anon keyで十分なため、こちらを使用します。 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!anonServerClient) {
    anonServerClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return anonServerClient;
}
