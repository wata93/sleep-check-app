import type { ResultTier } from "./types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const CLINIC_NAME = process.env.NEXT_PUBLIC_CLINIC_NAME ?? "おおはら村鍼灸整骨院";
export const CLINIC_TEL = process.env.NEXT_PUBLIC_CLINIC_TEL ?? "04-2937-5422";
export const CLINIC_ADDRESS = process.env.NEXT_PUBLIC_CLINIC_ADDRESS ?? "〇〇県〇〇市〇〇1-2-3";
export const CLINIC_HOURS = process.env.NEXT_PUBLIC_CLINIC_HOURS ?? "平日9:00-20:00 / 土日9:00-18:00";
export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL ?? "https://airrsv.net/ohharamura-yoyaku/calendar";
export const TEL_HREF = `tel:${CLINIC_TEL.replace(/-/g, "")}`;

export const APP_NAME = "30秒でわかる睡眠チェック";
export const APP_DESCRIPTION =
  "あなたの睡眠は100点満点中何点？アテネ不眠尺度(AIS)やWHO-5などの医学的指標を参考にした簡単な質問に答えるだけで、睡眠の質・自律神経・ストレス・脳疲労・夜間頻尿リスクを無料でチェックできます。";

export interface TierCopy {
  stars: number;
  title: string;
  comment: string;
  ctaLabel: string;
  showMedicalNotice?: boolean;
}

/**
 * 結果画面の文言・CTAはここで一括管理しています。
 * 点数帯を変えたい場合は scoring.ts の TIER_THRESHOLDS も合わせて確認してください。
 */
export const TIER_COPY: Record<ResultTier, TierCopy> = {
  excellent: {
    stars: 5,
    title: "良好な睡眠です",
    comment: "現在の睡眠状態は良好です。\n\n今後も良い睡眠を維持するため、定期的な身体のメンテナンスをおすすめします。",
    ctaLabel: "ご予約はこちらから",
  },
  good: {
    stars: 4,
    title: "あと少しで理想の睡眠です",
    comment: "睡眠の質は比較的良好ですが、さらに改善できる可能性があります。\n\n当院の医療用睡眠アロマや睡眠整体を取り入れることで、より質の高い睡眠が期待できます。",
    ctaLabel: "ご予約はこちらから",
  },
  needsCare: {
    stars: 3,
    title: "睡眠改善がおすすめです",
    comment: "睡眠の質が低下しています。\n\n自律神経や身体の緊張が睡眠へ影響している可能性があります。\n睡眠整体がおすすめです。",
    ctaLabel: "睡眠整体の体験予約はこちらから",
  },
  critical: {
    stars: 2,
    title: "睡眠改善をおすすめします",
    comment: "睡眠に大きな課題がある可能性があります。\n\n睡眠不足や疲労感でお困りの方は、早めの改善をおすすめします。\n睡眠整体をぜひ一度ご体験ください。\n\n※強い眠気や睡眠時無呼吸などが疑われる場合は、医療機関への受診もご検討ください。",
    ctaLabel: "今すぐこちらから睡眠整体の体験予約を！",
  },
};
