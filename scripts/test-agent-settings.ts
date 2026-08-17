import assert from "node:assert/strict"
import { resolve } from "node:path"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { AgentSettingsStore } from "../src/agent-settings.js"

const workspace = resolve(process.cwd())
const store = new AgentSettingsStore(workspace, workspace)

// Templates are the modes: four standard ones ship by default, "daily" active.
assert.equal(store.get().activeTemplateId, "daily")
assert.equal(store.get().templates.length, 4)
assert.equal(store.get().templates.find((t) => t.id === "plan")?.permissionPreset, "readonly")
assert.equal(store.get().templates.find((t) => t.id === "coding")?.permissionPreset, "balanced")
assert.deepEqual(store.policies().run_commands, { enabled: true, autoApprove: false })

await assert.rejects(store.update({ activeTemplateId: "nope" }), /Template not found/)
await store.update({ activeTemplateId: "plan" })
assert.equal(store.effectivePermissionPreset(), "readonly")
assert.deepEqual(store.policies().run_commands, { enabled: false, autoApprove: false })

// Editing a template (even a builtin one) only changes that template; the
// active one's effective permissions follow immediately.
await store.updateTemplate("plan", { permissions: { run_commands: "allow" } })
assert.equal(store.get().templates.find((t) => t.id === "plan")?.permissionPreset, "custom")
assert.deepEqual(store.policies().run_commands, { enabled: true, autoApprove: true })
await store.resetTemplate("plan")
assert.equal(store.get().templates.find((t) => t.id === "plan")?.permissionPreset, "readonly")
await assert.rejects(store.resetTemplate("nope"), /Only built-in templates can be reset/)
await assert.rejects(store.deleteTemplate("plan"), /Built-in templates cannot be deleted/)

await store.update({ activeTemplateId: "daily" })
assert.deepEqual(store.policies().run_commands, { enabled: true, autoApprove: false })

const created = await store.createTemplate({ name: "My mode", prompt: "Do the thing for {user}.", permissionPreset: "full" })
assert.equal(created.permissionPreset, "full")
await store.update({ activeTemplateId: created.id })
assert.equal(store.effectiveSystemPrompt(), "Do the thing for {user}.")
await store.deleteTemplate(created.id)
assert.equal(store.get().activeTemplateId, "daily", "deleting the active template falls back to another one")
await assert.rejects(store.updateTemplate(created.id, { name: "x" }), /Template not found/)

await assert.rejects(store.createTemplate({ name: "", prompt: "x" }), /Template name is required/)
await assert.rejects(store.createTemplate({ name: "x", prompt: "" }), /Template prompt is required/)

await assert.rejects(
  store.update({ workspacePath: resolve(workspace, "..") }),
  /Workspace must be inside/,
)

await assert.rejects(store.update({ maxIterations: 0 }), /Max iterations/)
await store.update({ compactionEnabled: false, compactionStrategy: "basic", preserveRecentTokens: 12_000, contextWindowOverride: 65_536 })
assert.equal(store.get().compactionEnabled, false)
assert.equal(store.get().contextWindowOverride, 65_536)
await assert.rejects(store.update({ preserveRecentTokens: 10 }), /Preserved recent tokens/)
await store.update({
  shellIdleTimeoutSeconds: 45,
  shellIdleAction: "wait",
  mcpServers: [{ id: "docs", name: "docs", enabled: true, transport: "streamableHttp", command: "", args: [], url: "http://127.0.0.1:8080/mcp" }],
})
assert.equal(store.get().shellIdleTimeoutSeconds, 45)
assert.equal(store.get().mcpServers[0]?.transport, "streamableHttp")

assert.equal(store.get().shellIdleCarryContext, true)
await store.update({ shellIdleAction: "auto", shellIdleCarryContext: false })
assert.equal(store.get().shellIdleAction, "auto")
assert.equal(store.get().shellIdleCarryContext, false)
await assert.rejects(store.update({ shellIdleAction: "invalid" }), /Invalid shell idle action/)
await assert.rejects(store.update({ shellIdleCarryContext: "yes" }), /Shell idle context setting must be a boolean/)
await assert.rejects(store.update({ mcpServers: [{ id: "bad", name: "bad", enabled: true, transport: "stdio", command: "", args: [], url: "" }] }), /needs a command/)

const directory = await mkdtemp(resolve(tmpdir(), "cline-web-agent-settings-"))
try {
  const settingsPath = resolve(directory, "agent-settings.json")
  const persisted = new AgentSettingsStore(workspace, workspace, settingsPath)
  await persisted.update({ maxIterations: 77 })
  await persisted.updateTemplate("coding", { permissionPreset: "full" })
  const restored = new AgentSettingsStore(workspace, workspace, settingsPath)
  await restored.load()
  assert.equal(restored.get().maxIterations, 77)
  assert.equal(restored.get().templates.find((t) => t.id === "coding")?.permissionPreset, "full")

  // Legacy pre-template files (mode/modeOverrides/systemPrompt/permissions at
  // the top level) still load without throwing; the unknown fields are
  // simply ignored and the fresh default templates are used instead.
  const { writeFile } = await import("node:fs/promises")
  await writeFile(settingsPath, JSON.stringify({ version: 1, workspacePath: workspace, systemPrompt: "old", permissionPreset: "full", permissions: {}, mode: "act", maxIterations: 12 }))
  const legacy = new AgentSettingsStore(workspace, workspace, settingsPath)
  await legacy.load()
  assert.equal(legacy.get().maxIterations, 12)
  assert.equal(legacy.get().activeTemplateId, "daily")
} finally {
  await rm(directory, { recursive: true, force: true })
}

console.log("agent settings tests passed")
