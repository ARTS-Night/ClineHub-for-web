import assert from "node:assert/strict"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { ProfileStore } from "../src/profile-store.js"

const directory = await mkdtemp(join(tmpdir(), "cline-web-profiles-"))
try {
  const file = join(directory, "profiles.json")
  const store = new ProfileStore(file, join(directory, "profiles.key"))
  await store.load()

  const model = await store.saveModel({
    name: "Local model",
    settings: {
      provider: "ollama",
      providerId: "ollama",
      baseUrl: "http://127.0.0.1:11434",
      modelId: "test-model",
      apiKey: "local-model",
      modelInfo: { id: "test-model", contextWindow: 32_768, capabilities: ["images"], imageSupport: "supported" },
      timeoutMs: 90_000,
      imagesEnabled: true,
    },
  })
  assert.equal(store.list().activeModelProfileId, model.id)
  assert.equal(model.timeoutMs, 90_000)
  assert.equal(model.imagesEnabled, true)

  // Editing a profile after creation (e.g. flipping image support) must not
  // require deleting and recreating it, and must not change which model is active.
  await store.activateModel(model.id)
  const secondModel = await store.saveModel({ name: "Other model", settings: { provider: "ollama", providerId: "ollama", baseUrl: "http://127.0.0.1:11434", modelId: "other-model", apiKey: "local-model", imagesEnabled: false } })
  await store.activateModel(model.id)
  const updated = await store.updateModel(secondModel.id, { imagesEnabled: true, timeoutMs: 30_000 })
  assert.equal(updated.imagesEnabled, true)
  assert.equal(updated.timeoutMs, 30_000)
  assert.equal(updated.name, "Other model", "unpatched fields are preserved")
  assert.equal(store.list().activeModelProfileId, model.id, "editing an inactive profile must not activate it")
  await assert.rejects(store.updateModel("missing", { imagesEnabled: true }), /Model profile not found/)

  const ssh = await store.saveSshWorkspace({
    name: "Linux server",
    host: "192.0.2.10",
    port: 22,
    username: "developer",
    remoteDirectory: "/srv/project",
    operatingSystem: "linux",
    authType: "password",
    password: "not-plain-text",
    sudoPermission: "ask",
    sudoPassword: "sudo-not-plain-text",
  })
  assert.equal(ssh.hasPassword, true)
  assert.equal(ssh.hasSudoPassword, true)
  assert.equal(ssh.sudoPermission, "ask")
  assert.equal("password" in ssh, false)
  assert.equal("sudoPassword" in ssh, false)
  const persisted = await readFile(file, "utf8")
  assert.equal(persisted.includes("not-plain-text"), false)
  assert.equal(persisted.includes("sudo-not-plain-text"), false)
  assert.equal((await store.resolveSshById(ssh.id)).password, "not-plain-text")
  assert.equal((await store.resolveSshById(ssh.id)).sudoPassword, "sudo-not-plain-text")

  await store.activateWorkspace(ssh.id)
  assert.equal(store.activeWorkspace()?.id, ssh.id)

  const reloaded = new ProfileStore(file, join(directory, "profiles.key"))
  await reloaded.load()
  assert.equal((await reloaded.resolveSshById(ssh.id)).password, "not-plain-text")
  assert.equal(reloaded.list().models[0]?.modelId, "test-model")
  console.log("profile store tests passed")
} finally {
  await rm(directory, { recursive: true, force: true })
}
