/** 睡眠チェックアプリ全体で使う共有型定義 */

export type Category = "quality" | "autonomic" | "stress" | "brain" | "nocturia";

export const CATEGORY_LABELS: Record<Category, string> = {
  quality: "睡眠の質",
  autonomic: "自律神経バランス",
  stress: "ストレス度",
  brain: "脳疲労度",
  nocturia: "夜間頻尿リスク",
};

/** 症状質問への回答。true = はい（症状あり）, false = いいえ（症状なし） */
export type YesNo = boolean;

export const YES_NO_OPTIONS: { value: YesNo; label: string }[] = [
  { value: true, label: "はい" },
  { value: false, label: "いいえ" },
];

/** カテゴリ推定用の影響度（「はい」と回答した場合に各カテゴリから減点する点数） */
export type CategoryImpact = Partial<Record<Category, number>>;

export interface SymptomQuestion {
  id: string;
  type: "yesno";
  text: string;
  /** 総合スコア計算時にこの設問の「いいえ」に配点される点数（5問合計で100点になるよう設計） */
  weight: number;
  /** 「はい」と回答した場合の5項目（レーダーチャート）への影響度 */
  impact: CategoryImpact;
}

export type AgeBand = "10s" | "20s" | "30s" | "40s" | "50s" | "60s" | "70plus";
export type Gender = "male" | "female" | "other";

export interface ChoiceQuestion<T extends string> {
  id: string;
  type: "choice";
  text: string;
  choices: { value: T; label: string }[];
}

export type ProfileAnswers = {
  ageBand: AgeBand;
  gender: Gender;
};

export type SymptomAnswers = Record<string, YesNo>;

export interface QuizSubmission {
  localId: string;
  profile: ProfileAnswers;
  answers: SymptomAnswers;
}

export type SleepType =
  | "healthy"
  | "stress"
  | "autonomic"
  | "nocturia"
  | "shortage"
  | "brainFatigue";

export const SLEEP_TYPE_LABELS: Record<SleepType, string> = {
  healthy: "快眠タイプ",
  stress: "ストレスタイプ",
  autonomic: "自律神経タイプ",
  nocturia: "夜間頻尿タイプ",
  shortage: "睡眠不足タイプ",
  brainFatigue: "脳疲労タイプ",
};

export interface CategoryResult {
  category: Category;
  score: number;
  status: string;
  description: string;
  advice: string;
}

export interface ScoringResult {
  totalScore: number;
  sleepAge: number;
  actualAgeEstimate: number;
  sleepType: SleepType;
  categories: CategoryResult[];
  topProblems: string[];
  improvementPoints: string[];
  tier: ResultTier;
}

export type ResultTier = "excellent" | "good" | "needsCare" | "critical";

export interface StoredResult extends ScoringResult {
  id: string;
  createdAt: string;
  profile: ProfileAnswers;
}

export type ClickTarget = "line" | "booking" | "tel";

/** 管理画面ダッシュボード集計データ */
export interface AdminStats {
  totalResponses: number;
  averageScore: number;
  byAgeBand: { label: string; count: number }[];
  byGender: { label: string; count: number }[];
  bySleepType: { label: string; count: number }[];
  nocturiaRiskRate: number;
  bookingClickRate: number;
  lineClickRate: number;
  improvementRate: number;
  monthlyTrend: { month: string; count: number; averageScore: number }[];
  generatedAt: string;
  dataWindowNote: string;
}
