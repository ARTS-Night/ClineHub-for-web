import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import type { McpServerSettings } from "./stores/agent-settings.js"

// NOTE: ClineCore's AgentPlugin.registerMcpServer() (the officially documented
// extension API) does NOT actually connect anything in SDK 0.0.75 — verified by
// spawning a real MCP server through it and confirming, via the request body a
// probe model backend received, that the tool never reached the model and the
// server process was never spawned. The only path that actually loads and
// connects MCP servers is ClineCore's own settings-file mechanism (the same one
// documented for `cline_mcp_settings.json` / `CLINE_MCP_SETTINGS_PATH`), gated
// by the real `disableMcpSettingsTools` session-config field. So instead of
// registering a plugin, runtime.ts keeps that settings file in sync with the
// user's configured servers — see buildMcpSettingsServers() below.

export type McpSettingsTransport =
  | { type: "stdio"; command: string; args: string[] }
  | { type: "sse"; url: string }
  | { type: "streamableHttp"; url: string }

/** Builds the `mcpServers` map cline_mcp_settings.json expects. `existing` is the
 * settings file's current content for these names — any `oauth`/`oauthClient`
 * state ClineCore previously wrote back (e.g. after an SSE/HTTP OAuth handshake)
 * is preserved instead of being silently wiped out on the next settings save. */
export function buildMcpSettingsServers(servers: McpServerSettings[], existing: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = {}
  for (const server of servers) {
    const transport: McpSettingsTransport = server.transport === "stdio"
      ? { type: "stdio", command: server.command, args: server.args }
      : server.transport === "sse"
        ? { type: "sse", url: server.url }
        : { type: "streamableHttp", url: server.url }
    const previous = isRecord(existing[server.name]) ? existing[server.name] as Record<string, unknown> : {}
    result[server.name] = {
      ...(previous.oauth !== undefined ? { oauth: previous.oauth } : {}),
      ...(previous.oauthClient !== undefined ? { oauthClient: previous.oauthClient } : {}),
      transport,
      disabled: !server.enabled,
      metadata: { source: "cline-for-web" },
    }
  }
  return result
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

/** ClineCore names every MCP-provided tool "<serverName>__<toolName>" (confirmed
 * by inspecting the actual request sent to the model). Used to route an
 * approval request for one back to that server's own autoApprove setting. */
export function mcpServerNameForTool(toolName: string): string | undefined {
  const separator = toolName.indexOf("__")
  return separator > 0 ? toolName.slice(0, separator) : undefined
}

export type McpTestInput = Pick<McpServerSettings, "transport" | "command" | "args" | "url">
export type McpTestTool = { name: string; description?: string }
export type McpTestResult =
  | { ok: true; toolCount: number; tools: McpTestTool[]; serverName?: string; serverVersion?: string }
  | { ok: false; error: string }

/** Actually opens a connection (spawns stdio, or hits SSE/HTTP) and lists tools, the
 * same way the SSH "test" button actually connects rather than just validating fields.
 * If `signal` aborts (the caller navigated away, cancelled, or deleted this server
 * mid-test), the spawned stdio process — or the open SSE/HTTP connection — is closed
 * immediately instead of being left running in the background. */
export async function testMcpConnection(input: McpTestInput, timeoutMs = 10_000, signal?: AbortSignal): Promise<McpTestResult> {
  let client: Client | undefined
  try {
    if (signal?.aborted) throw new Error("Cancelled")
    const transport = buildTestTransport(input)
    client = new Client({ name: "cline-for-web-mcp-test", version: "1.0.0" }, { capabilities: {} })
    await withTimeout(client.connect(transport), timeoutMs, "Connection timed out", signal)
    const tools = await withTimeout(client.listTools(), timeoutMs, "Listing tools timed out", signal)
    const info = client.getServerVersion()
    return {
      ok: true,
      toolCount: tools.tools.length,
      tools: tools.tools.map((tool) => ({ name: tool.name, description: tool.description })),
      serverName: info?.name,
      serverVersion: info?.version,
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  } finally {
    // Always tears down the process/connection, whether it finished, timed
    // out, or was cancelled — a test is never left running unattended.
    if (client) await client.close().catch(() => {})
  }
}

function buildTestTransport(input: McpTestInput) {
  if (input.transport === "stdio") {
    if (!input.command.trim()) throw new Error("Command is required")
    return new StdioClientTransport({ command: input.command, args: input.args, stderr: "ignore" })
  }
  if (!input.url.trim()) throw new Error("URL is required")
  const url = new URL(input.url)
  return input.transport === "sse" ? new SSEClientTransport(url) : new StreamableHTTPClientTransport(url)
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string, signal?: AbortSignal): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  let onAbort: (() => void) | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => { timer = setTimeout(() => reject(new Error(message)), ms) }),
      ...(signal ? [new Promise<T>((_, reject) => { onAbort = () => reject(new Error("Cancelled")); signal.addEventListener("abort", onAbort) })] : []),
    ])
  } finally {
    clearTimeout(timer)
    if (signal && onAbort) signal.removeEventListener("abort", onAbort)
  }
}
