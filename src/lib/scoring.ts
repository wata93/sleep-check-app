import { LIKERT_QUESTIONS } from "./questions";
import type {
  AgeBand,
  Category,
  CategoryResult,
  LikertAnswers,
  ProfileAnswers,
  ResultTier,
  ScoringResult,
  SleepType,
} from "./types";
import { CATEGORY_LABELS } from "./types";

/**
 * 採点基準の変更方法:
 * - カテゴリの重要度は `CATEGORY_WEIGHTS` を編集してください（合計が1.0になるようにしてください）。
 * - 総合スコアの評価帯（ご案内文言の切り替え）は `TIER_THRESHOLDS` を編集してください。
 * - 各カテゴリの状態文言・アドバイスは `CATEGORY_TEXT` を編集してください。
 * - 睡眠年齢の補正幅は `SLEEP_AGE_ADJUSTMENT` を編集してください。
 */

export const CATEGORY_WEIGHTS: Record<Category, number> = {
  quality: 0.3,
  autonomic: 0.2,
  stress: 0.2,
  brain: 0.15,
  nocturia: 0.15,
};

const TIER_THRESHOLDS: { min: number; tier: ResultTier }[] = [
  { min: 90, tier: "excellent" },
  { min: 80, tier: "good" },
  { min: 50, tier: "needsCare" },
  { min: 0, tier: "critical" },
];

const AGE_BAND_MIDPOINT: Record<AgeBand, number> = {
  "10s": 15,
  "20s": 25,
  "30s": 35,
  "40s": 45,
  "50s": 55,
  "60s": 65,
  "70plus": 75,
};

/** 総合スコア0点で+20歳、100点で-5歳になるよう線形補正 */
const SLEEP_AGE_ADJUSTMENT = { atZero: 20, atHundred: -5 };

type CategoryTextSet = {
  good: { status: string; description: string; advice: string };
  mid: { status: string; description: string; advice: string };
  bad: { status: string; description: string; advice: string };
};

