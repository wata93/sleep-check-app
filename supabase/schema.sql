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

-- ============================================================
-- マイグレーション: 質問を5問(はい/いいえ)形式に変更したことに伴い、
-- 「地域」「平均睡眠時間」の質問を廃止しました。
-- 以前のバージョンで既に sleep_check_results テーブルを作成済みの場合は、
-- 以下を追加で実行して region / sleep_hours_band 列を削除してください。
-- （新規にテーブルを作成する場合は不要です）
-- ============================================================
alter table public.sleep_check_results drop column if exists region;
alter table public.sleep_check_results drop column if exists sleep_hours_band;

-- ============================================================
-- マイグレーション: 「身体の悩み診断アプリ」への拡張（睡眠以外の5診断を追加）
-- 既存の sleep_check_results テーブルは変更していません。以下はすべて追加のみです。
-- 既にSupabaseプロジェクトを作成済みの場合は、このセクションだけを追加で実行してください。
-- ============================================================

-- ボディチェック結果テーブル（肩こり・腰痛／猫背・姿勢／足・外反母趾／ダイエット／美容の5診断）
create table if not exists public.body_check_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  local_id text not null,
  diagnosis_id text not null,           -- 'shoulderBack' | 'posture' | 'feet' | 'diet' | 'beauty'
  age_band text,
  gender text,
  score int not null,                   -- 100点満点（睡眠チェックと同じ採点方式）
  result_type text not null,            -- 判定結果のタイプキー（tierまたはtypeKey）
  primary_menu text not null,           -- 一番おすすめのメニュー（menu_settings.key）
  secondary_menu text,                  -- 関連メニュー（あれば）
  answers jsonb not null
);

create index if not exists idx_body_results_created_at on public.body_check_results (created_at desc);
create index if not exists idx_body_results_diagnosis on public.body_check_results (diagnosis_id);
create index if not exists idx_body_results_local_id on public.body_check_results (local_id);

alter table public.body_check_results enable row level security;

drop policy if exists "anon can insert body results" on public.body_check_results;
create policy "anon can insert body results" on public.body_check_results
  for insert to anon
  with check (true);

drop policy if exists "anon can select own body result by id" on public.body_check_results;
create policy "anon can select own body result by id" on public.body_check_results
  for select to anon
  using (true);

-- click_events拡張: 「どの診断から、どのメニューの予約ボタンが押されたか」を記録できるようにする
alter table public.click_events drop constraint if exists click_events_result_id_fkey;
alter table public.click_events add column if not exists diagnosis_id text;
alter table public.click_events add column if not exists menu_key text;

-- メニュー設定テーブル（予約URL・ボタン文言を管理画面から編集できるようにする）
-- key は src/lib/bodycheck/menus.ts の MenuKey（例: 'sleepSeitai', 'shoulderBackCare' 等）
create table if not exists public.menu_settings (
  key text primary key,
  booking_url text,
  cta_label text,
  updated_at timestamptz not null default now()
);

alter table public.menu_settings enable row level security;

-- 予約URL・ボタン文言は診断結果画面に表示するため、閲覧のみ匿名ユーザーにも許可します
drop policy if exists "anon can select menu settings" on public.menu_settings;
create policy "anon can select menu settings" on public.menu_settings
  for select to anon
  using (true);

-- 書き込み（作成・更新）は管理画面API（Service Role Key）からのみ行うため、
-- anon向けのinsert/updateポリシーは意図的に設定していません。
