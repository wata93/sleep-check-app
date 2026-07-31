/** 睡眠チェックアプリ全体で使う共有型定義 */

export type Category = "quality" | "autonomic" | "stress" | "brain" | "nocturia";

export const CATEGORY_LABELS: Record<Category, string> = {
  quality: "睡眠の質",
  autonomic: "自律神経バランス",
  stress: "ストレス度",
  brain: "脳疲労度",
  nocturia: "夜間頻尿リスク",
};

/** 5段階Likert設問の回答値。0=全くない〜4=ほぼ毎日（高いほど症状が強い） */
export type LikertValue = 0 | 1 | 2 | 3 | 4;

export const LIKERT_OPTIONS: { value: LikertValue; label: string }[] = [
  { value: 0, label: "全くない" },
  { value: 1, label: "あまりない" },
  { value: 2, label: "ときどき" },
  { value: 3, label: "よくある" },
  { value: 4, label: "ほぼ毎日" },
];

export interface LikertQuestion {
  id: string;
  type: "likert";
  category: Category;
  text: string;
  /** 総合スコア計算時、このカテゴリ内での相対的な重み（デフォルト1） */
  weight?: number;
}

export type AgeBand = "10s" | "20s" | "30s" | "40s" | "50s" | "60s" | "70plus";
export type Gender = "male" | "female" | "other";
export type Region =
  | "hokkaido_tohoku"
  | "kanto"
  | "chubu"
  | "kinki"
  | "chugoku"
  | "shikoku"
  | "kyushu_okinawa"
  | "unknown";
export type SleepHoursBand = "under4" | "4to5" | "5to6" | "6to7" | "7to8" | "8plus";

export interface ChoiceQuestion<T extends string> {
  id: string;
  type: "choice";
  text: string;
  choices: { value: T; label: string }[];
}

export type ProfileAnswers = {
  ageBand: AgeBand;
  gender: Gender;
  region: Region;
  sleepHours: SleepHoursBand;
};

export type LikertAnswers = Record<string, LikertValue>;

export interface QuizSubmission {
  localId: string;
  profile: ProfileAnswers;
  answers: LikertAnswers;
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
  byRegion: { label: string; count: number }[];
  bySleepType: { label: string; count: number }[];
  bySleepHours: { label: string; count: number }[];
  nocturiaRiskRate: number;
  averageSleepHoursLabel: string;
  bookingClickRate: number;
  lineClickRate: number;
  improvementRate: number;
  monthlyTrend: { month: string; count: number; averageScore: number }[];
  generatedAt: string;
  dataWindowNote: string;
}

