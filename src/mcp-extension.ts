import type { AgentPlugin } from "@cline/sdk"
import type { McpServerSettings } from "./agent-settings.js"

/** Builds one session-scoped plugin so saved MCP servers join Cline's tool list. */
export function createMcpExtension(servers: McpServerSettings[]): AgentPlugin | undefined {
  const enabled = servers.filter((server) => server.enabled)
  if (enabled.length === 0) return undefined
  return {
    name: "cline-for-web-configured-mcp",
    manifest: { capabilities: ["mcp"] },
    setup(api: Parameters<NonNullable<AgentPlugin["setup"]>>[0]) {
      for (const server of enabled) {
        const transport = server.transport === "stdio"
          ? { type: "stdio" as const, command: server.command, args: server.args }
          : server.transport === "sse"
            ? { type: "sse" as const, url: server.url }
            : { type: "streamableHttp" as const, url: server.url }
        api.registerMcpServer({ name: server.name, transport, metadata: { source: "cline-for-web" } })
      }
    },
  }
}
