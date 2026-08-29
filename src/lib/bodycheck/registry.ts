import { BODY_CHECK_CONFIGS } from "./configs";
import type { BodyCheckConfig, DiagnosisId } from "./types";

export interface DiagnosisMenuItem {
  id: DiagnosisId;
  /** メニュー選択画面のラベル 例:「体の痛み・コリ・違和感が気になる」 */
  menuLabel: string;
  /** チェック画面の見出し・履歴一覧などに使う短いタイトル */
  title: string;
  icon: string;
  href: string;
}

/**
 * メニュー選択画面（/select）に表示する診断の一覧。
 * 新しい診断を追加する場合は、`configs.ts` に設定を追加したうえで、ここに1行追加してください。
 */
export const DIAGNOSIS_MENU_ITEMS: DiagnosisMenuItem[] = [
  { id: "sleep", menuLabel: "睡眠が気になる", title: "睡眠チェック", icon: "🌙", href: "/check?type=sleep" },
  ...(Object.values(BODY_CHECK_CONFIGS) as BodyCheckConfig[]).map((c) => ({
    id: c.id,
    menuLabel: c.menuLabel,
    title: c.title,
    icon: c.icon,
    href: `/check?type=${c.id}`,
  })),
];

export function getDiagnosisMenuItem(id: DiagnosisId): DiagnosisMenuItem | undefined {
  return DIAGNOSIS_MENU_ITEMS.find((item) => item.id === id);
}

export function isBodyCheckDiagnosis(id: string): id is Exclude<DiagnosisId, "sleep"> {
  return id !== "sleep" && id in BODY_CHECK_CONFIGS;
}

export function getBodyCheckConfig(id: string): BodyCheckConfig | undefined {
  return isBodyCheckDiagnosis(id) ? BODY_CHECK_CONFIGS[id] : undefined;
}
