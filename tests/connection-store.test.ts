import assert from "node:assert/strict"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ConnectionStore } from "../src/stores/connection-store.js"

const directory = await mkdtemp(join(tmpdir(), "cline-connection-store-"))
const file = join(directory, "connection.json")
const store = new ConnectionStore(file)

try {
  await store.save({
    provider: "claude-code",
    providerId: "claude-code",
    baseUrl: "",
    modelId: "sonnet",
    modelInfo: { id: "sonnet", name: "Claude Sonnet", contextWindow: 1_000_000, maxInputTokens: 1_000_000, capabilities: ["images"], imageSupport: "supported" },
    timeoutMs: 120_000,
    imagesEnabled: true,
  })
  const raw = await readFile(file, "utf8")
  assert.equal(raw.includes("apiKey"), false)
  assert.equal(raw.includes("accessToken"), false)
  assert.equal(raw.includes("refreshToken"), false)
  assert.deepEqual(await store.load(), {
    provider: "claude-code",
    providerId: "claude-code",
    baseUrl: "",
    modelId: "sonnet",
    apiKey: undefined,
    modelInfo: { id: "sonnet", name: "Claude Sonnet", contextWindow: 1_000_000, maxInputTokens: 1_000_000, capabilities: ["images"], imageSupport: "supported" },
    timeoutMs: 120_000,
    imagesEnabled: true,
  })

  await store.save({
    provider: "codex",
    providerId: "openai-codex",
    baseUrl: "https://chatgpt.com/backend-api/codex",
    modelId: "gpt-test",
    apiKey: "must-not-be-saved",
    codexCredentials: { access: "secret", refresh: "secret", expires: Date.now() + 60_000 },
    imagesEnabled: false,
  })
  assert.equal(await store.load(), undefined)
} finally {
  await rm(directory, { recursive: true, force: true })
}
