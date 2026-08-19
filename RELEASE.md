# ClineHub-for-web (release)

> ⚠️ **本プロジェクトは開発中です。** 破壊的変更が入る可能性があります。
>
> ⚠️ **This project is under active development.** Breaking changes may land at any time.

このブランチはビルド済みの配布物です。ソースコードは含まれていません（ソースは`main`ブランチを参照してください）。`npm add -g`でこのブランチをインストールすると、以降は`clinehub-for-web`コマンドとして実行できます。

```bash
npm add -g github:ARTS-Night/ClineHub-for-web#release
clinehub-for-web
```

ブラウザで <http://localhost:3000> を開きます。詳しい使い方・設定項目は`main`ブランチの[README.md](https://github.com/ARTS-Night/ClineHub-for-web/blob/main/README.md)を参照してください。ここではこのアプリが内部でどう動いているかを説明します。

## 使い方（要点）

```bash
clinehub-for-web                        # 127.0.0.1:3000 で起動
clinehub-for-web -i 0.0.0.0 -p 8080      # 全インターフェース・別ポートで起動
clinehub-for-web --add-user alice pw     # ログインを必須化（.envに保存）
clinehub-for-web --remove-user           # ログイン必須化を解除
clinehub-for-web --help                  # 全オプション一覧
```

- `.env`と`.cline-data/`（セッション、接続設定、SSH秘密情報など）は**実行したディレクトリ**に作られます。作業用フォルダーを1つ作ってそこから起動してください。
- アップデートはインストール時と同じコマンドを再実行するだけです。アンインストールは`npm uninstall -g clinehub-for-web`（`.env`/`.cline-data/`は残ります）。

## 仕組み

### 全体像

ClineHub-for-webは、単一のNode.jsプロセスが担う小さな構成です。外部データベースやバックエンドサービスは使いません。

```text
ブラウザ (React SPA)
    │  HTTP (REST) / Server-Sent Events
    ▼
Hono サーバー (この npm パッケージそのもの)
    │  ライブラリ呼び出し（別プロセスではない）
    ▼
Cline SDK の ClineCore（ローカル実行ランタイム）
    │
    ├─ LM Studio / llama.cpp / Ollama ── OpenAI互換HTTP API
    ├─ ChatGPT Pro / Codex ── OAuth経由のCline SDKサブスクリプションAPI
    ├─ Claude Code Pro / Max ── ローカルのClaude Code CLIをサブプロセス起動
    └─ MCPサーバー（stdio / SSE / Streamable HTTP）
```

`clinehub-for-web`を実行すると起動するのは、このHonoサーバー1プロセスだけです。ブラウザ向けにはビルド済みの静的ファイル（`app.js`、`styles.css`、`index.html`）を配信し、同じプロセス内でCline SDKの`ClineCore`をローカル実行基盤として呼び出します。ClineCore自体は元々VS Code拡張機能向けに作られたセッション管理・Tool実行エンジンで、それをVS Codeなしで動かすための薄いWeb UIがこのアプリです。

### リクエストの流れ

1. ブラウザがメッセージを送信すると、サーバーは`ClineCore`のセッションへメッセージを渡します。
2. `ClineCore`は選択中のプロバイダー（LM Studio/Ollama/llama.cpp/Codex/Claude Code）へリクエストを送り、応答をトークン単位で受け取ります。
3. サーバーは`cline.subscribe()`で購読しているイベント（テキスト、reasoning、Tool呼び出し、Tool結果など）を、そのままServer-Sent Events（SSE）でブラウザへ中継します。
4. ブラウザは1本のSSE接続を張りっぱなしにして、届いたイベントをその場でDOMへ追記していきます（React state経由ではなく、専用の描画クラスが直接DOM操作するため、トークン単位の更新でも再レンダリングのコストがかかりません）。
5. モデルが承認の必要なTool（ファイル書き込み、コマンド実行など）を呼び出すと、`ClineCore`はそこで待機し、"承認待ち"イベントを送ります。ブラウザにApprove/Rejectボタンが表示され、押すとサーバーへPOSTし、`ClineCore`が実行を再開します。

サーバーとブラウザの間はこのREST + SSEの組だけで、WebSocketやポーリングは使っていません。

### プロバイダーの抽象化

LM Studio・llama.cpp・Ollamaは、いずれもOpenAI互換のHTTP APIを話すローカルサーバーとして扱われ、Cline SDK側で共通のインターフェースに正規化されます。ChatGPT Pro（Codex）はOAuthでログインし、Cline SDKが管理するサブスクリプション用のモデルAPIを使います（OpenAI Platformの従量課金APIとは別物です）。Claude Code Pro/Maxは、インストール済みのClaude Code CLIをサブプロセスとして呼び出す構成で、コミュニティ製のアダプター`ai-sdk-provider-claude-code`がCline SDKとClaude Agent SDKの間を橋渡しします。どのプロバイダーを選んでも、ブラウザ側のUI・セッション履歴・Tool承認・権限設定は共通です。

### データの保存先

セッション、接続設定、Agent設定、SSHプロファイル、自動圧縮の履歴は、すべて実行ディレクトリの`.cline-data/`にファイルとして保存されます（データベースは使いません）。SSHのパスワードや秘密鍵のパスフレーズなど、ハッシュでは扱えない秘密情報だけはAES-256-GCMで暗号化し、復号鍵を別ファイルへ分離しています。ChatGPT OAuthトークンはディスクに書かず、サーバーのメモリ内だけに保持するため、サーバーを再起動するとCodexだけ再ログインが必要です。

### ワークスペースとTool実行

Agent settingsで指定したworking directory配下でのみ、ファイル読み書きやコマンド実行が行われるよう`ClineCore`のTool Policyを制限しています。SSHワークスペースを選んだ場合は、ローカルのファイル/コマンドToolを無効化し、`ssh2`経由でリモートホストへ接続する専用のSSH版Tool（読取・検索・コマンド・書込）に切り替えます。こちらも指定したリモートディレクトリ配下に制限されます。

### MCP（Model Context Protocol）

`@modelcontextprotocol/sdk`を使い、stdio・SSE・Streamable HTTPの3方式でMCPサーバーに接続できます。接続に成功すると公開されているTool一覧を取得し、Agent settings側でTool単位に有効/無効を切り替えられます。MCPのTool呼び出しはClineCore本体のTool呼び出しと同じ承認フローに乗るため、モデルからは通常のToolと区別なく扱えます。
