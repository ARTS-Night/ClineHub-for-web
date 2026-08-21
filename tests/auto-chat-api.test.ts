import assert from "node:assert/strict"

// No login required for this suite — see agent-settings-api.test.ts for why.
process.env.CLINEHUB_USER = ""
process.env.CLINEHUB_PASSWORD = ""
const { default: app } = await import("../src/server.js")

const listResponse = await app.request("/api/auto-chats")
assert.equal(listResponse.status, 200)
const list = await listResponse.json() as { timezone: string; autoChats: unknown[] }
assert.equal(typeof list.timezone, "string")
assert.deepEqual(list.autoChats, [])

// A local workspace profile always exists on boot (see ClineRuntime.create's
// ensureLocalWorkspace call) — reuse it instead of creating a new one. This
// test environment has no AI provider configured, so no real Model profile
// exists either; scenarios below are written to avoid needing one, except
// where a missing model is exactly the thing under test.
const profiles = await (await app.request("/api/profiles")).json() as { workspaces: Array<{ id: string }> }
const workspaceId = profiles.workspaces[0]!.id

async function post(body: unknown) {
  return app.request("/api/auto-chats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
}

// --- Existence checks only gate *enabling* (enabled: true); saving disabled
// never validates references — that's what lets a stale/never-valid
// reference be fixed (or simply left off) instead of becoming unsaveable. ---
const badWorkspace = await post({ name: "A", workspaceProfileId: "nope", templateId: "daily", modelProfileId: "nope-too", runPrompt: "x", schedule: { type: "manual" }, enabled: true })
assert.equal(badWorkspace.status, 500)
assert.match((await badWorkspace.json() as { error: string }).error, /Ask|Workspace profile not found/) // Ask (daily) is checked first — see below for isolation

const badTemplateEnabled = await post({ name: "A", workspaceProfileId: workspaceId, templateId: "does-not-exist", modelProfileId: "nope", runPrompt: "x", schedule: { type: "manual" }, enabled: true })
assert.equal(badTemplateEnabled.status, 500)
assert.match((await badTemplateEnabled.json() as { error: string }).error, /Template not found/)

// modelProfileId is required by the store even when disabled — a save-time
// "required field" check, independent of the enabled-only existence gate.
const noModel = await post({ name: "A", workspaceProfileId: workspaceId, templateId: "daily", runPrompt: "x", schedule: { type: "manual" } })
assert.equal(noModel.status, 500)
assert.match((await noModel.json() as { error: string }).error, /Model profile/)

// Saving disabled with an unresolvable workspace/template is allowed —
// nothing here should throw.
const disabledWithBadRefs = await post({ name: "Stale refs OK while off", workspaceProfileId: "nope", templateId: "nope", modelProfileId: "nope", runPrompt: "x", schedule: { type: "manual" }, enabled: false })
assert.equal(disabledWithBadRefs.status, 200)
await app.request(`/api/auto-chats/${(await disabledWithBadRefs.json() as { id: string }).id}`, { method: "DELETE" })

// --- C2: a Template with any "ask" permission cannot be saved *enabled* ---
// Every built-in template (readonly/balanced presets) contains "ask"
// somewhere, so "daily" is a direct hit — checked before workspace/model so
// this is reachable without a real Model profile.
const askRejected = await post({ name: "Ask test", workspaceProfileId: workspaceId, templateId: "daily", runPrompt: "x", schedule: { type: "manual" }, enabled: true })
assert.equal(askRejected.status, 500)
assert.match((await askRejected.json() as { error: string }).error, /Ask/)

// Saving the same Template *disabled* is fine — C2 only blocks arming it.
// (This still fails, but for the unrelated "Model profile is required"
// reason — the point is it's NOT rejected for containing Ask.)
const askOkDisabled = await post({ name: "Ask test (disabled)", workspaceProfileId: workspaceId, templateId: "daily", runPrompt: "x", schedule: { type: "manual" }, enabled: false })
assert.equal(askOkDisabled.status, 500)
const askOkDisabledError = (await askOkDisabled.json() as { error: string }).error
assert.doesNotMatch(askOkDisabledError, /Ask/)
assert.match(askOkDisabledError, /Model profile/)

// A "full" permission template (no Ask anywhere) needed to exercise the
// happy path — none of the built-ins qualify, so make one via the existing
// Agent Settings template endpoint (Phase 2/3 explicitly reuses Templates).
const fullTemplate = await (await app.request("/api/agent-settings/templates", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Unattended", prompt: "Go.", permissionPreset: "full" }),
})).json() as { id: string }

