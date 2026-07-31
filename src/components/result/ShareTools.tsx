"use client";

import { useState } from "react";
import { APP_NAME, SITE_URL } from "@/lib/constants";
import type { ScoringResult } from "@/lib/types";
import { SLEEP_TYPE_LABELS } from "@/lib/types";

interface ShareToolsProps {
  resultId: string;
  result: ScoringResult;
}

export function ShareTools({ resultId, result }: ShareToolsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${SITE_URL}/result?id=${resultId}`;
  const shareText = `【${APP_NAME}】睡眠スコア${result.totalScore}点（${SLEEP_TYPE_LABELS[result.sleepType]}）でした。あなたも診断してみませんか？\n${shareUrl}`;

  function handlePrint() {
    window.print();
  }

  function handleLineShare() {
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  }

  function handleEmailShare() {
    const subject = encodeURIComponent(`${APP_NAME} 診断結果`);
    const body = encodeURIComponent(shareText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  async function handleSnsShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: APP_NAME, text: shareText, url: shareUrl });
        return;
      } catch {
        // ユーザーがキャンセルした場合等は何もしない
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
    }
  }

  const items = [
    { label: "PDF保存", icon: "📄", onClick: handlePrint },
    { label: "LINE送信", icon: "💬", onClick: handleLineShare },
    { label: "メール送信", icon: "✉️", onClick: handleEmailShare },
    { label: copied ? "コピー完了" : "SNSシェア", icon: "🔗", onClick: handleSnsShare },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className="flex flex-col items-center gap-1 rounded-2xl bg-white border border-navy-100 py-3 text-navy-700 hover:border-skyfog-400 hover:bg-skyfog-50 transition-colors active:scale-95"
        >
          <span className="text-xl" aria-hidden="true">
            {item.icon}
          </span>
          <span className="text-[11px] font-semibold">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