const CATEGORY_TEXT: Record<Category, CategoryTextSet> = {
  quality: {
    good: {
      status: "良好",
      description: "睡眠の質は十分保たれています。",
      advice: "今の生活リズムを維持しましょう。",
    },
    mid: {
      status: "やや低下",
      description: "寝つきや眠りの深さに乱れが出はじめています。",
      advice: "就寝前のスマホ使用を控え、就寝・起床時刻を一定にしましょう。",
    },
    bad: {
      status: "要改善",
      description: "入眠困難や中途覚醒など、睡眠の質に大きな課題があります。",
      advice: "睡眠整体で筋肉の緊張をほぐし、深い眠りに入りやすい身体づくりをおすすめします。",
    },
  },
  autonomic: {
    good: {
      status: "安定",
      description: "自律神経のバランスは良好です。",
      advice: "適度な運動を続けて今の状態を維持しましょう。",
    },
    mid: {
      status: "やや乱れ気味",
      description: "冷えやほてり、動悸など自律神経の乱れのサインが見られます。",
      advice: "首・背中周りの緊張をほぐすストレッチや入浴で、副交感神経を優位にしましょう。",
    },
    bad: {
      status: "乱れが強い",
      description: "自律神経の乱れが睡眠に影響している可能性が高い状態です。",
      advice: "睡眠整体による背骨・骨盤の調整で、自律神経のバランスを整えることをおすすめします。",
    },
  },
  stress: {
    good: {
      status: "落ち着いている",
      description: "心身ともに安定した状態です。",
      advice: "リラックスできる時間を大切にしましょう。",
    },
    mid: {
      status: "やや蓄積",
      description: "ストレスや気分の落ち込みが睡眠に影響し始めています。",
      advice: "就寝前に深呼吸や軽いストレッチを取り入れ、リラックスする時間を作りましょう。",
    },
    bad: {
      status: "蓄積が大きい",
      description: "ストレスの蓄積が心身の緊張や不眠につながっている可能性があります。",
      advice: "医療用睡眠アロマや施術によるリラックスケアをおすすめします。",
    },
  },
  brain: {
    good: {
      status: "クリア",
      description:
        "頭はすっきりしており、脳疲労は少ない状態です。良質な睡眠は、日中の思考力だけでなく、将来にわたる認知機能・脳の健康維持にもつながるとされています。",
      advice: "適度な休息を取り入れながら、今の生活を続けましょう。",
    },
    mid: {
      status: "やや疲労気味",
      description:
        "集中力や判断力の低下がみられ、脳が十分に休めていない可能性があります。睡眠中は脳の老廃物を排出する時間でもあり、質の良い睡眠は認知機能・脳の健康を保つうえでも大切だとされています。",
      advice: "就寝前のスマホ・PC使用を減らし、脳を休める時間を確保しましょう。",
    },
    bad: {
      status: "疲労が強い",
      description:
        "脳疲労が蓄積し、日中のパフォーマンス低下につながっている可能性があります。慢性的な睡眠の質の低下は、長期的には認知機能・脳の健康リスクにも関わる可能性があると言われています。",
      advice:
        "睡眠の質を底上げする睡眠整体で、脳をしっかり休める深い睡眠を取り戻しましょう。物忘れなど気になる症状がある場合は、医療機関へのご相談もあわせてご検討ください。",
    },
  },
  nocturia: {
    good: {
      status: "低リスク",
      description: "夜間にトイレで起きることは少なく、良好な状態です。",
      advice: "就寝前の水分・カフェイン摂取に気をつけて、今の状態を維持しましょう。",
    },
    mid: {
      status: "ややリスクあり",
      description: "夜間のトイレ覚醒がみられ、睡眠が分断されている可能性があります。",
      advice: "就寝2〜3時間前からの水分・カフェイン・アルコール摂取を控えましょう。",
    },
    bad: {
      status: "リスクが高い",
      description: "夜間頻尿による中途覚醒が、睡眠の質を大きく下げている可能性があります。",
      advice:
        "生活習慣の見直しに加え、骨盤周りや自律神経へのアプローチも有効な場合があります。改善しない場合は医療機関（泌尿器科等）へのご相談もご検討ください。",
    },
  },
};

const PROBLEM_PHRASES: Record<string, string> = {
  q_sleep_onset: "寝つきの悪さ（入眠困難）",
  q_night_waking: "夜中に何度も目が覚める（中途覚醒）",
  q_early_waking: "早朝に目が覚めてしまう（早朝覚醒）",
  q_no_deep_sleep: "眠りが浅く熟眠感が乏しい",
  q_daytime_sleepiness: "日中の強い眠気",
  q_cold_hot: "手足の冷え・ほてり",
  q_palpitation: "動悸・息苦しさ",
  q_dizziness: "立ちくらみ・めまい",
  q_low_mood: "気分の落ち込み",
  q_stress_feeling: "慢性的なストレス",
  q_low_motivation: "意欲の低下",
  q_concentration: "集中力の低下",
  q_judgement: "判断力の低下",
  q_eye_fatigue: "目の疲れ・頭の重さ",
  q_night_toilet: "夜間頻尿",
  q_night_fluid: "就寝前の水分摂取過多",
};

/**
 * 女性の場合、睡眠の質の低下と体重増加・肥満リスク、および美容面への影響が指摘されている点を踏まえた補足文言。
 * 「睡眠の質」カテゴリがmid/badの場合にのみ、性別が女性の回答者に対して説明文へ追記します。
 */
const FEMALE_QUALITY_RISK_NOTE =
  "また女性の場合、睡眠の質の低下はホルモンバランスの乱れを通じて、体重増加・肥満のリスクにも関わる可能性があると言われています。" +
  "さらに睡眠中は肌のターンオーバーや修復が行われるため、質の低下は肌荒れ・くすみなど美容面にも影響すると言われています。";

const SLEEP_TYPE_BY_CATEGORY: Record<Category, SleepType> = {
  quality: "shortage",
  autonomic: "autonomic",
  stress: "stress",
  brain: "brainFatigue",
  nocturia: "nocturia",
};

