"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { ChoiceOptions } from "@/components/quiz/ChoiceOptions";
import { YesNoOptions } from "@/components/quiz/YesNoOptions";
import { PROFILE_QUESTION_LIST, SYMPTOM_QUESTIONS } from "@/lib/questions";
import type { ProfileAnswers, SymptomAnswers } from "@/lib/types";
import {
  getOrCreateLocalId,
  saveBodyCheckResultToLocalHistory,
  saveResultToLocalHistory,
} from "@/lib/local-history";
import { getBodyCheckConfig, getDiagnosisMenuItem } from "@/lib/bodycheck/registry";
import type { DiagnosisId } from "@/lib/bodycheck/types";

type FlowItem =
  | { kind: "profile"; question: (typeof PROFILE_QUESTION_LIST)[number] }
  | { kind: "symptom"; question: { id: string; text: string } };

export function CheckFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const bodyConfig = typeParam ? getBodyCheckConfig(typeParam) : undefined;
  // 未指定・不正な値の場合は既存の睡眠チェックにフォールバック（旧リンク・QRコードとの後方互換のため）
  const diagnosisId: DiagnosisId = bodyConfig ? bodyConfig.id : "sleep";
  const menuItem = getDiagnosisMenuItem(diagnosisId);

  const symptomQuestions = useMemo<{ id: string; text: string }[]>(
    () =>
      bodyConfig
        ? bodyConfig.questions.map((q) => ({ id: q.id, text: q.text }))
        : SYMPTOM_QUESTIONS.map((q) => ({ id: q.id, text: q.text })),
    [bodyConfig]
  );

  const flow = useMemo<FlowItem[]>(() => {
    const profileItems: FlowItem[] = PROFILE_QUESTION_LIST.map((q) => ({ kind: "profile", question: q }));
    const symptomItems: FlowItem[] = symptomQuestions.map((q) => ({ kind: "symptom", question: q }));
    return [...profileItems, ...symptomItems];
  }, [symptomQuestions]);

  const [step, setStep] = useState(0);
  const [profileAnswers, setProfileAnswers] = useState<Partial<ProfileAnswers>>({});
  const [symptomAnswers, setSymptomAnswers] = useState<SymptomAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = flow[step];
  const total = flow.length;

  async function submitQuiz(finalProfile: ProfileAnswers, finalAnswers: SymptomAnswers) {
    setSubmitting(true);
    setError(null);
    try {
      const localId = getOrCreateLocalId();
      if (diagnosisId === "sleep") {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ localId, profile: finalProfile, answers: finalAnswers }),
        });
        if (!res.ok) throw new Error("送信に失敗しました");
        const data = await res.json();
        saveResultToLocalHistory(data.id, data.result, finalProfile);
        router.push(`/result?id=${data.id}&type=sleep`);
      } else {
        const res = await fetch("/api/body-check/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ localId, diagnosisId, profile: finalProfile, answers: finalAnswers }),
        });
        if (!res.ok) throw new Error("送信に失敗しました");
        const data = await res.json();
        saveBodyCheckResultToLocalHistory(data.id, data.result, finalProfile);
        router.push(`/result?id=${data.id}&type=${diagnosisId}`);
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
      setSubmitting(false);
    }
  }

  function goNext(updatedProfile: Partial<ProfileAnswers>, updatedSymptoms: SymptomAnswers) {
    if (step + 1 >= total) {
      void submitQuiz(updatedProfile as ProfileAnswers, updatedSymptoms);
      return;
    }
    setStep((s) => s + 1);
  }

  function handleProfileSelect(id: string, value: string) {
    const updated = { ...profileAnswers, [id]: value } as Partial<ProfileAnswers>;
    setProfileAnswers(updated);
    setTimeout(() => goNext(updated, symptomAnswers), 200);
  }

  function handleSymptomSelect(id: string, value: boolean) {
    const updated = { ...symptomAnswers, [id]: value };
    setSymptomAnswers(updated);
    setTimeout(() => goNext(profileAnswers, updated), 200);
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  if (submitting) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-navy-100 border-t-navy-700 animate-spin" />
          <p className="text-navy-600 font-semibold">診断結果を計算しています...</p>
        </div>
      </main>
    );
  }

  if (!current) return null;

  return (
    <main className="min-h-dvh flex flex-col justify-center px-4 py-10">
      {error && (
        <p className="max-w-md mx-auto mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
          {error}
        </p>
      )}
      {menuItem && (
        <p className="max-w-md mx-auto w-full mb-2 text-center text-xs font-semibold tracking-wide text-navy-400">
          {menuItem.icon} {menuItem.title}
        </p>
      )}
      <QuestionCard current={step + 1} total={total} questionText={current.question.text} onBack={handleBack}>
        {current.kind === "profile" ? (
          <ChoiceOptions
            choices={current.question.choices}
            value={profileAnswers[current.question.id as keyof ProfileAnswers]}
            onSelect={(value) => handleProfileSelect(current.question.id, value)}
          />
        ) : (
          <YesNoOptions
            value={symptomAnswers[current.question.id]}
            onSelect={(value) => handleSymptomSelect(current.question.id, value)}
          />
        )}
      </QuestionCard>
    </main>
  );
}
