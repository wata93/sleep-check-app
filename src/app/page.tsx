import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { APP_DESCRIPTION, APP_NAME, CLINIC_NAME } from "@/lib/constants";
import { DIAGNOSIS_MENU_ITEMS } from "@/lib/bodycheck/registry";

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
            {CLINIC_NAME} 身体の悩み診断
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-snug">
            あなたの身体、
            <br />
            どこから整える？
          </h1>
          <div className="w-full pt-2">
            <LinkButton href="/select" variant="primary" fullWidth className="!bg-white !text-navy-900 hover:!bg-skyfog-50">
              身体チェックを始める
            </LinkButton>
          </div>
          <p className="text-xs text-navy-200">全5問・所要時間 約30秒〜1分・完全無料・登録不要</p>
        </div>
      </section>

      <section className="flex-1 px-6 py-10 -mt-10">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <Card className="animate-fade-in">
            <h2 className="text-sm font-bold text-navy-800 mb-2">かんたんセルフチェック</h2>
            <p className="text-sm text-navy-500 leading-relaxed">
              気になる症状や生活習慣について簡単にチェックします。
              診断結果を参考に、あなたに合ったケアをご提案します。
            </p>
          </Card>
          <div className="grid grid-cols-3 gap-3 text-center">
            {DIAGNOSIS_MENU_ITEMS.map((item) => (
              <Card key={item.id} padded className="!p-3 flex flex-col items-center gap-1">
                <span className="text-2xl" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-xs font-semibold text-navy-600">{item.title}</span>
              </Card>
            ))}
          </div>
          <Card className="animate-fade-in">
            <h2 className="text-sm font-bold text-navy-800 mb-2">結果に応じたご提案</h2>
            <p className="text-sm text-navy-500 leading-relaxed">
              診断結果に応じて、睡眠整体・肩こり腰痛施術・猫背矯正など、当院の各種メニューの中から
              あなたに合ったケアをご提案します。そのままご予約・お電話からご相談いただけます。
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
