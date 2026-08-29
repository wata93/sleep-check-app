import type { BodyCheckConfig } from "./types";

/**
 * 5つのボディチェック診断の設定。
 *
 * 質問はすべて5問・2択（はい/いいえ）・1画面1問です。
 * `weight` は「いいえ」と回答した場合に総合スコア（100点満点）へ加算される点数（5問合計=100）。
 * `tags` は「はい」と回答した場合に加点される気になるポイントのタグで、おすすめメニューの判定に使います。
 *
 * 新しい診断を追加する場合は、このファイルに設定オブジェクトを1つ追加し、
 * `registry.ts` の一覧に登録するだけで、チェック画面・結果画面・管理画面の集計まで自動的に対応します。
 */

export const SHOULDER_BACK_CONFIG: BodyCheckConfig = {
  id: "shoulderBack",
  menuLabel: "体の痛み・コリ・違和感が気になる",
  icon: "💪",
  title: "肩こり・腰痛チェック",
  questions: [
    {
      id: "sb_shoulder",
      text: "肩や首のこりを感じることが多いですか？",
      weight: 20,
      tags: ["shoulder"],
      concernPhrase: "肩・首のこり",
    },
    {
      id: "sb_back",
      text: "腰の重さや痛みを感じることがありますか？",
      weight: 20,
      tags: ["back"],
      concernPhrase: "腰の重さ・痛み",
    },
    {
      id: "sb_posture",
      text: "長時間同じ姿勢でいることが多いですか？",
      weight: 20,
      tags: ["posture"],
      concernPhrase: "長時間同じ姿勢でいることが多い",
    },
    {
      id: "sb_tension",
      text: "朝起きたときに身体が重い・こわばることがありますか？",
      weight: 20,
      tags: ["tension"],
      concernPhrase: "朝の身体の重さ・こわばり",
    },
    {
      id: "sb_daily",
      text: "肩こりや腰痛によって、日常生活で困ることがありますか？",
      weight: 20,
      tags: ["dailyImpact"],
      concernPhrase: "肩こり・腰痛による日常生活への影響",
    },
  ],
  tierCopy: {
    excellent: {
      headline: "肩・腰への負担は少ない状態です",
      trait: "身体の使い方やふだんのケアが上手にできています。",
      reason: "今のケアを続けつつ、定期的な身体のメンテナンスもおすすめです。",
    },
    good: {
      headline: "肩・腰への負担はまだ軽い範囲です",
      trait: "ただし姿勢や生活習慣によっては、負担が少しずつ蓄積しやすい状態です。",
      reason: "気になる部分が大きくなる前に、一度ケアしておくと安心です。",
    },
    needsCare: {
      headline: "あなたは肩・腰への負担が高い傾向があります",
      trait: "特に姿勢や、長時間同じ姿勢でいることによる身体への負担が考えられます。",
      reason: "肩こり・腰痛施術で、緊張した筋肉や姿勢のクセを見直してみることをおすすめします。",
    },
    critical: {
      headline: "肩・腰への負担がかなり大きくなっている可能性があります",
      trait: "こりや痛みが日常生活にも影響し始めているサインが見られます。",
      reason: "早めに肩こり・腰痛施術で身体をケアすることをおすすめします。一度ご相談ください。",
    },
  },
  resolve: () => ({ primaryMenu: "shoulderBackCare" }),
};

