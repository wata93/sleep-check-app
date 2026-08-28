"use client";

import { Button } from "@/components/ui/Button";
import { CLINIC_TEL, TEL_HREF } from "@/lib/constants";
import { MENU_DEFS } from "@/lib/bodycheck/menus";
import { useMenuConfig } from "@/lib/bodycheck/useMenuConfig";
import { trackClick } from "@/components/result/CtaButtons";
import type { DiagnosisId, MenuKey } from "@/lib/bodycheck/types";

interface MenuCtaProps {
  resultId: string;
  diagnosisId: DiagnosisId;
  menuKey: MenuKey;
}

/** ボディチェック結果画面のメインCTA（一番おすすめのメニュー・最も目立つ位置に設置） */
export function PrimaryMenuCta({ resultId, diagnosisId, menuKey }: MenuCtaProps) {
  const def = MENU_DEFS[menuKey];
  const menu = useMenuConfig(menuKey, { bookingUrl: def.defaultBookingUrl, ctaLabel: def.defaultCtaLabel });

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        fullWidth
        onClick={() => {
          trackClick(resultId, "booking", diagnosisId, menuKey);
          window.open(menu.bookingUrl, "_blank", "noopener,noreferrer");
        }}
      >
        {menu.ctaLabel}
      </Button>
      <a
        href={TEL_HREF}
        onClick={() => trackClick(resultId, "tel", diagnosisId, menuKey)}
        className="flex flex-col items-center justify-center gap-0.5 rounded-full font-bold text-center min-h-[3.25rem] px-6 py-3 bg-white text-navy-800 border-2 border-navy-100 shadow-card hover:border-navy-300 active:scale-95 transition-all"
      >
        <span className="text-sm">📞 お問い合わせ、ご予約はこちら</span>
        <span className="text-base">{CLINIC_TEL}</span>
      </a>
    </div>
  );
}

/** 関連メニュー（小さく表示。強く売り込まないよう控えめなデザイン） */
export function SecondaryMenuCard({ resultId, diagnosisId, menuKey }: MenuCtaProps) {
  const def = MENU_DEFS[menuKey];

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-skyfog-50 px-4 py-3">
      <div>
        <p className="text-xs text-navy-400 mb-0.5">さらにこんなケアもおすすめです</p>
        <p className="text-sm font-bold text-navy-800">{def.name}</p>
      </div>
      <a
        href={TEL_HREF}
        onClick={() => trackClick(resultId, "tel", diagnosisId, menuKey)}
        className="flex-none flex flex-col items-center leading-tight text-xs font-bold text-navy-600 border-2 border-navy-200 rounded-full px-4 py-2 hover:border-navy-400 active:scale-95 transition-all"
      >
        <span>お問い合わせはこちら</span>
        <span className="text-[11px] font-semibold text-navy-500">{CLINIC_TEL}</span>
      </a>
    </div>
  );
}
