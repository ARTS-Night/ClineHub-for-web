import assert from "node:assert/strict"
import app from "../src/server.js"

const pageResponse = await app.request("/")
assert.equal(pageResponse.status, 200)
const page = await pageResponse.text()
assert.match(page, /id="root"/)
assert.match(page, /src="\/app\.js"/)
assert.doesNotMatch(page, /id="agent-settings-dialog"/)
const bundleResponse = await app.request("/app.js")
assert.equal(bundleResponse.status, 200)
assert.match(await bundleResponse.text(), /generalSettings/)

const languagesResponse = await app.request("/api/languages")
assert.equal(languagesResponse.status, 200)
const languages = await languagesResponse.json() as { locales: string[] }
assert.ok(languages.locales.includes("ja") && languages.locales.includes("en"))
const jaFileResponse = await app.request("/setting/language/ja.json")
assert.equal(jaFileResponse.status, 200)
assert.equal((await jaFileResponse.json() as { _label?: string })._label, "日本語")

const settingsResponse = await app.request("/api/agent-settings")
assert.equal(settingsResponse.status, 200)
const settings = await settingsResponse.json() as { mcpServers: unknown[]; shellIdleTimeoutSeconds: number; activeTemplateId: string; templates: Array<{ id: string; name: string; prompt: string; builtin: boolean }> }
assert.ok(Array.isArray(settings.mcpServers))
assert.equal(typeof settings.shellIdleTimeoutSeconds, "number")
assert.equal(settings.templates.length, 4)
const originalActiveTemplateId = settings.activeTemplateId
const planTemplate = settings.templates.find((template) => template.id === "plan")
assert.ok(planTemplate)
const originalPlanPrompt = planTemplate.prompt

const previewResponse = await app.request("/api/agent-settings/preview", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ template: "Workspace: {workspace}; User: {user}" }),
})
assert.equal(previewResponse.status, 200)
const preview = await previewResponse.json() as { preview?: unknown; model?: unknown }
assert.match(String(preview.preview), /Shell inactivity policy/)
assert.ok("model" in preview)

// Create, edit, and delete a custom template.
const createResponse = await app.request("/api/agent-settings/templates", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Test template", prompt: "Hello {user}" }),
})
assert.equal(createResponse.status, 200)
const created = await createResponse.json() as { id: string; name: string; builtin: boolean }
assert.equal(created.name, "Test template")
assert.equal(created.builtin, false)
const patchTemplateResponse = await app.request(`/api/agent-settings/templates/${created.id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "Hello again {user}" }),
})
assert.equal(patchTemplateResponse.status, 200)
assert.equal((await patchTemplateResponse.json() as { prompt: string }).prompt, "Hello again {user}")
const deleteResponse = await app.request(`/api/agent-settings/templates/${created.id}`, { method: "DELETE" })
assert.equal(deleteResponse.status, 200)
const redeleteResponse = await app.request(`/api/agent-settings/templates/${created.id}`, { method: "DELETE" })
assert.equal(redeleteResponse.status, 500)

// Switching the active template and editing a built-in one.
const activateResponse = await app.request("/api/agent-settings", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ activeTemplateId: "plan" }),
})
assert.equal(activateResponse.status, 200)
assert.equal((await activateResponse.json() as { activeTemplateId: string }).activeTemplateId, "plan")

const planPatchResponse = await app.request("/api/agent-settings/templates/plan", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "Custom plan prompt" }),
})
assert.equal(planPatchResponse.status, 200)
assert.equal((await planPatchResponse.json() as { prompt: string }).prompt, "Custom plan prompt")

const resetResponse = await app.request("/api/agent-settings/templates/plan/reset", { method: "POST" })
assert.equal(resetResponse.status, 200)
assert.equal((await resetResponse.json() as { prompt: string }).prompt, originalPlanPrompt)

// This test runs against the real .cline-data (server.js has no test seam for
// an isolated data dir), so restore what it changed rather than leave it dirty.
await app.request("/api/agent-settings", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ activeTemplateId: originalActiveTemplateId }),
})
console.log("agent settings API tests passed")