export const POSTURE_CONFIG: BodyCheckConfig = {
  id: "posture",
  menuLabel: "姿勢が気になる",
  icon: "🧍",
  title: "猫背・姿勢チェック",
  questions: [
    {
      id: "ps_screen",
      text: "スマートフォンやパソコンを長時間使用しますか？",
      weight: 20,
      tags: ["screenTime"],
      concernPhrase: "スマホ・パソコンの長時間使用",
    },
    {
      id: "ps_forward_head",
      text: "写真を見ると、頭が身体より前に出ていることがありますか？",
      weight: 20,
      tags: ["forwardHead"],
      concernPhrase: "頭が身体より前に出ている",
    },
    {
      id: "ps_shoulder",
      text: "肩が内側に入っていると感じますか？",
      weight: 20,
      tags: ["roundedShoulder"],
      concernPhrase: "肩が内側に入っている",
    },
    {
      id: "ps_back",
      text: "背中が丸くなっていると感じることがありますか？",
      weight: 20,
      tags: ["roundedBack"],
      concernPhrase: "背中の丸まり",
    },
    {
      id: "ps_sitting",
      text: "長時間座っていると、首・肩・背中がつらくなりますか？",
      weight: 20,
      tags: ["sittingStrain"],
      concernPhrase: "長時間座ると首・肩・背中がつらい",
    },
  ],
  tierCopy: {
    excellent: {
      headline: "姿勢のバランスは良好です",
      trait: "背骨まわりへの負担が少ない状態を保てています。",
      reason: "今の姿勢を意識しながら、適度に身体を動かす習慣を続けましょう。",
    },
    good: {
      headline: "姿勢はおおむね良好ですが、崩れやすいサインもあります",
      trait: "スマホ・パソコン作業などにより、少しずつ姿勢のクセが出てきている可能性があります。",
      reason: "早めに姿勢を整えておくと、今後の負担を防ぎやすくなります。",
    },
    needsCare: {
      headline: "あなたは姿勢を見直すことで、身体の負担を減らせる可能性があります",
      trait: "頭が前に出やすい、肩が内側に入りやすいなど、猫背の傾向が見られます。",
      reason: "猫背矯正で姿勢のクセを整えることをおすすめします。",
    },
    critical: {
      headline: "姿勢の崩れが身体に大きな負担をかけている可能性があります",
      trait: "背中の丸まりや、長時間同じ姿勢でいることによる負担が強く出ているサインです。",
      reason: "猫背矯正で早めに姿勢を整えることを一度ご相談ください。",
    },
  },
  resolve: () => ({ primaryMenu: "postureCorrection", secondaryMenu: "shoulderBackCare" }),
};

export const FEET_CONFIG: BodyCheckConfig = {
  id: "feet",
  menuLabel: "足・外反母趾が気になる",
  icon: "🦶",
  title: "足・歩き方チェック",
  questions: [
    {
      id: "ft_hallux1",
      text: "親指が外側に曲がっていると感じますか？",
      weight: 20,
      tags: ["hallux"],
      concernPhrase: "親指の外側への曲がり",
    },
    {
      id: "ft_gait1",
      text: "長時間歩くと足が疲れやすいですか？",
      weight: 20,
      tags: ["gait"],
      concernPhrase: "長時間歩くと足が疲れやすい",
    },
    {
      id: "ft_hallux2",
      text: "靴を履いていると足の一部が痛くなることがありますか？",
      weight: 20,
      tags: ["hallux"],
      concernPhrase: "靴で足の一部が痛くなる",
    },
    {
      id: "ft_gait2",
      text: "歩き方について人から指摘されたことがありますか？",
      weight: 20,
      tags: ["gait"],
      concernPhrase: "歩き方を指摘されたことがある",
    },
    {
      id: "ft_posture",
      text: "足や膝、腰などに負担を感じることがありますか？",
      weight: 20,
      tags: ["posture"],
      concernPhrase: "足・膝・腰への負担",
    },
  ],
  tierCopy: {
    excellent: {
      headline: "足まわりの状態は良好です",
      trait: "足や歩き方への負担は少ない状態です。",
      reason: "今の状態を維持できるよう、歩きやすい靴選びを続けましょう。",
    },
    good: {
      headline: "足まわりはおおむね良好ですが、気になるサインもあります",
      trait: "歩き方や靴によって、足への負担が少しずつ出てきている可能性があります。",
      reason: "早めにケアしておくと、負担が大きくなるのを防ぎやすくなります。",
    },
    needsCare: {
      headline: "足への負担が高まっている可能性があります",
      trait: "親指の曲がりや歩き方など、気になるポイントが見られます。",
      reason: "症状に合わせたケアで、足への負担を見直してみることをおすすめします。",
    },
    critical: {
      headline: "足・歩き方への負担がかなり大きくなっている可能性があります",
      trait: "足の痛みや歩き方の乱れが、膝や腰など他の部位にも影響しているサインです。",
      reason: "早めのケアをおすすめします。一度ご相談ください。",
    },
  },
  resolve: ({ tagCounts }) => {
    const hallux = tagCounts.hallux ?? 0;
    const gait = tagCounts.gait ?? 0;
    const primaryMenu = hallux > 0 && hallux >= gait ? "halluxCare" : "gaitGuidance";
    const secondaryMenu = (tagCounts.posture ?? 0) > 0 ? "postureCorrection" : undefined;
    return { primaryMenu, secondaryMenu };
  },
};

