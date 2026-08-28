import { NextResponse } from "next/server";
import { resolveAllMenus, type MenuOverride } from "@/lib/bodycheck/menus";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 全メニューの実効設定（初期値 + 管理画面での上書き）を返す公開API。
 * 結果画面の予約ボタン（URL・文言）はここから取得します。
 * Supabase未設定、またはまだ上書きが無い場合は初期値がそのまま返ります。
 */
export async function GET() {
  const client = getSupabaseServerClient();
  let overrides: MenuOverride[] = [];
  if (client) {
    const { data } = await client.from("menu_settings").select("key, booking_url, cta_label");
    overrides = (data ?? []) as MenuOverride[];
  }
  return NextResponse.json({ menus: resolveAllMenus(overrides) });
}
