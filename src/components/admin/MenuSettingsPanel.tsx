"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { EffectiveMenu } from "@/lib/bodycheck/menus";

interface RowState {
  key: string;
  name: string;
  bookingUrl: string;
  ctaLabel: string;
  saving: boolean;
  saved: boolean;
}

/**
 * メニューごとの予約URL・ボタン文言を編集する管理画面パネル。
 * 空欄で保存すると初期値（コード上のデフォルト）に戻ります。
 */
export function MenuSettingsPanel() {
  const [rows, setRows] = useState<RowState[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);

  useEffect(() => {
    fetch("/api/admin/menus")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "取得に失敗しました");
        setSupabaseConfigured(data.supabaseConfigured !== false);
        setRows(
          (data.menus as EffectiveMenu[]).map((m) => ({
            key: m.key,
            name: m.name,
            bookingUrl: m.bookingUrl,
            ctaLabel: m.ctaLabel,
            saving: false,
            saved: false,
          }))
        );
      })
      .catch((e) => setError(e.message));
  }, []);

  function updateRow(key: string, patch: Partial<RowState>) {
    setRows((prev) => (prev ? prev.map((r) => (r.key === key ? { ...r, ...patch, saved: false } : r)) : prev));
  }

  async function handleSave(row: RowState) {
    updateRow(row.key, { saving: true });
    try {
      const res = await fetch("/api/admin/menus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: row.key, bookingUrl: row.bookingUrl, ctaLabel: row.ctaLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存に失敗しました");
      updateRow(row.key, { saving: false, saved: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
      updateRow(row.key, { saving: false });
    }
  }

  if (error) {
    return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>;
  }
  if (!rows) {
    return <p className="text-sm text-navy-400">読み込み中...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {!supabaseConfigured && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Supabase未設定のため、ここでの変更は保存されません（.env.local の設定後にご利用ください）。
        </p>
      )}
      {rows.map((row) => (
        <div key={row.key} className="rounded-2xl border border-navy-100 p-4 flex flex-col gap-2">
          <p className="text-sm font-bold text-navy-900">{row.name}</p>
          <label className="text-xs text-navy-500">
            予約URL
            <input
              type="url"
              value={row.bookingUrl}
              onChange={(e) => updateRow(row.key, { bookingUrl: e.target.value })}
              className="mt-1 w-full rounded-xl border-2 border-navy-100 px-3 py-2 text-sm focus:border-navy-500 outline-none"
            />
          </label>
          <label className="text-xs text-navy-500">
            予約ボタンの文言
            <input
              type="text"
              value={row.ctaLabel}
              onChange={(e) => updateRow(row.key, { ctaLabel: e.target.value })}
              className="mt-1 w-full rounded-xl border-2 border-navy-100 px-3 py-2 text-sm focus:border-navy-500 outline-none"
            />
          </label>
          <div className="flex items-center gap-3 mt-1">
            <Button
              variant="secondary"
              className="!px-4 !py-2 !text-xs"
              disabled={row.saving}
              onClick={() => handleSave(row)}
            >
              {row.saving ? "保存中..." : "保存"}
            </Button>
            {row.saved && <span className="text-xs text-navy-500">保存しました</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
