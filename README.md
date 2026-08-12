# Opentrons API MCP Server

Opentrons HTTP API v2 および Python Protocol API を操作・参照するための TypeScript / Node.js ベースの **Model Context Protocol (MCP)** サーバーです。  
Claude Desktop、Cursor などの MCP クライアントから、Opentrons ロボット（OT-2 / Opentrons Flex）の操作、プロトコルの検証・実行、ステータス確認、ドキュメント検索を行うことができます。

---

## 主な機能

- 📚 **`opentrons_search_docs`**: Opentrons Python Protocol API および HTTP API のドキュメント・サンプルコードを検索
- 🔍 **`opentrons_validate_protocol`**: Python プロトコルの構文チェックおよび物理ハードウェア（モジュール/ピペット）の要求照合
- 🚀 **`opentrons_upload_and_run`**: ハードウェア検証・プロトコルアップロード・Run 生成・実行開始を安全に一括実行
- 📊 **`opentrons_get_robot_status`**: ロボットの接続状態、モジュール/ピペット構成、Run の進捗ステータスを取得
- ⏸️ **`opentrons_control_run`**: Run に対する操作（`play`, `pause`, `stop`, `resume`）
- ⚡ **`opentrons_execute_command`**: 個別のハードウェアダイレクトコマンドを発行

---

## 前提条件

- **Node.js**: v20.0.0 以上 (動作確認済み: v22.22.0)
- **npm**: v10.0.0 以上
- **Opentrons ロボット**: OT-2 または Opentrons Flex（API ポート `31950` が開放されていること）

---

## インストール & セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. ドキュメント検索インデックスの構築
```bash
npm run build:index
```

### 3. プロジェクトのビルド
```bash
npm run build
```

---

## 環境変数の設定

プロジェクトルートに `.env` ファイルを作成するか、環境変数を設定して接続先ロボット情報を指定します。

```env
# Opentrons ロボットの IP アドレス (デフォルト: 127.0.0.1)
OPENTRONS_ROBOT_IP=192.168.1.100

# Opentrons HTTP API ポート (デフォルト: 31950)
OPENTRONS_ROBOT_PORT=31950

# API トークン (認証が必要な場合のみ)
OPENTRONS_API_TOKEN=
```

---

## MCP クライアントへの登録方法

### Claude Desktop の場合
`claude_desktop_config.json`（Windows の場合は `%APPDATA%\Claude\claude_desktop_config.json`）に以下のように追加します。

```json
{
  "mcpServers": {
    "opentrons": {
      "command": "node",
      "args": [
        "C:/path/to/otie-mcp/dist/index.js"
      ],
      "env": {
        "OPENTRONS_ROBOT_IP": "192.168.1.100",
        "OPENTRONS_ROBOT_PORT": "31950"
      }
    }
  }
}
```

### 開発モードでの実行 (tsx)
```json
{
  "mcpServers": {
    "opentrons": {
      "command": "npx",
      "args": [
        "tsx",
        "C:/path/to/otie-mcp/src/index.ts"
      ],
      "env": {
        "OPENTRONS_ROBOT_IP": "192.168.1.100",
        "OPENTRONS_ROBOT_PORT": "31950"
      }
    }
  }
}
```

---

## ツール一覧と利用方法

### 1. `opentrons_search_docs`
Opentrons API ドキュメントをキーワード検索します。
- **パラメータ**:
  - `query` (string, 必須): 検索キーワード（例: `"temperature module"`, `"transfer"`, `"load_labware"`）
  - `maxResults` (number, 任意): 最大取得件数（デフォルト: `5`）

### 2. `opentrons_validate_protocol`
Python プロトコルコードの構文チェックと、接続済みモジュール/ピペットとの適合性をチェックします。
- **パラメータ**:
  - `protocolContent` (string, 必須): Python プロトコルコード本文

### 3. `opentrons_upload_and_run`
物理ハードウェア検証を行ったうえでプロトコルをアップロードし、Run を生成して実行を開始します。必要なモジュールが不足している場合は安全にブロックされます。
- **パラメータ**:
  - `protocolContent` (string, 必須): Python プロトコルコード本文
  - `filename` (string, 任意): 保存ファイル名（デフォルト: `"protocol.py"`）

### 4. `opentrons_get_robot_status`
ロボットの健康状態、接続中モジュール・ピペット、および特定の Run ステータスを取得します。
- **パラメータ**:
  - `runId` (string, 任意): 確認したい Run の ID

### 5. `opentrons_control_run`
実行中または一時停止中の Run を制御します。
- **パラメータ**:
  - `runId` (string, 必須): 対象の Run ID
  - `action` (string, 必須): `'play'` | `'pause'` | `'stop'` | `'resume'`

### 6. `opentrons_execute_command`
指定した Run に対し、ダイレクトコマンド（ホーム復帰、ピペット移動など）を発行します。
- **パラメータ**:
  - `runId` (string, 必須): 対象の Run ID
  - `commandType` (string, 必須): コマンド種別（例: `"home"`, `"loadLabware"`）
  - `params` (object, 任意): コマンドパラメータ
  - `intent` (string, 任意): `'setup'` | `'protocol'`

---

## テストの実行

Jest によるユニットテストを実行します。

```bash
npm test
```

---

## ライセンス

ISC License
