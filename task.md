# Task: Opentrons API MCP Server Implementation Plan

## 概要
Opentrons HTTP API v2 および Python Protocol API を操作・参照するための TypeScript/Node.js ベースの Model Context Protocol (MCP) サーバーの実装タスク一覧。

---

## Task 1: プロジェクト初期化と基本ディレクトリ構造の構築
- [x] 1.1 `package.json` の作成と依存関係のインストール
  - `@modelcontextprotocol/sdk`
  - `qmd` (Markdown search tool)
  - `axios` / `node-fetch` / `undici` (HTTP Client)
  - `zod` (ツール入力スキーマバリデーション)
  - TypeScript, tsx, `@types/node` 等の DevDependencies
- [x] 1.2 `tsconfig.json` の設定
- [x] 1.3 ディレクトリ構造の作成 (`src/`, `src/tools/`, `src/opentrons/`, `src/qmd/`, `docs/`)
- [x] 1.4 環境変数管理機能の実装 (`OPENTRONS_ROBOT_IP`, `OPENTRONS_ROBOT_PORT`, `OPENTRONS_API_TOKEN`)

---

## Task 2: Opentrons API v2 クライアントモジュールの実装 (`src/opentrons/client.ts`)
- [x] 2.1 HTTP Client インスタンスの構築 (ベースURL: `http://<OPENTRONS_ROBOT_IP>:31950`)
- [x] 2.2 プロトコル管理 API (`POST /protocols`, `GET /protocols/{id}`) の実装
- [x] 2.3 Run 管理 API (`POST /runs`, `GET /runs/{id}`, `POST /runs/{id}/actions`) の実装
- [x] 2.4 Command 管理・シミュレーション API の実装
  - `POST /runs` (simulation mode / validation)
  - `POST /runs/{id}/commands`
- [x] 2.5 ハードウェア・モジュール API (`GET /modules`, `GET /pipettes`, `GET /health`) の実装

---

## Task 3: ドキュメント検索エンジン (`qmd`) インテグレーション (`src/qmd/search.ts`)
- [x] 3.1 Opentrons Python Protocol API & HTTP API ドキュメント Markdown の配置 (`docs/`)
- [x] 3.2 ビルド時/準備時の `qmd` インデックス作成スクリプト (`npm run build:index`) の実装
- [x] 3.3 `qmd` 検索モジュールの実装 (クエリを受け取り、構造化 Markdown セクションを返却)

---

## Task 4: デッキ・物理環境厳格検証機能の実装 (`src/opentrons/validator.ts`)
- [x] 4.1 プロトコルが要求するモジュールと現在ロボットに接続されているモジュール (`GET /modules`) の照合ロジック
- [x] 4.2 要求モジュールが未認識・不足している場合の自動ブロック＆エラーレスポンス生成

---

## Task 5: エラーハンドリング＆構造化トレースバックモジュールの実装 (`src/opentrons/error.ts`)
- [x] 5.1 Opentrons API エラーレスポンスのパース処理
- [x] 5.2 `errorCode`、エラー行番号、ステップ名、対処ヒントを包含する構造化 JSON 出力ロジックの実装

---

## Task 6: MCP ツールセットの実装 (ハイブリッド 6 ツール)
- [x] 6.1 `opentrons_search_docs`
  - `qmd` 検索エンジンを呼び出し、該当する API 仕様・サンプルコードを返却
- [x] 6.2 `opentrons_validate_protocol`
  - シミュレーション API にてプロトコルコードを事前チェック、詳細な構文/動作エラーを返却
- [x] 6.3 `opentrons_upload_and_run`
  - 物理モジュール検証 (Task 4)
  - シミュレーション検証 (Task 6.2)
  - `/protocols` アップロード ➔ `/runs` インスタンス生成 ➔ `play` アクション発行の一連フローを実行
- [x] 6.4 `opentrons_get_robot_status`
  - ワンショットのステートフル状態取得 (`run_status`, `completed_steps/total_steps`, `current_command`, `connected_modules`)
- [x] 6.5 `opentrons_control_run`
  - Run に対する `pause`, `stop`, `resume` アクションの発行
- [x] 6.6 `opentrons_execute_command`
  - 個別のハードウェアダイレクトコマンド発行

---

## Task 7: エントリポイントと MCP サーバー構築 (`src/index.ts`)
- [x] 7.1 MCP Server インスタンスの初期化
- [x] 7.2 各ツールの登録 (Zod スキーマ・説明・ハンドラーの紐付け)
- [x] 7.3 STDIO トランスポート層のセットアップと起動処理

---

## Task 8: 動作検証とテスト
- [x] 8.1 モック環境/実機を用いた API v2 接続テスト
- [x] 8.2 `qmd` インデックス検索精度テスト
- [x] 8.3 不正プロトコル投入時の構造化エラー返却テスト
- [x] 8.4 モジュール不足時の厳格ブロック検証