import type { AgeBand, ChoiceQuestion, Gender, SymptomQuestion } from "./types";

/**
 * 質問内容の変更方法:
 * - プロフィール質問は `PROFILE_QUESTIONS`、症状質問（はい/いいえ）は `SYMPTOM_QUESTIONS` を編集するだけで
 *   画面・採点の両方に自動反映されます。
 * - 各症状質問の `impact` は、「はい」と回答した場合にレーダーチャートの5項目からそれぞれ何点減点するかを表します。
 * - 各症状質問の `weight` は、総合スコア（100点満点）における配点です。5問の `weight` 合計が100になるようにしてください。
 */

export const PROFILE_QUESTIONS = {
  ageBand: {
    id: "ageBand",
    type: "choice",
    text: "あなたの年代を教えてください",
    choices: [
      { value: "10s", label: "10代" },
      { value: "20s", label: "20代" },
      { value: "30s", label: "30代" },
      { value: "40s", label: "40代" },
      { value: "50s", label: "50代" },
      { value: "60s", label: "60代" },
      { value: "70plus", label: "70代以上" },
    ],
  } as ChoiceQuestion<AgeBand>,
  gender: {
    id: "gender",
    type: "choice",
    text: "性別を教えてください",
    choices: [
      { value: "male", label: "男性" },
      { value: "female", label: "女性" },
      { value: "other", label: "回答しない" },
    ],
  } as ChoiceQuestion<Gender>,
};

export const PROFILE_QUESTION_LIST = [PROFILE_QUESTIONS.ageBand, PROFILE_QUESTIONS.gender];

/**
 * 5問の症状質問（はい/いいえ）。
 * 「睡眠整体が必要かどうか」を短時間で判定できるよう、AIS（アテネ不眠尺度）などを参考にしつつ、
 * 接骨院で扱う自律神経・身体の緊張の視点も含めて設計しています。
 */
export const SYMPTOM_QUESTIONS: SymptomQuestion[] = [
  {
    id: "q_no_deep_sleep",
    type: "yesno",
    text: "十分な時間眠っても、疲れが取れていないと感じる",
    weight: 20,
    impact: { quality: 35, brain: 10 },
  },
  {
    id: "q_night_waking",
    type: "yesno",
    text: "夜中に1回以上、目が覚めることがある",
    weight: 25,
    impact: { quality: 30, nocturia: 45, autonomic: 5 },
  },
  {
    id: "q_daytime_sleepiness",
    type: "yesno",
    text: "日中に強い眠気や、集中力の低下を感じることがある",
    weight: 25,
    impact: { brain: 45, quality: 10 },
  },
  {
    id: "q_body_tension",
    type: "yesno",
    text: "肩こり・首こり・体の緊張を感じることが多い",
    weight: 15,
    impact: { autonomic: 45, stress: 10 },
  },
  {
    id: "q_stress",
    type: "yesno",
    text: "ストレスを感じたり、気分が落ち着かないことが多い",
    weight: 15,
    impact: { stress: 45, autonomic: 15, brain: 10 },
  },
];

export const TOTAL_QUESTION_COUNT = PROFILE_QUESTION_LIST.length + SYMPTOM_QUESTIONS.length;
