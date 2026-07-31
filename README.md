# 30秒でわかる睡眠チェック

接骨院の自費メニュー「睡眠整体」への送客を目的とした、スマホファーストの睡眠チェックWebアプリです。
Next.js (App Router) / TypeScript / Tailwind CSS / Supabase / Vercel で構築されています。

質問はアテネ不眠尺度（AIS）・ピッツバーグ睡眠質問票（PSQI）・WHO-5精神的健康状態表などの
医学的指標を参考に、一般の方にも分かりやすい言葉で設計しています（本アプリは医療機関の診断に
代わるものではありません）。

---

## 目次

1. [動作環境](#1-動作環境)
2. [インストール方法](#2-インストール方法)
3. [Supabaseプロジェクト作成とschema.sql適用手順](#3-supabaseプロジェクト作成とschemasql適用手順)
4. [ローカルでの起動確認](#4-ローカルでの起動確認)
5. [公開方法（Vercelへのデプロイ）](#5-公開方法vercelへのデプロイ)
6. [管理画面の使い方・パスワード変更方法](#6-管理画面の使い方パスワード変更方法)
7. [バックアップ方法](#7-バックアップ方法)
8. [予約URL・電話番号の変更方法](#8-予約url電話番号の変更方法)
9. [LINE連携方法（現状の仕組みと拡張方法）](#9-line連携方法現状の仕組みと拡張方法)
10. [デザイン変更方法](#10-デザイン変更方法)
11. [質問内容の変更方法](#11-質問内容の変更方法)
12. [採点基準の変更方法](#12-採点基準の変更方法)
13. [ディレクトリ構成](#13-ディレクトリ構成)
14. [既知の制約・注意事項](#14-既知の制約注意事項)

---

## 1. 動作環境

- Node.js 18.18以降（推奨: 20 LTS）
- npm 9以降
- Supabaseアカウント（無料プランで可）
- Vercelアカウント（公開する場合、無料プランで可）

Node.jsが未インストールの場合は https://nodejs.org/ja からLTS版をダウンロードしてインストールしてください。

---

## 2. インストール方法

1. このフォルダをそのまま使うか、任意の場所にコピーします。
2. ターミナル（PowerShellなど）でこのフォルダに移動し、依存パッケージをインストールします。

```bash
npm install
```

3. 環境変数ファイルを作成します。

```bash
cp .env.local.example .env.local
```

（PowerShellの場合は `Copy-Item .env.local.example .env.local`）

4. `.env.local` を開き、最低限以下を書き換えてください（詳細は各項目の見出しを参照）。
   - `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET`（管理画面ログイン、必須）
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`（[手順3](#3-supabaseプロジェクト作成とschemasql適用手順)参照）
   - `NEXT_PUBLIC_CLINIC_*` / `NEXT_PUBLIC_BOOKING_URL`（[手順8](#8-予約url電話番号の変更方法)参照）

> **Supabase未設定でも動作確認は可能です。** `.env.local`のSupabase関連項目が空のままでも、
> 診断・採点・結果表示・PWAなどUIの一連の動作はローカルで確認できます（結果はブラウザのlocalStorageにのみ保存されます）。
> ただし本番運用では、複数端末での結果閲覧・管理画面の集計機能のためにSupabaseの設定が必須です。

---

## 3. Supabaseプロジェクト作成とschema.sql適用手順

1. https://supabase.com にアクセスし、無料でアカウントを作成します。
2. 「New Project」からプロジェクトを作成します（リージョンは `Northeast Asia (Tokyo)` を推奨）。
3. プロジェクト作成後、左メニューの **SQL Editor** を開きます。
4. このリポジトリの [`supabase/schema.sql`](./supabase/schema.sql) の中身をすべてコピーし、SQL Editorに貼り付けて **Run** を実行します。
   - `sleep_check_results`（診断結果）と `click_events`（予約導線クリック計測）の2テーブルが作成されます。
5. 左メニューの **Project Settings > API** を開き、以下をコピーして `.env.local` に貼り付けます。
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` キー → `SUPABASE_SERVICE_ROLE_KEY`（**絶対に公開・GitHub等にコミットしないでください**）
6. Vercelにデプロイする場合は、同じ環境変数をVercelのプロジェクト設定にも登録してください（[手順5](#5-公開方法vercelへのデプロイ)参照）。

---

## 4. ローカルでの起動確認

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認してください。スマホでの見た目を確認したい場合は、
ブラウザの開発者ツールでデバイスモードに切り替えるか、同じWi-Fiにつないだスマホから
`http://<パソコンのIPアドレス>:3000` にアクセスしてください。

本番ビルドを確認する場合:

```bash
npm run build
npm run start
```

`npm run build` の実行前に、PWA用アイコンを生成する `npm run icons`（`prebuild`として自動実行）が走ります。

---

## 5. 公開方法（Vercelへのデプロイ）

### 5-1. GitHubにアップロード（推奨）

1. GitHubで新しいリポジトリを作成します。
2. このフォルダをGitリポジトリ化してプッシュします。

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<あなたのアカウント>/<リポジトリ名>.git
git push -u origin main
```

### 5-2. Vercelでインポート

1. https://vercel.com にログイン（GitHubアカウントで連携可能）。
2. 「Add New... > Project」→ 先ほどのGitHubリポジトリを選択。
3. 「Environment Variables」に `.env.local` の内容をすべて登録します（`NEXT_PUBLIC_SITE_URL` は本番URL、例:
   `https://sleep-check.your-clinic.com` に書き換えてください）。
4. 「Deploy」をクリックすると数分でURLが発行されます。
5. 独自ドメインを使う場合は、Vercelの「Domains」設定から追加してください。

### 5-3. QRコード・LINEからの利用

公開後のURL（例: `https://sleep-check.your-clinic.com`）をQRコード生成サービス
（例: https://www.qr-code-generator.com/ など）でQRコード化し、院内掲示・チラシに掲載してください。
LINE公式アカウントのメッセージにURLを貼り付けるだけで、LINEアプリ内ブラウザからそのまま開けます。

---

## 6. 管理画面の使い方・パスワード変更方法

- 管理画面URL: `https://<公開URL>/admin`
- `.env.local`（Vercelの場合は環境変数）の `ADMIN_PASSWORD` で設定したパスワードでログインします。
- ダッシュボードでは、回答人数・平均点・年代別・男女比・地域別・睡眠タイプ割合・夜間頻尿割合・
  平均睡眠時間・予約導線クリック率・LINE誘導クリック率・改善率・月別推移が確認できます。
  「CSV出力」ボタンから生データをダウンロードできます。

**パスワードを変更する方法:**

1. `.env.local`（本番はVercelの環境変数設定）の `ADMIN_PASSWORD` を新しい値に書き換えます。
2. `ADMIN_SESSION_SECRET` も合わせて別のランダムな文字列に変更すると、変更前に発行された
   ログインセッションが無効になり、より安全です。
3. Vercelの場合は環境変数を変更後、再デプロイ（Redeploy）してください。

---

## 7. バックアップ方法

診断データはすべてSupabase（PostgreSQL）に保存されています。バックアップは主に2通りです。

**A. 管理画面からCSVでバックアップ（手軽）**

管理画面 `/admin/dashboard` の「CSV出力」ボタンから、いつでも最新データをCSVでダウンロードできます。
定期的にダウンロードし、パソコンやクラウドストレージに保存してください。

**B. Supabase側の自動バックアップ（推奨・本格運用向け）**

Supabaseダッシュボード > **Database > Backups** から、有料プランでは自動の日次バックアップが利用できます。
無料プランの場合は、SQL Editorで以下を実行し、結果をエクスポートする方法でも代替できます。

```sql
select * from sleep_check_results order by created_at desc;
```

より本格的な運用では、Supabaseの `pg_dump` 機能（Database > Backups > Download）を使うと
データベース全体をSQLファイルとして保存できます。

---

## 8. 予約URL・電話番号の変更方法

すべて `.env.local`（本番はVercelの環境変数）で管理しています。値を変更して保存（本番は再デプロイ）するだけで、
アプリ全体に反映されます。コードの編集は不要です。

| 環境変数 | 内容 |
|---|---|
| `NEXT_PUBLIC_BOOKING_URL` | 予約ページのURL（結果画面のメインCTAボタンから遷移。現在はAirリザーブのカレンダーURLを設定） |
| `NEXT_PUBLIC_CLINIC_TEL` | 電話番号（結果画面の電話予約ボタンに反映） |
| `NEXT_PUBLIC_CLINIC_NAME` | 院名（タイトル・OGP等に反映） |
| `NEXT_PUBLIC_CLINIC_ADDRESS` | 住所（構造化データ・OGPに反映） |
| `NEXT_PUBLIC_CLINIC_HOURS` | 診療時間（構造化データに反映） |
| `NEXT_PUBLIC_SITE_URL` | 本番公開URL（OGP・サイトマップ・シェア機能に反映） |

---

## 9. LINE連携方法（現状の仕組みと拡張方法）

現状の実装は、LINE公式アカウントのAPI連携は行わず、**追加費用・審査不要のディープリンク方式**を採用しています。
なお結果画面の予約導線（メインCTA・電話ボタン）はLINEではなくAirリザーブ（`NEXT_PUBLIC_BOOKING_URL`）と
電話番号に一本化しています。LINEは以下の「結果共有」機能としてのみ利用します。

- 「LINE送信」ボタン（結果共有）: `https://line.me/R/msg/text/?...` 形式のリンクで、LINEアプリを開き
  診断結果のテキストを共有できる状態にします（送信するかはユーザー操作次第です）。

この方式ではAPIキーの取得やLINE公式アカウントの審査は不要です。将来的に「診断結果をLINEで自動送信する」
「LINE登録者数を正確に計測する」など高度な連携をしたい場合は、LINE Messaging APIの導入
（チャネル作成・Webhook実装）が必要になります。その際は `src/components/result/ShareTools.tsx` と
`src/components/result/CtaButtons.tsx` のLINE関連処理を、Messaging API呼び出しに置き換えてください。

---

## 10. デザイン変更方法

- **配色**: `tailwind.config.ts` の `theme.extend.colors.navy` / `skyfog` を編集してください。
  アプリ全体のネイビー・淡いブルーの配色はここから生成されています。
- **全体の背景・アニメーション**: `src/app/globals.css` を編集してください。
- **文言・院名・トップ画面のコピー**: `src/lib/constants.ts` と `src/app/page.tsx` を編集してください。
- **ロゴ（月のアイコン）**: `src/components/ui/Logo.tsx`（画面表示用）と
  `scripts/generate-icons.mjs`（PWA/OGP用アイコン画像。変更後は `npm run icons` を再実行）。
- **ボタンの見た目**: `src/components/ui/Button.tsx` の `variantClasses` を編集してください。

---

## 11. 質問内容の変更方法

質問はすべて [`src/lib/questions.ts`](./src/lib/questions.ts) に集約されています。

- プロフィール質問（年代・性別・地域・平均睡眠時間）: `PROFILE_QUESTIONS` を編集
- 5段階の症状質問（16問）: `LIKERT_QUESTIONS` 配列の `text` を編集、または項目を追加・削除
  - 各質問は `category`（`quality` / `autonomic` / `stress` / `brain` / `nocturia`）のいずれかに属します
  - 質問数を大きく変える場合は、カテゴリごとの設問バランスが崩れないよう注意してください
    （特定のカテゴリだけ質問が極端に少ない/多いと、そのカテゴリのスコアが不安定になります）
- 5段階の選択肢ラベル（全くない〜ほぼ毎日）: `src/lib/types.ts` の `LIKERT_OPTIONS`

文言を変更するだけであれば、画面表示・採点処理ともに自動的に反映されます。

---

## 12. 採点基準の変更方法

採点ロジックはすべて [`src/lib/scoring.ts`](./src/lib/scoring.ts) に集約されています。

| 変更したい内容 | 編集箇所 |
|---|---|
| カテゴリの重要度（総合点への影響度） | `CATEGORY_WEIGHTS`（合計が1.0になるよう調整） |
| 総合点の評価帯（90点/80点/50点の切り替え） | `TIER_THRESHOLDS`（`src/lib/constants.ts` の `TIER_COPY` の文言と対応） |
| 各カテゴリの状態文言・アドバイス文 | `CATEGORY_TEXT` |
| 問題点ベスト3の言い回し | `PROBLEM_PHRASES` |
| 睡眠年齢の補正幅 | `SLEEP_AGE_ADJUSTMENT` |
| 睡眠タイプの判定ロジック | `determineSleepType()` 関数 |

採点関数 `scoreQuiz()` は入力（プロフィール・回答）から出力（スコア・タイプ等）まで完全に決定的な純粋関数のため、
値を変えて `npm run dev` で再読み込みするだけで、結果画面にすぐ反映されます。

---

## 13. ディレクトリ構成

```
src/
  app/                     ルーティング（Next.js App Router）
    page.tsx               トップ画面
    check/page.tsx         問診フロー
    result/page.tsx         結果画面
    history/page.tsx        結果履歴（localStorageベース）
    admin/page.tsx          管理画面ログイン
    admin/dashboard/page.tsx 管理ダッシュボード
    api/                    APIルート（submit / track-click / admin/*）
    sitemap.ts, robots.ts   SEO
  components/
    ui/                     共通UI（Button, Card, ScoreGauge 等）
    quiz/                   問診用コンポーネント
    result/                 結果画面用コンポーネント（レーダーチャート・共有等）
    admin/                  管理画面用グラフコンポーネント
  lib/
    questions.ts            質問データ（変更方法11参照）
    scoring.ts               採点ロジック（変更方法12参照）
    constants.ts             院情報・結果文言・環境変数の集約
    types.ts                 型定義
    supabase/                Supabaseクライアント（client.ts / server.ts）
    admin-auth.ts            管理画面セッション（JWT, Edge対応）
    admin-password.ts        管理画面パスワード照合（Node専用）
    analytics-queries.ts     管理画面の集計クエリ
    local-history.ts         端末ローカルの結果キャッシュ・履歴
  middleware.ts              管理画面の認証ガード
supabase/schema.sql          Supabaseテーブル定義・RLSポリシー
scripts/generate-icons.mjs   PWAアイコン生成スクリプト
public/manifest.json         PWAマニフェスト
```

---

## 14. 既知の制約・注意事項

- **予約率・LINE誘導率について**: これらは「予約ボタン／LINEボタンをクリックした割合」の近似指標です。
  実際に予約が完了したか、LINEの友だち登録が完了したかまでは本アプリだけでは把握できません。
  正確な予約完了率・LINE登録者数が必要な場合は、予約システム・LINE公式アカウントのAPI連携が別途必要です。
- **改善率について**: 同一端末（ブラウザ）で2回以上診断した場合にのみ算出される近似指標です。
  ブラウザのデータを消去したり、別の端末で診断した場合は別ユーザーとしてカウントされます。
- **医療的な注意**: 本アプリは医療機関の診察・診断に代わるものではありません。結果画面にも
  「強い症状がある場合は医療機関を受診してください」という注記を表示しています。
- **管理画面の集計処理**: クリニック規模のデータ量（最大5,000件）を想定し、生データを取得して
  JavaScript側で集計する設計です。将来的にデータ量が大きく増える場合は、SupabaseのSQL関数(RPC)による
  集計処理への切り替えを検討してください（`src/lib/analytics-queries.ts` にコメントで補足しています）。
- **開発環境にNode.jsが必要です**: 動作確認・ビルドには Node.js のインストールが必須です。
