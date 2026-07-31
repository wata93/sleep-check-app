"use client";

import { Button } from "@/components/ui/Button";
import { BOOKING_URL, CLINIC_TEL, TEL_HREF } from "@/lib/constants";
import type { ClickTarget } from "@/lib/types";

function trackClick(resultId: string, target: ClickTarget) {
  try {
    navigator.sendBeacon?.(
      "/api/track-click",
      new Blob([JSON.stringify({ resultId, target })], { type: "application/json" })
    );
  } catch {
    fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resultId, target }),
      keepalive: true,
    }).catch(() => {});
  }
}

interface CtaButtonsProps {
  resultId: string;
  ctaLabel: string;
}

export function CtaButtons({ resultId, ctaLabel }: CtaButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        fullWidth
        onClick={() => {
          trackClick(resultId, "booking");
          window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
        }}
      >
        {ctaLabel}
      </Button>
      <a
        href={TEL_HREF}
        onClick={() => trackClick(resultId, "tel")}
        className="inline-flex items-center justify-center gap-2 rounded-full font-bold text-center min-h-[3.25rem] px-6 py-4 text-base bg-white text-navy-800 border-2 border-navy-100 shadow-card hover:border-navy-300 active:scale-95 transition-all"
      >
        📞 {CLINIC_TEL}
      </a>
    </div>
  );
}
