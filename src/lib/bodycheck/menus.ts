import { BOOKING_URL } from "../constants";
import type { MenuKey } from "./types";

/**
 * おすすめメニューの一覧。
 * `defaultBookingUrl` / `defaultCtaLabel` はここに書いたものが初期値になり、
 * 管理画面（/admin/dashboard）から診断ごとに個別の予約URL・ボタン文言へ上書きできます
 * （上書き値は Supabase の menu_settings テーブルに保存されます。Supabase未設定の場合は
 * 初期値がそのまま使われます）。
 *
 * 新しいメニューを追加する場合は、ここに1件追加するだけで管理画面の一覧にも自動で表示されます。
 */
export interface MenuDef {
  key: MenuKey;
  name: string;
  defaultBookingUrl: string;
  defaultCtaLabel: string;
}

export const MENU_DEFS: Record<MenuKey, MenuDef> = {
  sleepSeitai: {
    key: "sleepSeitai",
    name: "睡眠整体",
    defaultBookingUrl: BOOKING_URL,
    defaultCtaLabel: "睡眠整体の体験予約はこちらから",
  },
  shoulderBackCare: {
    key: "shoulderBackCare",
    name: "肩こり・腰痛施術",
    defaultBookingUrl: BOOKING_URL,
    defaultCtaLabel: "ご予約はこちらから",
  },
  postureCorrection: {
    key: "postureCorrection",
    name: "猫背矯正",
    defaultBookingUrl: BOOKING_URL,
    defaultCtaLabel: "ご予約はこちらから",
  },
  halluxCare: {
    key: "halluxCare",
    name: "外反母趾ケア",
    defaultBookingUrl: BOOKING_URL,
    defaultCtaLabel: "ご予約はこちらから",
  },
  gaitGuidance: {
    key: "gaitGuidance",
    name: "歩行指導",
    defaultBookingUrl: BOOKING_URL,
    defaultCtaLabel: "ご予約はこちらから",
  },
  dietMenu: {
    key: "dietMenu",
    name: "ダイエットメニュー",
    defaultBookingUrl: BOOKING_URL,
    defaultCtaLabel: "ダイエット相談のご予約はこちらから",
  },
  beautyMenu: {
    key: "beautyMenu",
    name: "美肌施術",
    defaultBookingUrl: BOOKING_URL,
    defaultCtaLabel: "ご予約はこちらから",
  },
};

export const MENU_KEYS = Object.keys(MENU_DEFS) as MenuKey[];

export interface EffectiveMenu {
  key: MenuKey;
  name: string;
  bookingUrl: string;
  ctaLabel: string;
}

export interface MenuOverride {
  key: string;
  booking_url: string | null;
  cta_label: string | null;
}

/** 初期値と管理画面の上書き値をマージし、実際に使う予約URL・ボタン文言を確定します。 */
export function resolveMenu(key: MenuKey, overrides: MenuOverride[]): EffectiveMenu {
  const def = MENU_DEFS[key];
  const override = overrides.find((o) => o.key === key);
  return {
    key,
    name: def.name,
    bookingUrl: override?.booking_url || def.defaultBookingUrl,
    ctaLabel: override?.cta_label || def.defaultCtaLabel,
  };
}

export function resolveAllMenus(overrides: MenuOverride[]): EffectiveMenu[] {
  return MENU_KEYS.map((key) => resolveMenu(key, overrides));
}
