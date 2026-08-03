import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { APP_DESCRIPTION, APP_NAME, CLINIC_NAME } from "@/lib/constants";
import { TOTAL_QUESTION_COUNT } from "@/lib/questions";

export const metadata: Metadata = {
  title: `${APP_NAME}｜${CLINIC_NAME}`,
  description: APP_DESCRIPTION,
};

export default function TopPage() {
  return (
    <main className="min-h-dvh flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-700 text-white px-6 pt-12 pb-20 sm:pt-16 sm:pb-24">
        <div className="absolute inset-0 bg-star-field opacity-70 animate-drift" aria-hidden="true" />
        <div className="relative max-w-md mx-auto flex flex-col items-center text-center gap-6">
          <Logo size={56} />
          <p className="text-xs sm:text-sm tracking-wide font-semibold text-skyfog-200 uppercase">
            {CLINIC_NAME} 睡眠チェック
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-snug">
            30秒でわかる
            <br />
            睡眠チェック
          </h1>
          <p className="text-base sm:text-lg text-navy-100 leading-relaxed">
            あなたの睡眠は100点満点中何点？
            <br />
            睡眠の質を簡単にチェックしてみましょう。
          </p>
          <div className="w-full pt-2">
            <LinkButton href="/check" variant="primary" fullWidth className="!bg-white !text-navy-900 hover:!bg-skyfog-50">
              睡眠チェックを始める
            </LinkButton>
          </div>
          <p className="text-xs text-navy-200">
            全{TOTAL_QUESTION_COUNT}問・所要時間 約30秒・完全無料・登録不要
          </p>
        </div>
      </section>

      <section className="flex-1 px-6 py-10 -mt-10">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <Card className="animate-fade-in">
            <h2 className="text-sm font-bold text-navy-800 mb-2">医学的な指標を参考に設計</h2>
            <p className="text-sm text-navy-500 leading-relaxed">
              アテネ不眠尺度（AIS）、ピッツバーグ睡眠質問票（PSQI）、WHO-5精神的健康状態表など、
              睡眠医学の代表的な指標を参考に、どなたにも分かりやすい言葉で質問を設計しています。
            </p>
          </Card>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "睡眠の質", icon: "🌙" },
              { label: "自律神経", icon: "🍃" },
              { label: "ストレス度", icon: "💭" },
              { label: "脳疲労度", icon: "🧠" },
              { label: "夜間頻尿", icon: "💧" },
              { label: "総合スコア", icon: "📊" },
            ].map((item) => (
              <Card key={item.label} padded className="!p-3 flex flex-col items-center gap-1">
                <span className="text-2xl" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-xs font-semibold text-navy-600">{item.label}</span>
              </Card>
            ))}
          </div>
          <Card className="animate-fade-in">
            <h2 className="text-sm font-bold text-navy-800 mb-2">結果に応じたご提案</h2>
            <p className="text-sm text-navy-500 leading-relaxed">
              診断結果に応じて、当院の睡眠整体や医療用睡眠アロマなど、あなたに合ったケアをご提案します。
              そのままLINE・お電話・ホームページからご予約いただけます。
            </p>
          </Card>
        </div>
      </section>

      <footer className="no-print px-6 pb-8 text-center text-xs text-navy-400">
        <p>© {new Date().getFullYear()} {CLINIC_NAME}</p>
      </footer>
    </main>
  );
}
