import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import { readdir, realpath } from "node:fs/promises"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { ClineRuntime, SessionNotFoundError, validateUserImages, type RuntimeEvent } from "./runtime.js"
import type { ConnectionRequest } from "./providers.js"

process.env.CLINE_DATA_DIR ??= resolve(process.cwd(), ".cline-data")

const app = new Hono()
const initialWorkspace = await realpath(resolve(process.env.CLINE_WORKSPACE_ROOT ?? process.cwd()))
const allowedRoot = await realpath(resolve(process.env.CLINE_ALLOWED_ROOT ?? initialWorkspace))
const runtime = await ClineRuntime.create(initialWorkspace, allowedRoot)
const clients = new Set<(event: RuntimeEvent) => void>()
runtime.subscribe((event) => { for (const send of clients) send(event) })
app.onError((error, c) => {
  if (error instanceof SessionNotFoundError) return c.json({ error: error.message }, 404)
  console.error("HTTP API error", error)
  return c.json({ error: error instanceof Error ? error.message : String(error) }, 500)
})
// Language files live in ./setting/language/*.json (outside the client bundle)
// so users can edit or add one — e.g. zh.json — without a rebuild.
app.get("/api/languages", async (c) => {
  const files = await readdir(resolve(process.cwd(), "setting", "language")).catch(() => [] as string[])
  return c.json({ locales: files.filter((file) => file.endsWith(".json")).map((file) => file.slice(0, -5)) })
})
app.use("/setting/language/*", serveStatic({ root: "./" }))
app.get("/api/sessions", async (c) => c.json(await runtime.list()))
app.delete("/api/sessions", async (c) => c.json(await runtime.deleteAll()))
app.get("/api/agent-settings", (c) => c.json(runtime.agentSettingsInfo()))
app.patch("/api/agent-settings", async (c) => c.json(await runtime.updateAgentSettings(await c.req.json())))
app.post("/api/agent-settings/preview", async (c) => {
  const body = await c.req.json<{ template?: unknown }>()
  return c.json(await runtime.previewSystemPrompt(body.template))
})
app.post("/api/agent-settings/templates", async (c) => c.json(await runtime.createPromptTemplate(await c.req.json())))
app.patch("/api/agent-settings/templates/:id", async (c) => c.json(await runtime.updatePromptTemplate(c.req.param("id"), await c.req.json())))
app.delete("/api/agent-settings/templates/:id", async (c) => { await runtime.deletePromptTemplate(c.req.param("id")); return c.json({ ok: true }) })
app.post("/api/agent-settings/templates/:id/reset", async (c) => c.json(await runtime.resetPromptTemplate(c.req.param("id"))))
app.get("/api/config", (c) => c.json(runtime.connectionInfo()))
app.get("/api/profiles", (c) => c.json(runtime.profilesInfo()))
app.post("/api/profiles/models/:id/activate", async (c) => c.json(await runtime.activateModelProfile(c.req.param("id"))))
app.patch("/api/profiles/models/:id", async (c) => c.json(await runtime.updateModelProfile(c.req.param("id"), await c.req.json())))
app.delete("/api/profiles/models/:id", async (c) => { await runtime.deleteModelProfile(c.req.param("id")); return c.json({ ok: true, profiles: runtime.profilesInfo() }) })
app.post("/api/profiles/workspaces", async (c) => c.json(await runtime.saveWorkspaceProfile(await c.req.json<Record<string, unknown>>())))
app.post("/api/profiles/workspaces/:id/activate", async (c) => c.json(await runtime.activateWorkspaceProfile(c.req.param("id"))))
app.post("/api/profiles/workspaces/:id/test", async (c) => c.json(await runtime.testWorkspaceProfile(c.req.param("id"))))
app.delete("/api/profiles/workspaces/:id", async (c) => { await runtime.deleteWorkspaceProfile(c.req.param("id")); return c.json({ ok: true, profiles: runtime.profilesInfo() }) })
app.get("/api/context", (c) => c.json(runtime.contextInfo()))
app.get("/api/codex/status", (c) => c.json(runtime.codexAuthInfo()))
app.post("/api/codex/login", async (c) => c.json(await runtime.beginCodexLogin()))
app.get("/api/claude-code/status", async (c) => c.json(await runtime.claudeCodeAuthInfo()))
app.post("/api/models/discover", async (c) => c.json(await runtime.discover(await c.req.json())))
app.post("/api/config", async (c) => {
  const body = await c.req.json<ConnectionRequest>()
  if (body.provider === "codex" && runtime.codexAuthInfo().status !== "authenticated") {
    return c.json({ error: "Sign in with ChatGPT before connecting" }, 409)
  }
  if (body.provider === "claude-code") {
    const auth = await runtime.claudeCodeAuthInfo()
    if (auth.status !== "authenticated") return c.json({ error: auth.message }, 409)
  }
  return c.json(await runtime.configure(body))
})
app.get("/api/sessions/:id", async (c) => c.json(await runtime.session(c.req.param("id"))))
app.get("/api/sessions/:id/messages", async (c) => c.json(await runtime.messages(c.req.param("id"))))
app.get("/api/sessions/:id/queue", async (c) => c.json(await runtime.pendingPrompts(c.req.param("id"))))
app.patch("/api/sessions/:id/queue/:promptId", async (c) => {
  const body = await c.req.json<{ prompt?: unknown }>()
  const prompt = runtime.updatePendingPrompt(c.req.param("id"), c.req.param("promptId"), body.prompt)
  return prompt ? c.json(prompt) : c.json({ error: "Queued message not found or already started" }, 404)
})
app.delete("/api/sessions/:id/queue/:promptId", (c) => runtime.deletePendingPrompt(c.req.param("id"), c.req.param("promptId"))
  ? c.json({ ok: true })
  : c.json({ error: "Queued message not found or already started" }, 404))
