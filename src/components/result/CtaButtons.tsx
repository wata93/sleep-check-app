"use client";

import { Button } from "@/components/ui/Button";
import { BOOKING_URL, CLINIC_TEL, TEL_HREF } from "@/lib/constants";
import { useMenuConfig } from "@/lib/bodycheck/useMenuConfig";
import type { ClickTarget } from "@/lib/types";

export function trackClick(resultId: string, target: ClickTarget, diagnosisId?: string, menuKey?: string) {
  const payload = JSON.stringify({ resultId, target, diagnosisId, menuKey });
  try {
    navigator.sendBeacon?.("/api/track-click", new Blob([payload], { type: "application/json" }));
  } catch {
    fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

interface CtaButtonsProps {
  resultId: string;
  ctaLabel: string;
}

/** 睡眠チェック結果画面用のCTA。予約URL・ボタン文言は管理画面の上書き設定があればそちらを優先します。 */
export function CtaButtons({ resultId, ctaLabel }: CtaButtonsProps) {
  const menu = useMenuConfig("sleepSeitai", { bookingUrl: BOOKING_URL, ctaLabel });

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        fullWidth
        onClick={() => {
          trackClick(resultId, "booking", "sleep", "sleepSeitai");
          window.open(menu.bookingUrl, "_blank", "noopener,noreferrer");
        }}
      >
        {menu.ctaLabel}
      </Button>
      <a
        href={TEL_HREF}
        onClick={() => trackClick(resultId, "tel", "sleep", "sleepSeitai")}
        className="inline-flex items-center justify-center gap-2 rounded-full font-bold text-center min-h-[3.25rem] px-6 py-4 text-base bg-white text-navy-800 border-2 border-navy-100 shadow-card hover:border-navy-300 active:scale-95 transition-all"
      >
        📞 {CLINIC_TEL}
      </a>
    </div>
  );
}