function categoryTier(score: number): "good" | "mid" | "bad" {
  if (score >= 80) return "good";
  if (score >= 50) return "mid";
  return "bad";
}

function computeCategoryScore(category: Category, answers: LikertAnswers): number {
  const questions = LIKERT_QUESTIONS.filter((q) => q.category === category);
  if (questions.length === 0) return 100;
  const sum = questions.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0);
  const avg = sum / questions.length;
  return Math.round((100 - (avg / 4) * 100) * 10) / 10;
}

function computeTotalScore(categoryScores: Record<Category, number>): number {
  let total = 0;
  (Object.keys(CATEGORY_WEIGHTS) as Category[]).forEach((cat) => {
    total += categoryScores[cat] * CATEGORY_WEIGHTS[cat];
  });
  return Math.round(total);
}

function tierFromScore(score: number): ResultTier {
  const found = TIER_THRESHOLDS.find((t) => score >= t.min);
  return found ? found.tier : "critical";
}

function computeSleepAge(ageBand: AgeBand, totalScore: number): { sleepAge: number; actualAgeEstimate: number } {
  const mid = AGE_BAND_MIDPOINT[ageBand];
  const { atZero, atHundred } = SLEEP_AGE_ADJUSTMENT;
  const adjustment = atZero + (totalScore / 100) * (atHundred - atZero);
  const sleepAge = Math.max(10, Math.round(mid + adjustment));
  return { sleepAge, actualAgeEstimate: mid };
}

function determineSleepType(categories: CategoryResult[], totalScore: number): SleepType {
  const allComfortable = categories.every((c) => c.score >= 70);
  if (totalScore >= 85 && allComfortable) return "healthy";
  const worst = categories.reduce((min, c) => (c.score < min.score ? c : min), categories[0]!);
  return SLEEP_TYPE_BY_CATEGORY[worst.category];
}

function getTopProblems(answers: LikertAnswers): string[] {
  const sorted = LIKERT_QUESTIONS.slice().sort((a, b) => (answers[b.id] ?? 0) - (answers[a.id] ?? 0));
  return sorted
    .slice(0, 3)
    .filter((q) => (answers[q.id] ?? 0) >= 1)
    .map((q) => PROBLEM_PHRASES[q.id] ?? q.text);
}

export function scoreQuiz(profile: ProfileAnswers, answers: LikertAnswers): ScoringResult {
  const categoryScores = {} as Record<Category, number>;
  (Object.keys(CATEGORY_WEIGHTS) as Category[]).forEach((cat) => {
    categoryScores[cat] = computeCategoryScore(cat, answers);
  });

  const categories: CategoryResult[] = (Object.keys(CATEGORY_WEIGHTS) as Category[]).map((cat) => {
    const score = categoryScores[cat];
    const tier = categoryTier(score);
    const text = CATEGORY_TEXT[cat][tier];
    const addFemaleQualityNote = cat === "quality" && profile.gender === "female" && tier !== "good";
    return {
      category: cat,
      score,
      status: text.status,
      description: addFemaleQualityNote ? `${text.description} ${FEMALE_QUALITY_RISK_NOTE}` : text.description,
      advice: text.advice,
    };
  });

  const totalScore = computeTotalScore(categoryScores);
  const { sleepAge, actualAgeEstimate } = computeSleepAge(profile.ageBand, totalScore);
  const sleepType = determineSleepType(categories, totalScore);
  const topProblems = getTopProblems(answers);
  const worstCategories = categories.slice().sort((a, b) => a.score - b.score).slice(0, 3);
  const improvementPoints = worstCategories.map((c) => `【${CATEGORY_LABELS[c.category]}】${c.advice}`);

  return {
    totalScore,
    sleepAge,
    actualAgeEstimate,
    sleepType,
    categories,
    topProblems,
    improvementPoints,
    tier: tierFromScore(totalScore),
  };
}