app.patch("/api/sessions/:id", async (c) => { const body = await c.req.json<{ title?: unknown }>(); await runtime.rename(c.req.param("id"), body.title); return c.json({ ok: true }) })
app.delete("/api/sessions/:id", async (c) => { await runtime.delete(c.req.param("id")); return c.json({ ok: true }) })
app.post("/api/sessions", async (c) => {
  if (!runtime.connectionInfo().configured) return c.json({ error: "AI provider is not configured" }, 409)
  const body = await c.req.json<{ prompt?: unknown; images?: unknown }>()
  if (typeof body.prompt !== "string" || body.prompt.trim().length === 0) return c.json({ error: "prompt is required" }, 400)
  let images: string[]
  try {
    images = validateUserImages(body.images, runtime.connectionInfo().imagesEnabled === true)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 400)
  }
  void runtime.start(body.prompt.trim(), images).catch((error: unknown) => console.error("ClineCore session failed", error))
  return c.json({ started: true }, 202)
})
app.post("/api/sessions/:id/messages", async (c) => {
  const body = await c.req.json<{ prompt?: unknown; images?: unknown }>()
  if (typeof body.prompt !== "string" || body.prompt.trim().length === 0) return c.json({ error: "prompt is required" }, 400)
  let images: string[]
  try {
    images = validateUserImages(body.images, runtime.connectionInfo().imagesEnabled === true)
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 400)
  }
  const sessionId = c.req.param("id")
  const activeSessionId = await runtime.send(sessionId, body.prompt.trim(), images)
  return c.json({ started: true, sessionId: activeSessionId }, 202)
})
app.post("/api/sessions/:id/abort", async (c) => { await runtime.abort(c.req.param("id")); return c.json({ ok: true }) })
app.get("/api/approvals", (c) => c.json(runtime.pendingApprovals()))
app.post("/api/approvals/:id", async (c) => { const body = await c.req.json<{ approved: boolean }>(); return c.json({ ok: runtime.approve(c.req.param("id"), body.approved) }) })
app.get("/api/events", (c) => {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder()
      const send = (event: RuntimeEvent) => controller.enqueue(encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`))
      clients.add(send); controller.enqueue(encoder.encode(": connected\n\n"))
      c.req.raw.signal.addEventListener("abort", () => { clients.delete(send); try { controller.close() } catch { /* disconnected */ } })
    },
  })
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } })
})
app.use("/*", async (c, next) => {
  c.header("Cache-Control", "no-store")
  await next()
})
app.use("/*", serveStatic({ root: "./public" }))
const isMainModule = process.argv[1] !== undefined
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isMainModule) {
  const port = Number(process.env.PORT ?? 3000)
  const hostname = process.env.HOST ?? "127.0.0.1"
  serve({ fetch: app.fetch, port, hostname }, (info) => console.log(`cline-for-web listening on http://${hostname}:${info.port}`))
  const shutdown = async () => { await runtime.dispose(); process.exit(0) }
  process.once("SIGINT", shutdown); process.once("SIGTERM", shutdown)
}

export default app
