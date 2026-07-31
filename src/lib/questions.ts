import type { AgeBand, ChoiceQuestion, Gender, LikertQuestion, Region, SleepHoursBand } from "./types";

/**
 * 質問内容の変更方法:
 * - プロフィール質問は `PROFILE_QUESTIONS`、5段階の症状質問は `LIKERT_QUESTIONS` を編集するだけで
 *   画面・採点の両方に自動反映されます（IDは scoring.ts では使わず category 集計のみに使うため、
 *   文言の変更だけであればIDを変えなくてOK。設問を追加/削除する場合は各カテゴリの人数バランスに注意してください）。
 * - 選択肢（5段階ラベル）を変更したい場合は `src/lib/types.ts` の `LIKERT_OPTIONS` を編集してください。
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
  region: {
    id: "region",
    type: "choice",
    text: "お住まいの地域を教えてください",
    choices: [
      { value: "hokkaido_tohoku", label: "北海道・東北" },
      { value: "kanto", label: "関東" },
      { value: "chubu", label: "中部" },
      { value: "kinki", label: "近畿" },
      { value: "chugoku", label: "中国" },
      { value: "shikoku", label: "四国" },
      { value: "kyushu_okinawa", label: "九州・沖縄" },
      { value: "unknown", label: "回答しない" },
    ],
  } as ChoiceQuestion<Region>,
  sleepHours: {
    id: "sleepHours",
    type: "choice",
    text: "平均的な睡眠時間はどのくらいですか？",
    choices: [
      { value: "under4", label: "4時間未満" },
      { value: "4to5", label: "4〜5時間" },
      { value: "5to6", label: "5〜6時間" },
      { value: "6to7", label: "6〜7時間" },
      { value: "7to8", label: "7〜8時間" },
      { value: "8plus", label: "8時間以上" },
    ],
  } as ChoiceQuestion<SleepHoursBand>,
};

export const PROFILE_QUESTION_LIST = [
  PROFILE_QUESTIONS.ageBand,
  PROFILE_QUESTIONS.gender,
  PROFILE_QUESTIONS.region,
  PROFILE_QUESTIONS.sleepHours,
];

/** 5段階Likert設問16問。AIS/PSQI/WHO-5の着想を一般向けに平易化 */
export const LIKERT_QUESTIONS: LikertQuestion[] = [
  // 睡眠の質（AISベース）
  { id: "q_sleep_onset", type: "likert", category: "quality", text: "布団に入ってから、なかなか寝つけないことがある" },
  { id: "q_night_waking", type: "likert", category: "quality", text: "夜中に何度も目が覚めてしまう" },
  { id: "q_early_waking", type: "likert", category: "quality", text: "起きたい時間より早く目が覚めて、そのまま眠れなくなる" },
  { id: "q_no_deep_sleep", type: "likert", category: "quality", text: "眠りが浅く、ぐっすり眠れた感じがしない" },
  { id: "q_daytime_sleepiness", type: "likert", category: "quality", text: "日中に強い眠気を感じる" },

  // 自律神経バランス
  { id: "q_cold_hot", type: "likert", category: "autonomic", text: "手足の冷えやほてりを感じることがある" },
  { id: "q_palpitation", type: "likert", category: "autonomic", text: "動悸がしたり、息苦しさを感じることがある" },
  { id: "q_dizziness", type: "likert", category: "autonomic", text: "立ちくらみやめまいを感じることがある" },

  // ストレス度（WHO-5着想）
  { id: "q_low_mood", type: "likert", category: "stress", text: "気分が落ち込んだり、憂うつに感じることがある" },
  { id: "q_stress_feeling", type: "likert", category: "stress", text: "仕事や家庭、人間関係でストレスを感じる" },
  { id: "q_low_motivation", type: "likert", category: "stress", text: "物事に対する意欲が湧かないと感じる" },

  // 脳疲労度
  { id: "q_concentration", type: "likert", category: "brain", text: "頭がぼんやりして、集中できないことがある" },
  { id: "q_judgement", type: "likert", category: "brain", text: "考えがまとまらず、判断に迷うことが増えた" },
  { id: "q_eye_fatigue", type: "likert", category: "brain", text: "目の疲れや頭の重さを感じることがある" },

  // 夜間頻尿リスク
  { id: "q_night_toilet", type: "likert", category: "nocturia", text: "夜中にトイレのために1回以上目が覚める" },
  { id: "q_night_fluid", type: "likert", category: "nocturia", text: "就寝前に喉が渇いて、水分を多く摂ってしまう" },
];

export const TOTAL_QUESTION_COUNT = PROFILE_QUESTION_LIST.length + LIKERT_QUESTIONS.length;
