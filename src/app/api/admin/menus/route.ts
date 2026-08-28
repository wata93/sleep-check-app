import { NextResponse } from "next/server";
import { MENU_KEYS, resolveAllMenus, type MenuOverride } from "@/lib/bodycheck/menus";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// このルートは middleware.ts の matcher (/api/admin/:path*) により、管理画面ログイン必須です。

export async function GET() {
  const client = getSupabaseAdminClient();
  let overrides: MenuOverride[] = [];
  let supabaseConfigured = true;
  if (!client) {
    supabaseConfigured = false;
  } else {
    const { data } = await client.from("menu_settings").select("key, booking_url, cta_label");
    overrides = (data ?? []) as MenuOverride[];
  }
  return NextResponse.json({ menus: resolveAllMenus(overrides), supabaseConfigured });
}

interface UpdateBody {
  key: string;
  bookingUrl: string;
  ctaLabel: string;
}

export async function PUT(request: Request) {
  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
  }

  if (!body || typeof body.key !== "string" || !MENU_KEYS.includes(body.key as (typeof MENU_KEYS)[number])) {
    return NextResponse.json({ error: "不正なメニューキーです。" }, { status: 400 });
  }

  const client = getSupabaseAdminClient();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase未設定のため保存できません。.env.local を確認してください。" },
      { status: 500 }
    );
  }

  const { error } = await client.from("menu_settings").upsert({
    key: body.key,
    booking_url: body.bookingUrl?.trim() || null,
    cta_label: body.ctaLabel?.trim() || null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: `保存に失敗しました: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
