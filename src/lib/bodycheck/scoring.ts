import type { BodyCheckConfig, BodyCheckResult, BodyCheckTier } from "./types";

const TIER_THRESHOLDS: { min: number; tier: BodyCheckTier }[] = [
  { min: 90, tier: "excellent" },
  { min: 80, tier: "good" },
  { min: 50, tier: "needsCare" },
  { min: 0, tier: "critical" },
];

function tierFromScore(score: number): BodyCheckTier {
  const found = TIER_THRESHOLDS.find((t) => score >= t.min);
  return found ? found.tier : "critical";
}

/**
 * ボディチェック5診断（肩こり・腰痛／猫背・姿勢／足・外反母趾／ダイエット／美容）共通の採点関数。
 * 睡眠チェックの採点（src/lib/scoring.ts）とは独立しています。
 */
export function scoreBodyCheck(config: BodyCheckConfig, answers: Record<string, boolean>): BodyCheckResult {
  let score = 0;
  const tagCounts: Record<string, number> = {};
  const concerns: string[] = [];

  for (const q of config.questions) {
    if (answers[q.id] === true) {
      for (const tag of q.tags) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
      concerns.push(q.concernPhrase);
    } else {
      score += q.weight;
    }
  }
  score = Math.max(0, Math.min(100, score));

  const tier = tierFromScore(score);
  const { typeKey, primaryMenu, secondaryMenu } = config.resolve({ tagCounts, tier, score });

  const typeCopy = typeKey ? config.typeCopy?.[typeKey] : undefined;
  const tierCopy = config.tierCopy[tier];

  return {
    diagnosisId: config.id,
    score,
    tier,
    typeKey,
    typeLabel: typeCopy?.label,
    headline: typeCopy?.headline ?? tierCopy.headline,
    trait: typeCopy?.trait ?? tierCopy.trait,
    reason: typeCopy?.reason ?? tierCopy.reason,
    concerns,
    primaryMenu,
    secondaryMenu,
  };
}
