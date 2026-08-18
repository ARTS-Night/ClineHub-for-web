import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { getCookie, setCookie, deleteCookie } from "hono/cookie"
import { Hono } from "hono"
import { readdir, realpath } from "node:fs/promises"
import { networkInterfaces } from "node:os"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { authRequired, createSession, destroySession, isValidSession, verifyCredentials } from "./auth.js"
import { addUser, flagString, parseArgs, removeUser } from "./cli.js"
import { ClineRuntime, SessionNotFoundError, validateUserImages, type RuntimeEvent } from "./runtime.js"
import type { ConnectionRequest } from "./providers.js"
import { isWithin } from "./stores/agent-settings.js"

try { process.loadEnvFile() } catch { /* no .env file — nothing to load */ }

// The app's own static assets (dist/, setting/language/) live next to this file,
// not necessarily under the current working directory — e.g. installed globally
// via `pnpm add -g` and launched as `clinehub-for-web` from an arbitrary project
// folder. Resolve them relative to this file instead of process.cwd(): in dev
// this file is <repo>/src/server.ts (one level up is the repo root); in the
// tsup-bundled release it's <install>/dist/server.js (one level up is the
// install root) — both layouts put dist/ and setting/ as siblings of that root.
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")

// realpath() on BOTH sides, not a raw string/URL compare — two independent
// reasons either side alone can diverge on its own:
//  1. import.meta.url reflects wherever the module was actually loaded from,
//     which can be a symlink target — e.g. `pnpm add -g` installs are a
//     symlink into pnpm's content-addressable store, so process.argv[1]
//     (the symlink path) and import.meta.url (the resolved target) differ.
//  2. On Windows, import.meta.url keeps the drive letter exactly as typed on
//     the command line (e.g. "e:/..."), but realpath() normalizes it (e.g.
//     "E:/...") — so realpath-ing only one side just trades one mismatch for
//     another. Both sides need the same normalization to compare equal.
// Either mismatch alone made this check silently false — no error, the
// server just never called serve() and the process exited clean.
const thisFile = await realpath(fileURLToPath(import.meta.url))
const isMainModule = process.argv[1] !== undefined
  && thisFile === await realpath(resolve(process.argv[1])).catch(() => null)

// Only meaningful when actually launched as a CLI (isMainModule); importing
// this module for tests must never read argv.
const cli = isMainModule ? parseArgs(process.argv.slice(2)) : { flags: new Map<string, string | true>(), positional: [] }

// --add-user/--remove-user manage the opt-in login gate's .env credentials and
// exit immediately — they never start the server, so they run before any of the
// runtime/workspace setup below.
if (isMainModule) {
  if (cli.flags.has("add-user")) {
    const [username, password] = cli.positional
    if (!username || !password) {
      console.error("Usage: clinehub-for-web --add-user <username> <password>")
      process.exit(1)
    }
    await addUser(username, password)
    console.log(`Saved CLINEHUB_USER/CLINEHUB_PASSWORD to .env. Restart the server for login to take effect.`)
    process.exit(0)
  }
  if (cli.flags.has("remove-user")) {
    await removeUser()
    console.log("Removed CLINEHUB_USER/CLINEHUB_PASSWORD from .env. Restart the server for the login gate to turn off.")
    process.exit(0)
  }
}

process.env.CLINE_DATA_DIR ??= resolve(process.cwd(), ".cline-data")

