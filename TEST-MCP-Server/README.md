# TEST-MCP-Server

cline-for-webの「Agent settings > MCP」タブ、特に接続テストボタン（stdio / SSE / Streamable HTTP）を実地で確認するための、最小のMCPサーバーです。`uv`で作った venv 上に Python MCP SDK（`mcp[cli]`）を入れ、`ping`・`echo` の2ツールだけを公開します。

## セットアップ

```powershell
cd TEST-MCP-Server
uv venv
uv pip install "mcp[cli]" fastapi uvicorn
```

`.venv/` はこのフォルダーの `.gitignore` で除外済みです。

## 起動方法（3種類）

`server.py` は起動時の引数でtransportを切り替えます。

```powershell
# stdio: cline-for-web自身がこのプロセスを起動するので、事前に起動しておく必要はない
.venv\Scripts\python.exe server.py stdio

# SSE: http://127.0.0.1:8765/sse で待ち受け
.venv\Scripts\python.exe server.py sse --port 8765

# Streamable HTTP: http://127.0.0.1:8766/mcp で待ち受け
.venv\Scripts\python.exe server.py streamable-http --port 8766
```

SSE・Streamable HTTPは起動したままにしておき、別ターミナルで `pnpm dev` のcline-for-webを開いてテストします。stdioはcline-for-web側がプロセスを起動・終了するので、事前起動は不要です。

## cline-for-webへの登録内容

`Agent settings` → `MCP` タブ → `+ Add MCP server` で、以下の3パターンをそれぞれ登録し、カードの「接続テスト」ボタンを押します（**接続方式(Transport)** に応じて入力欄が変わります）。

### 1. stdio

| 項目                      | 値                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Transport                 | `stdio`                                                                                                                |
| Command                   | このフォルダーの`.venv\Scripts\python.exe` の絶対パス例: `E:\cline-for-web\TEST-MCP-Server\.venv\Scripts\python.exe` |
| Arguments（カンマ区切り） | `E:\cline-for-web\TEST-MCP-Server\server.py, stdio`                                                                    |

事前にサーバーを起動しておく必要はありません。テストボタンを押すたびにcline-for-webがこのコマンドでプロセスを起動し、確認後に終了します。

### 2. SSE

先に `python server.py sse --port 8765` を起動しておきます。

| 項目      | 値                            |
| --------- | ----------------------------- |
| Transport | `sse`                       |
| URL       | `http://127.0.0.1:8765/sse` |

### 3. Streamable HTTP

先に `python server.py streamable-http --port 8766` を起動しておきます。

| 項目      | 値                                                    |
| --------- | ----------------------------------------------------- |
| Transport | `streamableHttp`（UI上の表示は「Streamable HTTP」） |
| URL       | `http://127.0.0.1:8766/mcp`                         |

## 期待される結果

3パターンともテストボタンを押すと `接続成功・ツール2件`（`ping`・`echo` の2つ）が表示されます。SSE/Streamable HTTPでサーバーを起動し忘れている場合は、接続エラー（`ECONNREFUSED` など）がすぐに表示されます。
