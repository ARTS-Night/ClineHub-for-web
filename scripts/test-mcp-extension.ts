import assert from "node:assert/strict"
import { createMcpExtension } from "../src/mcp-extension.js"

const extension = createMcpExtension([{ id: "docs", name: "docs", enabled: true, transport: "stdio", command: "node", args: ["server.js"], url: "" }])
assert.ok(extension)
const servers: unknown[] = []
extension.setup?.({
  registerMcpServer: (server: unknown) => servers.push(server),
  registerTool: () => {}, registerCommand: () => {}, registerRule: () => {}, registerMessageBuilder: () => {}, registerProvider: () => {}, registerAutomationEventType: () => {},
}, {})
assert.deepEqual(servers, [{ name: "docs", transport: { type: "stdio", command: "node", args: ["server.js"] }, metadata: { source: "cline-for-web" } }])
assert.equal(createMcpExtension([]), undefined)
console.log("MCP extension tests passed")
