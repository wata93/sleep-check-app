-- ============================================================
-- 睡眠チェックアプリ用 Supabaseスキーマ
-- 使い方: Supabaseダッシュボード > SQL Editor に貼り付けて実行してください。
-- README.md の「Supabaseプロジェクト作成とschema.sql適用手順」も参照。
-- ============================================================

create extension if not exists "pgcrypto";

-- 診断結果テーブル
create table if not exists public.sleep_check_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  local_id text not null,               -- 端末側で発行する匿名ID（再診断の履歴突合に使用。個人情報ではない）
  age_band text not null,
  gender text not null,
  region text not null,
  sleep_hours_band text not null,
  total_score int not null,
  sleep_age int not null,
  sleep_type text not null,
  tier text not null,
  category_scores jsonb not null,       -- { quality, autonomic, stress, brain, nocturia }
  answers jsonb not null                -- 生の回答（再採点・分析用）
);

create index if not exists idx_results_created_at on public.sleep_check_results (created_at desc);
create index if not exists idx_results_local_id on public.sleep_check_results (local_id);

-- 予約導線クリック計測テーブル（予約率・LINE誘導率の近似指標に使用）
create table if not exists public.click_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  result_id uuid references public.sleep_check_results (id) on delete cascade,
  target text not null check (target in ('line', 'booking', 'tel'))
);

create index if not exists idx_clicks_result_id on public.click_events (result_id);

-- Row Level Security
alter table public.sleep_check_results enable row level security;
alter table public.click_events enable row level security;

-- 匿名ユーザーは新規回答の登録(insert)のみ許可
drop policy if exists "anon can insert results" on public.sleep_check_results;
create policy "anon can insert results" on public.sleep_check_results
  for insert to anon
  with check (true);

-- 匿名ユーザーはIDを指定した1件の結果閲覧のみ許可（結果共有リンク用。IDはUUIDで推測不可）
drop policy if exists "anon can select own result by id" on public.sleep_check_results;
create policy "anon can select own result by id" on public.sleep_check_results
  for select to anon
  using (true);

-- 匿名ユーザーはクリックイベントの登録のみ許可
drop policy if exists "anon can insert click events" on public.click_events;
create policy "anon can insert click events" on public.click_events
  for insert to anon
  with check (true);

-- 集計・CSV出力はService Role Key（サーバー専用）からのみ行うため、
-- anon向けの一覧取得ポリシーは意図的に設定していません。
