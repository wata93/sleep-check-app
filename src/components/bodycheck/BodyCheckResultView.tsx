"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { getCachedBodyCheckResult } from "@/lib/local-history";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { scoreBodyCheck } from "@/lib/bodycheck/scoring";
import { getBodyCheckConfig, getDiagnosisMenuItem } from "@/lib/bodycheck/registry";
import { MENU_DEFS } from "@/lib/bodycheck/menus";
import { PrimaryMenuCta, SecondaryMenuCard } from "@/components/bodycheck/MenuCta";
import type { BodyCheckStoredResult } from "@/lib/bodycheck/types";
import type { ProfileAnswers } from "@/lib/types";

/**
 * ボディチェック5診断（肩こり・腰痛／猫背・姿勢／足・外反母趾／ダイエット／美容）共通の結果画面。
 * 表示順は仕様どおり ①診断結果 → ②あなたの特徴 → ③気になっているポイント → ④おすすめメニュー
 * → ⑤おすすめする理由 → ⑥予約ボタン、で固定しています。
 */
export function BodyCheckResultView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  const [result, setResult] = useState<BodyCheckStoredResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notFound">("loading");

  useEffect(() => {
    const config = type ? getBodyCheckConfig(type) : undefined;
    if (!id || !config) {
      setStatus("notFound");
      return;
    }

    const cached = getCachedBodyCheckResult(id);
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
        const { data } = await client!.from("body_check_results").select("*").eq("id", id).maybeSingle();
        if (!data) {
          setStatus("notFound");
          return;
        }
        // 保存済みの生回答から採点ロジックを再実行し、結果文言を完全に復元する
        const recomputed = scoreBodyCheck(config!, data.answers);
        const profile: ProfileAnswers = { ageBand: data.age_band, gender: data.gender };
        const restored: BodyCheckStoredResult = {
          ...recomputed,
          id: data.id,
          createdAt: data.created_at,
          ageBand: profile.ageBand,
          gender: profile.gender,
        };
        setResult(restored);
        setStatus("ready");
      } catch {
        setStatus("notFound");
      }
    }

    void fetchFromSupabase();
  }, [id, type]);

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
        <LinkButton href="/select" variant="primary">
          身体チェックを始める
        </LinkButton>
      </main>
    );
  }

  const menuItem = getDiagnosisMenuItem(result.diagnosisId);

  return (
    <main className="min-h-dvh px-4 py-10 print-area">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-2">
          {menuItem && (
            <p className="text-xs font-semibold tracking-wide text-navy-400">
              {menuItem.icon} {menuItem.title}
            </p>
          )}
          {result.typeLabel && (
            <span className="inline-block text-xs font-bold text-navy-600 bg-skyfog-100 rounded-full px-3 py-1">
              {result.typeLabel}
            </span>
          )}
          {/* ①診断結果 */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 leading-snug mt-1">{result.headline}</h1>
        </div>

        <Card className="flex flex-col items-center gap-2">
          <ScoreGauge score={result.score} />
        </Card>

        {/* ②あなたの特徴 */}
        <Card>
          <h2 className="font-bold text-navy-900 mb-2">あなたの特徴</h2>
          <p className="text-sm text-navy-600 leading-relaxed">{result.trait}</p>
        </Card>

        {/* ③現在気になっているポイント */}
        {result.concerns.length > 0 && (
          <Card>
            <h2 className="font-bold text-navy-900 mb-3">現在気になっているポイント</h2>
            <ul className="flex flex-col gap-2">
              {result.concerns.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-navy-700">
                  <span className="flex-none w-1.5 h-1.5 rounded-full bg-navy-400 mt-[7px]" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* ④おすすめメニュー・⑤おすすめする理由・⑥予約ボタン */}
        <Card className="flex flex-col gap-4 border-2 border-skyfog-200">
          <div>
            <p className="text-xs font-bold text-skyfog-500 mb-1">あなたへのおすすめメニュー</p>
            <p className="text-xl font-extrabold text-navy-900">{MENU_DEFS[result.primaryMenu].name}</p>
          </div>
          <p className="text-sm text-navy-600 leading-relaxed">{result.reason}</p>
          <div className="no-print">
            <PrimaryMenuCta resultId={result.id} diagnosisId={result.diagnosisId} menuKey={result.primaryMenu} />
          </div>
        </Card>

        {result.secondaryMenu && (
          <div className="no-print">
            <SecondaryMenuCard resultId={result.id} diagnosisId={result.diagnosisId} menuKey={result.secondaryMenu} />
          </div>
        )}

        <p className="text-xs text-navy-400 leading-relaxed text-center px-2">
          ※本チェックは医療機関の診断に代わるものではありません。強い症状がある場合は医療機関を受診してください。
        </p>

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
