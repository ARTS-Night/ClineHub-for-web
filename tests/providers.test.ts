import assert from "node:assert/strict"
import { createConnection, discoverModels, publicConnection } from "../src/providers.js"

const originalFetch = globalThis.fetch
const requestedUrls: string[] = []

globalThis.fetch = async (input) => {
  const url = String(input)
  requestedUrls.push(url)
  if (url === "http://lm.local:1234/api/v1/models") {
    return Response.json({ models: [{ type: "llm", display_name: "Ornith", max_context_length: 262144, capabilities: { vision: true }, loaded_instances: [{ id: "ornith", config: { context_length: 131072 } }] }] })
  }
  if (url === "http://llama.local:8080/v1/models") {
    return Response.json({ data: [{ id: "qwen.gguf" }] })
  }
  if (url === "http://ollama.local:11434/api/tags") {
    return Response.json({ models: [{ model: "qwen3:8b" }] })
  }
  if (url === "http://ollama.local:11434/api/show") return Response.json({ capabilities: ["completion", "vision"], model_info: { "qwen.context_length": 32768 } })
  return new Response("not found", { status: 404 })
}

try {
  const lmStudio = await discoverModels({ provider: "lmstudio", baseUrl: "http://lm.local:1234/v1" })
  assert.deepEqual(lmStudio.models, ["ornith"])
  assert.equal(lmStudio.modelInfo.ornith?.contextWindow, 131072)
  assert.equal(lmStudio.modelInfo.ornith?.imageSupport, "supported")

  const llamaCpp = await createConnection({ provider: "llamacpp", baseUrl: "http://llama.local:8080", modelId: "qwen.gguf" })
  assert.equal(llamaCpp.providerId, "openai-compatible")
  assert.equal(llamaCpp.baseUrl, "http://llama.local:8080/v1")

  const ollama = await createConnection({ provider: "ollama", baseUrl: "http://ollama.local:11434", modelId: "qwen3:8b", timeoutMs: 45_000, imagesEnabled: true })
  assert.equal(ollama.providerId, "ollama")
  assert.equal(ollama.baseUrl, "http://ollama.local:11434")
  assert.equal(ollama.timeoutMs, 45_000)
  assert.equal(ollama.imagesEnabled, true)
  assert.equal(ollama.modelInfo?.imageSupport, "supported")
  await assert.rejects(createConnection({ provider: "ollama", baseUrl: "http://ollama.local:11434", modelId: "qwen3:8b", timeoutMs: 999 }), /Timeout/)

  const codexModels = await discoverModels({ provider: "codex" })
  assert.ok(codexModels.models.length > 0)
  assert.equal(codexModels.models.includes("gpt-5.6"), false)
  assert.equal(codexModels.models.includes("gpt-5.6-luna"), true)
  const codex = await createConnection({ provider: "codex", modelId: codexModels.models[0] }, {
    access: "secret-access-token",
    refresh: "secret-refresh-token",
    expires: Date.now() + 60_000,
  })
  assert.equal(codex.providerId, "openai-codex")
  const publicCodex = publicConnection(codex)
  assert.equal(publicCodex.configured, true)
  assert.equal(publicCodex.provider, "codex")
  assert.equal(publicCodex.modelId, codexModels.models[0])
  assert.ok(publicCodex.contextWindow || publicCodex.maxInputTokens)
  assert.equal(JSON.stringify(publicConnection(codex)).includes("secret-access-token"), false)
  assert.equal(JSON.stringify(publicConnection(codex)).includes("secret-refresh-token"), false)

  const claudeModels = await discoverModels({ provider: "claude-code" })
  assert.deepEqual(claudeModels.models.sort(), ["haiku", "opus", "sonnet"])
  const claudeCode = await createConnection({ provider: "claude-code", modelId: "sonnet" })
  assert.equal(claudeCode.providerId, "claude-code")
  assert.equal(claudeCode.baseUrl, "")
  assert.equal(claudeCode.apiKey, undefined)
  assert.deepEqual(requestedUrls, [
    "http://lm.local:1234/api/v1/models",
    "http://llama.local:8080/v1/models",
    "http://llama.local:8080/props",
    "http://ollama.local:11434/api/tags",
    "http://ollama.local:11434/api/show",
  ])
} finally {
  globalThis.fetch = originalFetch
}
