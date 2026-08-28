"use client";

import { useSearchParams } from "next/navigation";
import { ResultView } from "@/components/result/ResultView";
import { BodyCheckResultView } from "@/components/bodycheck/BodyCheckResultView";
import { isBodyCheckDiagnosis } from "@/lib/bodycheck/registry";

/**
 * 結果画面の振り分け。`type` がボディチェック5診断のいずれかであればその結果画面を、
 * それ以外（未指定・"sleep"・不正な値）は既存の睡眠チェック結果画面を表示します
 * （旧リンク・QRコードとの後方互換のため、type未指定時は睡眠チェックにフォールバック）。
 */
export function ResultRouter() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  if (type && isBodyCheckDiagnosis(type)) {
    return <BodyCheckResultView />;
  }
  return <ResultView />;
}