export const DIET_CONFIG: BodyCheckConfig = {
  id: "diet",
  menuLabel: "痩せたい・体型が気になる",
  icon: "⚖️",
  title: "ダイエットチェック",
  questions: [
    {
      id: "dt_lifestyle1",
      text: "食事の時間や内容が不規則になることがありますか？",
      weight: 20,
      tags: ["lifestyle"],
      concernPhrase: "食事時間・内容の乱れ",
    },
    {
      id: "dt_exercise",
      text: "運動不足を感じていますか？",
      weight: 20,
      tags: ["exercise"],
      concernPhrase: "運動不足",
    },
    {
      id: "dt_sleep",
      text: "睡眠不足を感じることがありますか？",
      weight: 20,
      tags: ["sleepStress"],
      concernPhrase: "睡眠不足",
    },
    {
      id: "dt_stress_eat",
      text: "ストレスや疲れから食べ過ぎてしまうことがありますか？",
      weight: 20,
      tags: ["sleepStress"],
      concernPhrase: "ストレス・疲れによる食べ過ぎ",
    },
    {
      id: "dt_lifestyle2",
      text: "これまでダイエットをしても長続きしなかったことがありますか？",
      weight: 20,
      tags: ["lifestyle"],
      concernPhrase: "ダイエットが長続きしなかった経験",
    },
  ],
  tierCopy: {
    excellent: {
      headline: "今の生活習慣は良好なバランスです",
      trait: "食事・運動・睡眠のバランスが取れている状態です。",
      reason: "今の生活リズムを維持しながら、気になる時はいつでもご相談ください。",
    },
    good: {
      headline: "体型面で気になるサインが少し出てきています",
      trait: "生活習慣のどこかに、乱れが出はじめている可能性があります。",
      reason: "早めに見直すことで、無理なく体型管理がしやすくなります。",
    },
    needsCare: {
      headline: "生活習慣が体型に影響している可能性があります",
      trait: "食事・運動・睡眠のいずれかに、負担がかかっている様子がうかがえます。",
      reason: "生活習慣に合わせたダイエットメニューを見直してみることをおすすめします。",
    },
    critical: {
      headline: "生活習慣の乱れが体型に大きく影響している可能性があります",
      trait: "食事・運動・睡眠のバランスが崩れているサインが複数見られます。",
      reason: "無理のない範囲で続けられるダイエットメニューを一度ご相談ください。",
    },
  },
  typeCopy: {
    lifestyle: {
      label: "生活習慣タイプ",
      headline: "生活習慣の乱れが体型に影響しているタイプです",
      trait: "食事のリズムや、続けやすさが体型に影響している可能性があります。",
      reason: "無理のない範囲で続けられるダイエットメニューをご提案します。",
    },
    sleepStress: {
      label: "睡眠・ストレスタイプ",
      headline: "睡眠不足やストレスが体型に影響しているタイプです",
      trait: "睡眠不足やストレスによる食べ過ぎが、体型に影響している可能性があります。",
      reason: "睡眠整体とあわせて生活リズムを整えることをおすすめします。",
    },
    exercise: {
      label: "運動不足タイプ",
      headline: "運動不足が体型に影響しているタイプです",
      trait: "身体を動かす機会が少なく、代謝が落ちやすい状態の可能性があります。",
      reason: "無理なく身体を動かせるダイエットメニューをご提案します。",
    },
  },
  resolve: ({ tagCounts }) => {
    const priority: { key: string; tag: string }[] = [
      { key: "lifestyle", tag: "lifestyle" },
      { key: "sleepStress", tag: "sleepStress" },
      { key: "exercise", tag: "exercise" },
    ];
    let best: { key: string; count: number } | null = null;
    for (const { key, tag } of priority) {
      const count = tagCounts[tag] ?? 0;
      if (count > 0 && (!best || count > best.count)) best = { key, count };
    }
    const secondaryMenu = (tagCounts.sleepStress ?? 0) > 0 ? "sleepSeitai" : undefined;
    return { typeKey: best?.key, primaryMenu: "dietMenu", secondaryMenu };
  },
};