const app = new Hono()
const SESSION_COOKIE = "clinehub_session"
const initialWorkspace = await realpath(resolve(process.env.CLINE_WORKSPACE_ROOT ?? process.cwd()))
// Unset by default: any existing absolute path can be picked as a workspace,
// same as SSH workspaces already allow any remote directory. Set
// CLINE_ALLOWED_ROOT to restrict workspace selection to one subtree — useful
// when the server is reachable from other devices on the LAN.
const allowedRoot = process.env.CLINE_ALLOWED_ROOT ? await realpath(resolve(process.env.CLINE_ALLOWED_ROOT)) : ""
const runtime = await ClineRuntime.create(initialWorkspace, allowedRoot)
const clients = new Set<(event: RuntimeEvent) => void>()
runtime.subscribe((event) => { for (const send of clients) send(event) })
app.onError((error, c) => {
  if (error instanceof SessionNotFoundError) return c.json({ error: error.message }, 404)
  console.error("HTTP API error", error)
  return c.json({ error: error instanceof Error ? error.message : String(error) }, 500)
})
// Login is opt-in: only enforced when both CLINEHUB_USER and
// CLINEHUB_PASSWORD are set (typically via .env). With neither set, the app
// stays open exactly like before this feature existed.
app.get("/api/auth/status", (c) => c.json({ required: authRequired(), authenticated: !authRequired() || isValidSession(getCookie(c, SESSION_COOKIE)) }))
app.post("/api/auth/login", async (c) => {
  if (!authRequired()) return c.json({ ok: true })
  const body = await c.req.json<{ username?: unknown; password?: unknown }>().catch(() => ({}) as Record<string, unknown>)
  if (typeof body.username !== "string" || typeof body.password !== "string" || !verifyCredentials(body.username, body.password)) {
    return c.json({ error: "Invalid username or password" }, 401)
  }
  setCookie(c, SESSION_COOKIE, createSession(), { httpOnly: true, sameSite: "Lax", path: "/", maxAge: 60 * 60 * 24 * 30 })
  return c.json({ ok: true })
})
app.post("/api/auth/logout", (c) => {
  destroySession(getCookie(c, SESSION_COOKIE))
  deleteCookie(c, SESSION_COOKIE, { path: "/" })
  return c.json({ ok: true })
})
// Gates every other /api/* route behind the session cookie once login is
// required. Static assets (dist/, language files) stay reachable so the SPA
// can boot far enough to show the login screen in the first place.
app.use("/api/*", async (c, next) => {
  if (!authRequired() || c.req.path.startsWith("/api/auth/") || c.req.path === "/api/languages") return next()
  if (!isValidSession(getCookie(c, SESSION_COOKIE))) return c.json({ error: "Authentication required" }, 401)
  return next()
})
// Language files live in ./setting/language/*.json (outside the client bundle)
// so users can edit or add one — e.g. zh.json — without a rebuild.
app.get("/api/languages", async (c) => {
  const files = await readdir(resolve(packageRoot, "setting", "language")).catch(() => [] as string[])
  return c.json({ locales: files.filter((file) => file.endsWith(".json")).map((file) => file.slice(0, -5)) })
})
app.use("/setting/language/*", serveStatic({ root: packageRoot }))
app.get("/api/sessions", async (c) => c.json(await runtime.list()))
app.delete("/api/sessions", async (c) => c.json(await runtime.deleteAll()))
app.get("/api/agent-settings", (c) => c.json(runtime.agentSettingsInfo()))
app.patch("/api/agent-settings", async (c) => c.json(await runtime.updateAgentSettings(await c.req.json())))
// Backs the folder-browse UI (workspace path fields): lists subdirectories of a
// given path so the user can navigate the server's filesystem instead of typing
// an absolute path blind. Subject to the same CLINE_ALLOWED_ROOT restriction as
// workspace selection itself.
app.get("/api/browse-directory", async (c) => {
  const requested = c.req.query("path")
  const target = requested && requested.trim() ? resolve(requested.trim()) : initialWorkspace
  const real = await realpath(target).catch(() => null)
  if (!real) return c.json({ error: "Path not found" }, 404)
  if (!isWithin(allowedRoot, real)) return c.json({ error: `Must be inside: ${allowedRoot}` }, 400)
  const entries = await readdir(real, { withFileTypes: true }).catch(() => null)
  if (!entries) return c.json({ error: "Cannot read this directory" }, 400)
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort((a, b) => a.localeCompare(b))
  const parentPath = dirname(real)
  const parent = parentPath !== real && isWithin(allowedRoot, parentPath) ? parentPath : null
  return c.json({ path: real, parent, directories })
})
app.post("/api/agent-settings/preview", async (c) => {
  const body = await c.req.json<{ template?: unknown }>()
  return c.json(await runtime.previewSystemPrompt(body.template))
})
app.post("/api/agent-settings/mcp/test", async (c) => c.json(await runtime.testMcpServer(await c.req.json(), c.req.raw.signal)))
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
app.use("/*", serveStatic({ root: resolve(packageRoot, "dist") }))

if (isMainModule) {
  // --port=/--ip= win over PORT/HOST env vars, which win over the defaults.
  const port = Number(flagString(cli.flags, "port") ?? process.env.PORT ?? 3000)
  const hostname = flagString(cli.flags, "ip") ?? process.env.HOST ?? "127.0.0.1"
  serve({ fetch: app.fetch, port, hostname }, (info) => {
    console.log(`ClineHub-for-web listening on http://${hostname}:${info.port}`)
    // "0.0.0.0" isn't itself browsable — print the LAN addresses it's
    // actually reachable at, e.g. for opening from a phone on the same network.
    if (hostname === "0.0.0.0" || hostname === "::") {
      for (const addresses of Object.values(networkInterfaces())) {
        for (const address of addresses ?? []) {
          if (address.family === "IPv4" && !address.internal) console.log(`  also reachable at http://${address.address}:${info.port}`)
        }
      }
    }
  })
  const shutdown = async () => { await runtime.dispose(); process.exit(0) }
  process.once("SIGINT", shutdown); process.once("SIGTERM", shutdown)
}

export default app
