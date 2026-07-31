"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { getLocalHistory } from "@/lib/local-history";
import { SLEEP_TYPE_LABELS, type StoredResult } from "@/lib/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<StoredResult[] | null>(null);

  useEffect(() => {
    setHistory(getLocalHistory());
  }, []);

  return (
    <main className="min-h-dvh px-4 py-10">
      <div className="max-w-md mx-auto flex flex-col gap-5">
        <h1 className="text-xl font-extrabold text-navy-900">結果履歴</h1>
        <p className="text-sm text-navy-500 -mt-3">
          この端末のブラウザに保存された過去の診断結果です。他の端末とは共有されません。
        </p>

        {history === null && <p className="text-sm text-navy-400">読み込み中...</p>}

        {history !== null && history.length === 0 && (
          <Card className="text-center text-navy-500">
            まだ診断履歴がありません。
          </Card>
        )}

        {history?.map((item) => (
          <Link key={item.id} href={`/result?id=${item.id}`}>
            <Card className="!p-4 flex items-center justify-between hover:border-skyfog-400 border border-transparent transition-colors">
              <div>
                <p className="text-xs text-navy-400">
                  {new Date(item.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p className="font-bold text-navy-900">{SLEEP_TYPE_LABELS[item.sleepType]}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-navy-800">{item.totalScore}</p>
                <p className="text-[11px] text-navy-400">点</p>
              </div>
            </Card>
          </Link>
        ))}

        <LinkButton href="/check" variant="primary" fullWidth>
          新しく診断する
        </LinkButton>
      </div>
    </main>
  );
}
