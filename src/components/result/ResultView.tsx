"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { LinkButton } from "@/components/ui/Button";
import { TierHero } from "@/components/result/TierHero";
import { RadarChartResult } from "@/components/result/RadarChartResult";
import { CategoryDetailCards } from "@/components/result/CategoryDetailCards";
import { CtaButtons } from "@/components/result/CtaButtons";
import { ShareTools } from "@/components/result/ShareTools";
import { getCachedResult } from "@/lib/local-history";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { scoreQuiz } from "@/lib/scoring";
import { TIER_COPY } from "@/lib/constants";
import { SLEEP_TYPE_LABELS, type ProfileAnswers, type StoredResult } from "@/lib/types";

export function ResultView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [result, setResult] = useState<StoredResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notFound">("loading");

  useEffect(() => {
    if (!id) {
      setStatus("notFound");
      return;
    }
    const cached = getCachedResult(id);
    if (cached) {
      setResult(cached);
      setStatus("ready");
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) {
      setStatus("notFound");
      return;
    }

    async function fetchFromSupabase() {
      try {
        const { data } = await client!.from("sleep_check_results").select("*").eq("id", id).maybeSingle();
        if (!data) {
          setStatus("notFound");
          return;
        }
        const profile: ProfileAnswers = {
          ageBand: data.age_band,
          gender: data.gender,
        };
        // 保存済みの生回答から採点ロジックを再実行し、状態文言・アドバイス等を完全に復元する
        const recomputed = scoreQuiz(profile, data.answers);
        const restored: StoredResult = {
          ...recomputed,
          id: data.id,
          createdAt: data.created_at,
          profile,
        };
        setResult(restored);
        setStatus("ready");
      } catch {
        setStatus("notFound");
      }
    }

    void fetchFromSupabase();
  }, [id]);

  if (status === "loading") {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6">
        <div className="h-10 w-10 rounded-full border-4 border-navy-100 border-t-navy-700 animate-spin" />
      </main>
    );
  }

  if (status === "notFound" || !result) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-navy-700 font-semibold">結果が見つかりませんでした。</p>
        <LinkButton href="/check" variant="primary">
          もう一度チェックする
        </LinkButton>
      </main>
    );
  }

  const copy = TIER_COPY[result.tier];

  return (
    <main className="min-h-dvh px-4 py-10 print-area">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <TierHero tier={result.tier} />

        <Card className="flex flex-col items-center gap-3">
          <ScoreGauge score={result.totalScore} />
          <div className="flex items-center gap-4 text-center">
            <div>
              <p className="text-2xl font-extrabold text-navy-900">{result.sleepAge}<span className="text-sm ml-0.5">歳</span></p>
              <p className="text-xs text-navy-400">推定睡眠年齢</p>
            </div>
            <div className="h-8 w-px bg-navy-100" />
            <div>
              <p className="text-lg font-extrabold text-navy-900">{SLEEP_TYPE_LABELS[result.sleepType]}</p>
              <p className="text-xs text-navy-400">あなたの睡眠タイプ</p>
            </div>
          </div>
        </Card>

        <div className="no-print">
          <CtaButtons resultId={result.id} ctaLabel={copy.ctaLabel} />
        </div>

        <Card>
          <h2 className="font-bold text-navy-900 mb-3">5項目レーダーチャート</h2>
          <RadarChartResult categories={result.categories} />
        </Card>

        {result.topProblems.length > 0 && (
          <Card>
            <h2 className="font-bold text-navy-900 mb-3">問題点ベスト3</h2>
            <ol className="flex flex-col gap-2">
              {result.topProblems.map((p, i) => (
                <li key={p} className="flex items-start gap-2 text-sm text-navy-700">
                  <span className="flex-none w-5 h-5 rounded-full bg-navy-800 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>
          </Card>
        )}

        <div>
          <h2 className="font-bold text-navy-900 mb-3 px-1">項目別くわしい結果</h2>
          <CategoryDetailCards categories={result.categories} />
        </div>

        {result.improvementPoints.length > 0 && (
          <Card>
            <h2 className="font-bold text-navy-900 mb-3">改善ポイント3つ</h2>
            <ul className="flex flex-col gap-2">
              {result.improvementPoints.map((p) => (
                <li key={p} className="text-sm text-navy-700 leading-relaxed bg-skyfog-50 rounded-xl px-3 py-2">
                  {p}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="no-print">
          <h2 className="font-bold text-navy-900 mb-3 px-1">結果を保存・共有</h2>
          <ShareTools resultId={result.id} result={result} />
        </div>

        <div className="no-print flex flex-col items-center gap-3 mt-2">
          <LinkButton href="/history" variant="ghost" fullWidth>
            過去の結果履歴を見る
          </LinkButton>
          <a href="/select" className="text-sm font-medium text-navy-400 hover:text-navy-600 mt-1">
            別の身体チェックをする
          </a>
        </div>
      </div>
    </main>
  );
}
