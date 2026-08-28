# 身体の悩み診断（旧: 30秒でわかる睡眠チェック）

接骨院の複数の自費メニュー（睡眠整体・肩こり腰痛施術・猫背矯正・外反母趾ケア・歩行指導・
ダイエットメニュー・美肌施術）へ、患者さん自身が5つの質問に答えるだけで自然に案内される
スマホファーストのセルフチェックWebアプリです。
Next.js (App Router) / TypeScript / Tailwind CSS / Supabase / Vercel で構築されています。

診断は「睡眠チェック」（既存機能）と、「肩こり・腰痛／猫背・姿勢／足・外反母趾／ダイエット／美容」の
5つのボディチェック（今回追加）の、合計6種類です。すべて5問・2択・1画面1問・約30秒〜1分で完了し、
結果画面から予約導線へ自然につながる設計です（本アプリは医療機関の診断に代わるものではありません）。

睡眠チェックの質問はアテネ不眠尺度（AIS）・ピッツバーグ睡眠質問票（PSQI）・WHO-5精神的健康状態表
などの医学的指標を参考に設計しています。

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
15. [身体の悩み診断（ボディチェック）の拡張方法](#15-身体の悩み診断ボディチェックの拡張方法)

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
   - `sleep_check_results`（睡眠チェック結果）・`body_check_results`（ボディチェック5診断の結果）・
     `click_events`（予約導線クリック計測）・`menu_settings`（メニューごとの予約URL上書き設定）の
     4テーブルが作成されます。
   - **既に以前のバージョンで `sleep_check_results` / `click_events` を作成済みの場合**は、
     schema.sqlの内容は全体を再実行しても安全です（`create table if not exists` / `drop policy if exists`
     方式のため、既存データは失われません）。追加された `body_check_results` テーブルと
     `menu_settings` テーブル、`click_events` の新しい列（`diagnosis_id` / `menu_key`）だけが新規作成されます。
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
- ダッシュボードでは、診断利用人数（全診断合計）・平均点・診断種類別利用人数・おすすめメニュー別人数・
  年代別・男女比・睡眠タイプ割合・夜間頻尿割合・予約導線クリック率・LINE誘導クリック率・改善率・
  月別推移に加えて、**「どの診断から、どのメニューの予約ボタンが何回押されたか」**（診断×メニュー別
  クリック数・クリック率）が確認できます。「CSV出力」ボタンから、睡眠チェック・ボディチェック
  すべての生データを1つのCSVでダウンロードできます。
- ダッシュボード下部の「メニュー予約URL管理」から、メニューごとの予約URL・予約ボタンの文言を
  その場で変更できます（[手順8](#8-予約url電話番号の変更方法)参照）。

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

電話番号・院名・サイト全体の初期予約URLは `.env.local`（本番はVercelの環境変数）で管理しています。
値を変更して保存（本番は再デプロイ）するだけで、アプリ全体に反映されます。コードの編集は不要です。

| 環境変数 | 内容 |
|---|---|
| `NEXT_PUBLIC_BOOKING_URL` | 予約ページの初期URL（各メニューの予約URLの初期値。現在はAirリザーブのカレンダーURLを設定） |
| `NEXT_PUBLIC_CLINIC_TEL` | 電話番号（結果画面の電話予約ボタンに反映） |
| `NEXT_PUBLIC_CLINIC_NAME` | 院名（タイトル・OGP等に反映） |
| `NEXT_PUBLIC_CLINIC_ADDRESS` | 住所（構造化データ・OGPに反映） |
| `NEXT_PUBLIC_CLINIC_HOURS` | 診療時間（構造化データに反映） |
| `NEXT_PUBLIC_SITE_URL` | 本番公開URL（OGP・サイトマップ・シェア機能に反映） |

**メニューごとに個別の予約URL・ボタン文言を設定する方法（再デプロイ不要）:**

上記の環境変数はサイト全体の初期値です。睡眠整体・肩こり腰痛施術・猫背矯正・外反母趾ケア・
歩行指導・ダイエットメニュー・美肌施術など、**メニューごとに個別の予約URL・ボタン文言**を
設定したい場合は、管理画面 `/admin/dashboard` 下部の「メニュー予約URL管理」から変更してください。
保存すると即座に結果画面へ反映されます（Supabaseの `menu_settings` テーブルに保存されるため、
この変更にはSupabaseの設定が必要です。未設定の場合は上記の環境変数がそのまま使われます）。

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

質問はすべて [`src/lib/questions.ts`](./src/lib/questions.ts) に集約されています。全部で7問（プロフィール2問＋症状5問、
回答時間30秒以内を想定）です。

- プロフィール質問（年代・性別）: `PROFILE_QUESTIONS` を編集
- 症状質問（はい/いいえの5問）: `SYMPTOM_QUESTIONS` 配列を編集
  - `text`: 質問文
  - `weight`: 「いいえ」と回答した場合に総合スコア（100点満点）へ加算される点数。5問の合計が100になるようにしてください
  - `impact`: 「はい」と回答した場合に、レーダーチャートの5項目（`quality` / `autonomic` / `stress` / `brain` / `nocturia`）
    からそれぞれ何点減点するか

文言を変更するだけであれば、画面表示・採点処理ともに自動的に反映されます。

---

## 12. 採点基準の変更方法

採点ロジックはすべて [`src/lib/scoring.ts`](./src/lib/scoring.ts) に集約されています。

| 変更したい内容 | 編集箇所 |
|---|---|
| 各設問の配点・レーダーチャートへの影響度 | `src/lib/questions.ts` の `SYMPTOM_QUESTIONS`（`weight` / `impact`） |
| 総合点の評価帯（90点/80点/50点の切り替え） | `TIER_THRESHOLDS`（`src/lib/constants.ts` の `TIER_COPY` の文言と対応） |
| 各カテゴリの状態文言・アドバイス文 | `CATEGORY_TEXT` |
| 問題点ベスト3の言い回し | `PROBLEM_PHRASES` |
| 睡眠年齢の補正幅 | `SLEEP_AGE_ADJUSTMENT` |
| 睡眠タイプの判定ロジック | `determineSleepType()` 関数 |

採点関数 `scoreQuiz()` は入力（プロフィール・回答）から出力（スコア・タイプ等）まで完全に決定的な純粋関数のため、
値を変えて `npm run dev` で再読み込みするだけで、結果画面にすぐ反映されます。

**総合スコアと5項目レーダーチャートは別々に計算されます。** 総合スコア（100点満点）は5問の `weight` の合計、
レーダーチャートの5項目は「はい」と回答した設問の `impact` の合計から、それぞれ算出（推定）しています。

---

## 13. ディレクトリ構成

```
src/
  app/                     ルーティング（Next.js App Router）
    page.tsx               トップ画面
    select/page.tsx        身体チェック メニュー選択画面
    check/page.tsx         問診フロー（?type=で睡眠 or ボディチェック5診断を切り替え）
    result/page.tsx         結果画面（typeで睡眠 or ボディチェックの結果表示を振り分け）
    history/page.tsx        結果履歴（localStorageベース、全診断共通）
    admin/page.tsx          管理画面ログイン
    admin/dashboard/page.tsx 管理ダッシュボード
    api/                    APIルート（submit / body-check/submit / track-click / menus / admin/*）
    sitemap.ts, robots.ts   SEO
  components/
    ui/                     共通UI（Button, Card, ScoreGauge 等）
    quiz/                   問診用コンポーネント（CheckFlow.tsx が全診断共通の問診エンジン）
    result/                 睡眠チェック結果画面用コンポーネント（レーダーチャート・共有等）
    bodycheck/               ボディチェック5診断の結果画面・CTAコンポーネント
    admin/                  管理画面用グラフ・メニュー設定コンポーネント
  lib/
    questions.ts            睡眠チェックの質問データ（変更方法11参照）
    scoring.ts               睡眠チェックの採点ロジック（変更方法12参照）
    constants.ts             院情報・結果文言・環境変数の集約
    types.ts                 睡眠チェックの型定義・管理画面集計データの型
    bodycheck/                ボディチェック5診断の仕組み一式（変更方法15参照）
      types.ts               共通の型定義
      configs.ts              5診断の質問・判定ロジック・文言
      scoring.ts               共通の採点関数
      menus.ts                 おすすめメニュー一覧・予約URL解決
      registry.ts              診断の一覧（メニュー選択画面・履歴等で使用）
      useMenuConfig.ts         予約URL・ボタン文言をクライアントで解決するhook
    supabase/                Supabaseクライアント（client.ts / server.ts）
    admin-auth.ts            管理画面セッション（JWT, Edge対応）
    admin-password.ts        管理画面パスワード照合（Node専用）
    analytics-queries.ts     管理画面の集計クエリ（睡眠チェック＋ボディチェック合算）
    local-history.ts         端末ローカルの結果キャッシュ・履歴（全診断共通）
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

---

## 15. 身体の悩み診断（ボディチェック）の拡張方法

肩こり・腰痛／猫背・姿勢／足・外反母趾／ダイエット／美容の5診断は、すべて
[`src/lib/bodycheck/configs.ts`](./src/lib/bodycheck/configs.ts) の設定オブジェクトから生成されています。
質問・判定ロジック・結果文言・おすすめメニューはすべてここに集約されており、共通の採点エンジン
（[`src/lib/bodycheck/scoring.ts`](./src/lib/bodycheck/scoring.ts)）と結果画面
（[`src/components/bodycheck/BodyCheckResultView.tsx`](./src/components/bodycheck/BodyCheckResultView.tsx)）が
すべての診断で共通して使われます。

**新しい診断を1つ追加する手順（画面・採点・管理画面の集計まで自動対応）:**

1. `src/lib/bodycheck/configs.ts` に、既存の5診断と同じ形の設定オブジェクトを1つ追加します。
   - `questions`: 5問（`weight` の合計が100になるように）
   - `tierCopy`: スコア帯ごとの①見出し・②特徴・⑤理由の文言
   - `resolve()`: 回答傾向（`tagCounts`）からおすすめメニュー（`primaryMenu` / `secondaryMenu`）を決める関数
2. その設定オブジェクトを、同ファイル末尾の `BODY_CHECK_CONFIGS` に追加します。
3. 新しいメニューを使う場合は、`src/lib/bodycheck/menus.ts` の `MENU_DEFS` に1件追加します
   （名称・初期の予約URL・予約ボタン文言）。
4. `src/lib/bodycheck/types.ts` の `DiagnosisId` / `MenuKey` に新しい値を追加します。
5. `src/lib/bodycheck/registry.ts` の `DIAGNOSIS_MENU_ITEMS` に、メニュー選択画面（`/select`）用の
   アイコン・ラベルを1行追加します。

これだけで、メニュー選択画面・問診フロー（`/check?type=新しいID`）・結果画面・履歴一覧・
管理画面の集計（診断種類別人数・メニュー別人数・クリック数）まですべて自動的に対応します。
ルーティングや採点エンジン、画面コンポーネント側の変更は不要です。

なお、既存の睡眠チェック（`src/lib/questions.ts` / `src/lib/scoring.ts`）は独立した仕組みのままで、
この拡張方法の対象外です（変更方法11・12を参照してください）。
