import assert from "node:assert/strict"
import { buildMcpSettingsServers, mcpServerNameForTool } from "../src/mcp-extension.js"

assert.equal(mcpServerNameForTool("test1__ping"), "test1")
assert.equal(mcpServerNameForTool("test1__server__nested"), "test1", "splits on the first __ only")
assert.equal(mcpServerNameForTool("read_files"), undefined, "built-in tool names have no __")
assert.equal(mcpServerNameForTool("__leading"), undefined, "empty server-name prefix is not a valid MCP tool name")

const servers = buildMcpSettingsServers(
  [{ id: "docs", name: "docs", enabled: true, autoApprove: false, disabledTools: [], transport: "stdio", command: "node", args: ["server.js"], url: "" }],
  {},
)
assert.deepEqual(servers, {
  docs: { transport: { type: "stdio", command: "node", args: ["server.js"] }, disabled: false, metadata: { source: "cline-for-web" } },
})

// A disabled server is written with disabled:true, not omitted — ClineCore's
// settings-file loader filters those out itself.
const disabled = buildMcpSettingsServers(
  [{ id: "x", name: "x", enabled: false, autoApprove: false, disabledTools: [], transport: "sse", command: "", args: [], url: "http://127.0.0.1:1/sse" }],
  {},
)
assert.equal(disabled.x?.disabled, true)

// Previously-stored OAuth state for a still-configured server name survives a
// resync instead of being silently dropped.
const withOAuth = buildMcpSettingsServers(
  [{ id: "y", name: "y", enabled: true, autoApprove: false, disabledTools: [], transport: "streamableHttp", command: "", args: [], url: "http://127.0.0.1:1/mcp" }],
  { y: { transport: { type: "streamableHttp", url: "http://old" }, oauth: { tokens: { access_token: "secret" } }, oauthClient: { clientId: "abc" } } },
)
assert.deepEqual(withOAuth.y?.oauth, { tokens: { access_token: "secret" } })
assert.deepEqual(withOAuth.y?.oauthClient, { clientId: "abc" })
assert.deepEqual(withOAuth.y?.transport, { type: "streamableHttp", url: "http://127.0.0.1:1/mcp" }, "transport still gets refreshed from current settings")

// Removing a server from the list drops it from the built map entirely (not
// just disables it) — the settings file mirrors the current server list.
assert.deepEqual(buildMcpSettingsServers([], { stale: { transport: { type: "stdio", command: "x", args: [] } } }), {})

console.log("MCP extension tests passed")
