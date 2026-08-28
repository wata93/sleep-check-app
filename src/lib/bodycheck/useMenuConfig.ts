"use client";

import { useEffect, useState } from "react";
import { MENU_DEFS, type EffectiveMenu } from "./menus";
import type { MenuKey } from "./types";

interface MenuLink {
  bookingUrl: string;
  ctaLabel: string;
}

/**
 * 指定したメニューの実効設定（予約URL・ボタン文言）を取得します。
 * 管理画面で個別に上書きされていればその内容を、されていなければ `fallback`（呼び出し側が渡す
 * 初期値。睡眠チェックでは評価帯ごとの文言など）をそのまま使います。
 * 通信前・失敗時も常に `fallback` を表示するため、予約ボタンが表示されない事態は起きません。
 */
export function useMenuConfig(key: MenuKey, fallback: MenuLink): MenuLink {
  const def = MENU_DEFS[key];
  const [state, setState] = useState<MenuLink>(fallback);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/menus")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { menus?: EffectiveMenu[] } | null) => {
        if (cancelled || !data?.menus) return;
        const found = data.menus.find((m) => m.key === key);
        if (!found) return;
        setState({
          bookingUrl: found.bookingUrl !== def.defaultBookingUrl ? found.bookingUrl : fallback.bookingUrl,
          ctaLabel: found.ctaLabel !== def.defaultCtaLabel ? found.ctaLabel : fallback.ctaLabel,
        });
      })
      .catch(() => {
        // 取得失敗時は fallback のまま。予約導線を止めない。
      });
    return () => {
      cancelled = true;
    };
    // fallback はレンダーごとに新しいオブジェクトになり得るため依存配列には含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, def.defaultBookingUrl, def.defaultCtaLabel]);

  return state;
}
