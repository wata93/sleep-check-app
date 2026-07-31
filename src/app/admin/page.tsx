"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ログインに失敗しました。");
        setLoading(false);
        return;
      }
      router.push("/admin/dashboard");
    } catch {
      setError("通信エラーが発生しました。");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-6 bg-navy-900">
      <Card className="w-full max-w-sm bg-white">
        <div className="flex flex-col items-center gap-3 mb-6">
          <Logo size={44} />
          <h1 className="text-lg font-extrabold text-navy-900">管理画面ログイン</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy-600 mb-1.5">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-navy-100 px-4 py-3 text-base focus:border-navy-500 outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? "確認中..." : "ログイン"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