export const BEAUTY_CONFIG: BodyCheckConfig = {
  id: "beauty",
  menuLabel: "肌・美容が気になる",
  icon: "✨",
  title: "美容・美肌チェック",
  questions: [
    {
      id: "bt_dry",
      text: "最近、肌の乾燥やくすみが気になりますか？",
      weight: 20,
      tags: ["skin"],
      concernPhrase: "肌の乾燥・くすみ",
    },
    {
      id: "bt_sleep",
      text: "睡眠不足を感じることがありますか？",
      weight: 20,
      tags: ["sleep"],
      concernPhrase: "睡眠不足",
    },
    {
      id: "bt_fatigue",
      text: "最近、疲れが顔に出ていると感じますか？",
      weight: 20,
      tags: ["fatigue"],
      concernPhrase: "顔に出る疲れ",
    },
    {
      id: "bt_care_effect",
      text: "肌のお手入れをしても以前より変化を感じにくいですか？",
      weight: 20,
      tags: ["skin"],
      concernPhrase: "お手入れの効果を感じにくい",
    },
    {
      id: "bt_holistic",
      text: "肌だけでなく身体の内側から美容を整えたいと思いますか？",
      weight: 20,
      tags: ["holistic"],
      concernPhrase: "内側からの美容ケアへの関心",
    },
  ],
  tierCopy: {
    excellent: {
      headline: "あなたの美容コンディションは良好です",
      trait: "肌・体調ともに落ち着いたバランスが保てています。",
      reason: "今のケアを続けながら、気になる変化があればいつでもご相談ください。",
    },
    good: {
      headline: "あなたの美容コンディションはおおむね良好です",
      trait: "肌や疲れに、少しずつ変化のサインが出てきている可能性があります。",
      reason: "早めのケアで、今の状態をキープしやすくなります。",
    },
    needsCare: {
      headline: "あなたの美容コンディションは見直し時かもしれません",
      trait: "肌の乾燥やくすみ、疲れなど気になるサインが見られます。",
      reason: "美肌施術で、肌と身体の内側からのケアを見直してみることをおすすめします。",
    },
    critical: {
      headline: "肌・身体ともにケアが必要なサインが出ている可能性があります",
      trait: "睡眠不足や疲れが、肌の状態にも影響しているサインが見られます。",
      reason: "美肌施術と生活リズムの見直しを一度ご相談ください。",
    },
  },
  resolve: ({ tagCounts }) => {
    const secondaryMenu = (tagCounts.sleep ?? 0) > 0 || (tagCounts.holistic ?? 0) > 0 ? "sleepSeitai" : undefined;
    return { primaryMenu: "beautyMenu", secondaryMenu };
  },
};

export const BODY_CHECK_CONFIGS: Record<Exclude<BodyCheckConfig["id"], "sleep">, BodyCheckConfig> = {
  shoulderBack: SHOULDER_BACK_CONFIG,
  posture: POSTURE_CONFIG,
  feet: FEET_CONFIG,
  diet: DIET_CONFIG,
  beauty: BEAUTY_CONFIG,
};