// Created disabled, with no modelProfileId field at all (store still
// requires it as a *stored* value, but it's simply an unresolved id string
// here — nothing checks it exists while disabled).
const created = await post({
  name: "Morning AI News", workspaceProfileId: workspaceId, modelProfileId: "not-a-real-profile-yet", templateId: fullTemplate.id,
  runPrompt: "Summarize today's {{date}} AI news for {{workspace}}.", tags: ["ai-news", "daily"],
  schedule: { type: "daily", time: "07:00" }, enabled: false,
})
assert.equal(created.status, 200)
const definition = await created.json() as { id: string; name: string; tags: string[]; nextRunAt?: string }
assert.equal(definition.name, "Morning AI News")
assert.deepEqual(definition.tags, ["ai-news", "daily"])
assert.equal(definition.nextRunAt, undefined) // disabled -> no pending fire

// Enabling now fails at save time because the effective Model profile still
// doesn't exist (Ask/template passed, workspace passed, model fails last).
const enableFails = await app.request(`/api/auto-chats/${definition.id}`, {
  method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: true }),
})
assert.equal(enableFails.status, 500)
assert.match((await enableFails.json() as { error: string }).error, /Model profile not found/)

// Renaming (an unrelated field) while the Model reference stays broken must
// still succeed — turning an Auto Chat off, or editing it, is never blocked
// by a stale reference; only *arming* it (enabled: true) is.
const renamed = await app.request(`/api/auto-chats/${definition.id}`, {
  method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Morning AI News (renamed)" }),
})
assert.equal(renamed.status, 200)
assert.equal((await renamed.json() as { name: string }).name, "Morning AI News (renamed)")

// --- Manual run: validated references fail cleanly with the 4-field run state (C13) ---
const run = await app.request(`/api/auto-chats/${definition.id}/run`, { method: "POST", body: "{}" })
assert.equal(run.status, 200)
const runResult = await run.json() as { result: string; message?: string }
assert.equal(runResult.result, "failed")
assert.match(runResult.message ?? "", /Model profile not found/)
const afterRun = await (await app.request("/api/auto-chats")).json() as { autoChats: Array<{ id: string; lastRunResult?: string; lastRunMessage?: string }> }
const persisted = afterRun.autoChats.find((item) => item.id === definition.id)!
assert.equal(persisted.lastRunResult, "failed")
assert.match(persisted.lastRunMessage ?? "", /Model profile not found/)

// --- Delete: definition removed, no effect on (nonexistent, in this test) generated sessions ---
const deleted = await app.request(`/api/auto-chats/${definition.id}`, { method: "DELETE" })
assert.equal(deleted.status, 200)
assert.deepEqual((await (await app.request("/api/auto-chats")).json() as { autoChats: unknown[] }).autoChats, [])
const redelete = await app.request(`/api/auto-chats/${definition.id}`, { method: "DELETE" })
assert.equal(redelete.status, 200) // delete is idempotent, matching AutoChatStore.delete()'s filter-based removal

// Agent Settings (templates, MCP servers, ...) persist to the same shared
// .cline-data/ directory other test suites read from — clean up the
// scratch template created above so it doesn't leak into their assertions.
await app.request(`/api/agent-settings/templates/${fullTemplate.id}`, { method: "DELETE" })

console.log("auto-chat API tests passed")
