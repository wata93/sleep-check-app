import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { CLINIC_NAME } from "@/lib/constants";
import { DIAGNOSIS_MENU_ITEMS } from "@/lib/bodycheck/registry";

export const metadata: Metadata = {
  title: "身体チェックを選ぶ",
  description: "気になる身体の悩みを選んで、簡単な質問に答えるだけのセルフチェックを始めましょう。",
};

export default function SelectPage() {
  return (
    <main className="min-h-dvh flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-700 text-white px-6 pt-10 pb-14">
        <div className="absolute inset-0 bg-star-field opacity-70 animate-drift" aria-hidden="true" />
        <div className="relative max-w-md mx-auto flex flex-col items-center text-center gap-3">
          <Logo size={40} />
          <p className="text-xs tracking-wide font-semibold text-skyfog-200 uppercase">{CLINIC_NAME}</p>
          <h1 className="text-xl sm:text-2xl font-extrabold leading-snug">今、1番気になるお悩みは？</h1>
          <p className="text-sm text-navy-100 leading-relaxed">
            気になる項目を1つ選んでください。
            <br />
            簡単な質問に答えるだけで結果が分かります。
          </p>
        </div>
      </section>

      <section className="flex-1 px-4 py-8 -mt-6">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          {DIAGNOSIS_MENU_ITEMS.map((item, i) => (
            <Link
              key={item.id}
              href={item.href}
              className="animate-fade-in flex items-center gap-4 rounded-3xl bg-white/90 backdrop-blur shadow-card border border-navy-50 px-5 py-4 hover:border-skyfog-400 hover:bg-skyfog-50 active:scale-[0.98] transition-all"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span
                className="flex-none h-12 w-12 rounded-2xl bg-navy-50 flex items-center justify-center text-2xl"
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className="flex-1 font-bold text-navy-900 leading-snug">{item.menuLabel}</span>
              <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none text-navy-300" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}

          <Link href="/history" className="mt-2 text-center text-sm font-medium text-navy-400 hover:text-navy-600">
            過去の結果履歴を見る
          </Link>
        </div>
      </section>
    </main>
  );
}
