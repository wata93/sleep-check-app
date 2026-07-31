"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/admin/StatCard";
import { PieBreakdown } from "@/components/admin/PieBreakdown";
import { MonthlyTrendChart } from "@/components/admin/MonthlyTrendChart";
import { RateBarChart } from "@/components/admin/RateBarChart";
import type { AdminStats } from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/admin");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "取得に失敗しました");
        setStats(data);
      })
      .catch((e) => setError(e.message));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  return (
    <main className="min-h-dvh bg-navy-50/40 px-4 py-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-navy-900">管理ダッシュボード</h1>
          <div className="flex gap-2">
            <a href="/api/admin/export">
              <Button variant="secondary" className="!px-4 !py-2.5 !text-sm">
                CSV出力
              </Button>
            </a>
            <Button variant="ghost" className="!px-4 !py-2.5 !text-sm" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        </header>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

        {!stats && !error && <p className="text-sm text-navy-400">読み込み中...</p>}

        {stats && (
          <>
            <p className="text-xs text-navy-400">{stats.dataWindowNote}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="回答人数" value={`${stats.totalResponses}`} sub="人" />
              <StatCard label="平均点" value={`${stats.averageScore}`} sub="点 / 100点満点" />
              <StatCard label="夜間頻尿割合" value={`${stats.nocturiaRiskRate}%`} sub="要注意レベル以上" />
              <StatCard label="平均睡眠時間帯" value={stats.averageSleepHoursLabel} sub="最頻値" />
            </div>

            <Card>
              <h2 className="font-bold text-navy-900 mb-2">予約率・LINE誘導率・改善率</h2>
              <p className="text-xs text-navy-400 mb-3">
                ※「予約率」「LINE誘導率」は各誘導ボタンのクリック率による近似指標です。実際の予約・友だち登録完了数とは異なります。
                「改善率」は同一端末で2回以上診断した方のうち、スコアが向上した割合です。
              </p>
              <RateBarChart
                items={[
                  { label: "予約導線クリック率", value: stats.bookingClickRate },
                  { label: "LINE誘導クリック率", value: stats.lineClickRate },
                  { label: "改善率", value: stats.improvementRate },
                ]}
              />
            </Card>

            <Card>
              <h2 className="font-bold text-navy-900 mb-2">月別回答数・平均点推移</h2>
              <MonthlyTrendChart data={stats.monthlyTrend} />
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <h2 className="font-bold text-navy-900 mb-2">年代別</h2>
                <PieBreakdown data={stats.byAgeBand} />
              </Card>
              <Card>
                <h2 className="font-bold text-navy-900 mb-2">男女比</h2>
                <PieBreakdown data={stats.byGender} />
              </Card>
              <Card>
                <h2 className="font-bold text-navy-900 mb-2">地域別</h2>
                <PieBreakdown data={stats.byRegion} />
              </Card>
              <Card>
                <h2 className="font-bold text-navy-900 mb-2">睡眠タイプ割合</h2>
                <PieBreakdown data={stats.bySleepType} />
              </Card>
              <Card>
                <h2 className="font-bold text-navy-900 mb-2">平均睡眠時間の分布</h2>
                <PieBreakdown data={stats.bySleepHours} />
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
