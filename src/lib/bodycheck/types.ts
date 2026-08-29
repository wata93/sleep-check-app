/**
 * 「身体の悩み診断」共通の型定義。
 *
 * 睡眠チェック（sleep）は既存の src/lib/questions.ts・scoring.ts・types.ts をそのまま使い続けます。
 * それ以外の5診断（肩こり・腰痛／猫背・姿勢／足・外反母趾／ダイエット／美容）はこのフォルダの
 * 設定駆動の仕組みで動きます。新しい診断を増やす場合は `configs.ts` に設定を1つ追加し、
 * `registry.ts` の一覧に登録するだけで、画面・採点・結果表示・管理画面の集計まで自動で対応します。
 */

/** 診断の種類。"sleep" は既存の睡眠チェック、それ以外が今回追加する5診断です。 */
export type DiagnosisId = "sleep" | "shoulderBack" | "posture" | "feet" | "diet" | "beauty";

/** おすすめメニューの種類。予約URL・ボタン文言は管理画面から編集できます（src/lib/bodycheck/menus.ts）。 */
export type MenuKey =
  | "sleepSeitai"
  | "shoulderBackCare"
  | "postureCorrection"
  | "halluxCare"
  | "gaitGuidance"
  | "dietMenu"
  | "beautyMenu";

export interface BodyCheckQuestion {
  id: string;
  text: string;
  /** 「いいえ」と回答した場合に総合スコアへ加算される点数（5問合計で100になるよう設計） */
  weight: number;
  /** 「はい」と回答した場合に加点される気になるポイントのタグ（結果画面の②③やメニュー判定に使用） */
  tags: string[];
  /** 「はい」の場合に「③現在気になっているポイント」へ表示する短い言い回し */
  concernPhrase: string;
}

export type BodyCheckTier = "excellent" | "good" | "needsCare" | "critical";

export interface BodyCheckTierCopy {
  /** ①診断結果の見出し */
  headline: string;
  /** ②あなたの特徴 */
  trait: string;
  /** ⑤おすすめする理由 */
  reason: string;
}

export interface BodyCheckTypeCopy {
  label: string;
  headline: string;
  trait: string;
  reason: string;
}

export interface BodyCheckConfig {
  id: DiagnosisId;
  /** メニュー選択画面のラベル 例:「体の痛み・コリ・違和感が気になる」 */
  menuLabel: string;
  /** メニュー選択画面の小さいアイコン */
  icon: string;
  /** チェック画面・結果画面の見出しに使うタイトル 例:「肩こり・腰痛チェック」 */
  title: string;
  questions: BodyCheckQuestion[];
  tierCopy: Record<BodyCheckTier, BodyCheckTierCopy>;
  /** タイプ分け（ダイエットの「生活習慣タイプ」等）を使う診断のみ設定。使わない場合は省略可能 */
  typeCopy?: Record<string, BodyCheckTypeCopy>;
  /** タグ別の「はい」回答数から、タイプ・おすすめメニューを決定する関数 */
  resolve: (input: {
    tagCounts: Record<string, number>;
    tier: BodyCheckTier;
    score: number;
  }) => {
    typeKey?: string;
    primaryMenu: MenuKey;
    secondaryMenu?: MenuKey;
  };
}

export interface BodyCheckResult {
  diagnosisId: DiagnosisId;
  score: number;
  tier: BodyCheckTier;
  typeKey?: string;
  headline: string;
  trait: string;
  reason: string;
  typeLabel?: string;
  concerns: string[];
  primaryMenu: MenuKey;
  secondaryMenu?: MenuKey;
}

export interface BodyCheckStoredResult extends BodyCheckResult {
  id: string;
  createdAt: string;
  ageBand: string;
  gender: string;
}
