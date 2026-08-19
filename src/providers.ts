import { Llms } from "@cline/sdk"

export type ModelInfo = {
  id: string
  name?: string
  contextWindow?: number
  maxInputTokens?: number
  capabilities?: string[]
  imageSupport?: "supported" | "unsupported" | "unknown"
  [key: string]: unknown
}

export type ProviderKind = "lmstudio" | "llamacpp" | "ollama" | "codex" | "claude-code"

export type CodexCredentials = {
  access: string
  refresh: string
  expires: number
  accountId?: string
  email?: string
  metadata?: Record<string, unknown>
}

export type ConnectionRequest = {
  provider: ProviderKind
  baseUrl?: string
  modelId?: string
  timeoutMs?: unknown
  imagesEnabled?: unknown
}

export type ConnectionSettings = {
  provider: ProviderKind
  providerId: "lmstudio" | "ollama" | "openai-compatible" | "openai-codex" | "claude-code"
  baseUrl: string
  modelId: string
  apiKey?: string
  codexCredentials?: CodexCredentials
  modelInfo?: ModelInfo
  timeoutMs?: number
  imagesEnabled?: boolean
}

export type ModelDiscovery = {
  provider: ProviderKind
  baseUrl: string
  models: string[]
  modelInfo: Record<string, ModelInfo>
}

export const providerDefaults: Record<ProviderKind, string> = {
  lmstudio: "http://127.0.0.1:1234",
  llamacpp: "http://127.0.0.1:8080",
  ollama: "http://127.0.0.1:11434",
  codex: "https://chatgpt.com/backend-api/codex",
  "claude-code": "",
}

// The SDK catalog is shared with the OpenAI API catalog. This alias is
// advertised there, but ChatGPT-account Codex rejects it at runtime.
const unsupportedChatGptCodexModels = new Set(["gpt-5.6"])

export async function discoverModels(input: ConnectionRequest): Promise<ModelDiscovery> {
  const provider = parseProvider(input.provider)
  if (provider === "codex" || provider === "claude-code") {
    const providerId = provider === "codex" ? "openai-codex" : "claude-code"
    const discoveredModelInfo = await Llms.getModelsForProvider(providerId)
    const rawModelInfo = provider === "codex"
      ? Object.fromEntries(Object.entries(discoveredModelInfo).filter(([id]) => !unsupportedChatGptCodexModels.has(id)))
      : discoveredModelInfo
    const modelInfo = Object.fromEntries(Object.entries(rawModelInfo).map(([id, info]) => [id, normalizeCatalogModelInfo(id, info)]))
    const models = Object.keys(modelInfo)
    if (models.length === 0) throw new Error(`No ${provider === "codex" ? "Codex subscription" : "Claude Code"} models are available`)
    return { provider, baseUrl: providerDefaults[provider], models, modelInfo }
  }

  const baseUrl = normalizeBaseUrl(input.baseUrl || providerDefaults[provider])
  const timeoutMs = parseOptionalTimeout(input.timeoutMs)

  const discovered = provider === "ollama"
    ? await discoverOllama(baseUrl, timeoutMs)
    : provider === "lmstudio"
      ? await discoverLmStudio(baseUrl, timeoutMs)
      : await discoverOpenAiCompatible(baseUrl, timeoutMs)

  if (discovered.models.length === 0) throw new Error("No usable models were returned by the server")
  return { provider, baseUrl, ...discovered }
}

export async function createConnection(input: ConnectionRequest, codexCredentials?: CodexCredentials): Promise<ConnectionSettings> {
  const discovery = await discoverModels(input)
  const requestedModel = cleanOptional(input.modelId)
  const modelId = requestedModel ?? discovery.models[0]!
  if (!discovery.models.includes(modelId)) {
    throw new Error(`Model is not available: ${modelId}`)
  }
  const timeoutMs = parseOptionalTimeout(input.timeoutMs)
  const imagesEnabled = parseOptionalBoolean(input.imagesEnabled, false)
  const selectedModelInfo = discovery.modelInfo[modelId]
  if (imagesEnabled && selectedModelInfo?.imageSupport === "unsupported") {
    throw new Error(`The selected model reports that image input is not supported: ${modelId}`)
  }

  if (discovery.provider === "codex") {
    if (!codexCredentials) throw new Error("Sign in with ChatGPT before connecting")
    return {
      provider: "codex",
      providerId: "openai-codex",
      baseUrl: providerDefaults.codex,
      modelId,
      apiKey: codexCredentials.access,
      codexCredentials,
      modelInfo: selectedModelInfo,
      timeoutMs,
      imagesEnabled,
    }
  }

  if (discovery.provider === "claude-code") {
    return {
      provider: "claude-code",
      providerId: "claude-code",
      baseUrl: "",
      modelId,
      modelInfo: selectedModelInfo,
      timeoutMs,
      imagesEnabled,
    }
  }

  return {
    provider: discovery.provider,
    providerId: providerId(discovery.provider),
    baseUrl: apiBaseUrl(discovery.provider, discovery.baseUrl),
    modelId,
    apiKey: "local-model",
    modelInfo: selectedModelInfo,
    timeoutMs,
    imagesEnabled,
  }
}

export function publicConnection(settings?: ConnectionSettings) {
  if (!settings) return { configured: false as const }
  return {
    configured: true as const,
    provider: settings.provider,
    baseUrl: settings.baseUrl,
    modelId: settings.modelId,
    authenticated: settings.provider === "codex" ? Boolean(settings.codexCredentials) : true,
    contextWindow: settings.modelInfo?.contextWindow,
    maxInputTokens: settings.modelInfo?.maxInputTokens,
    timeoutMs: settings.timeoutMs,
    imagesEnabled: settings.imagesEnabled === true,
    imageSupport: settings.modelInfo?.imageSupport ?? "unknown",
  }
}

function providerId(provider: ProviderKind): ConnectionSettings["providerId"] {
  if (provider === "lmstudio") return "lmstudio"
  if (provider === "ollama") return "ollama"
  if (provider === "codex") return "openai-codex"
  if (provider === "claude-code") return "claude-code"
  return "openai-compatible"
}

function apiBaseUrl(provider: ProviderKind, baseUrl: string): string {
  if (provider === "ollama" || provider === "codex" || provider === "claude-code") return baseUrl
  return ensureV1(baseUrl)
}

async function discoverLmStudio(baseUrl: string, timeoutMs?: number): Promise<Pick<ModelDiscovery, "models" | "modelInfo">> {
  try {
    const body = await getJson(`${baseUrl}/api/v1/models`, timeoutMs)
    if (isRecord(body) && Array.isArray(body.models)) {
      const loaded: string[] = []
      const modelInfo: Record<string, ModelInfo> = {}
      for (const model of body.models) {
        if (!isRecord(model) || model.type !== "llm" || !Array.isArray(model.loaded_instances)) continue
        for (const instance of model.loaded_instances) {
          if (isRecord(instance) && typeof instance.id === "string") {
            loaded.push(instance.id)
            const config = isRecord(instance.config) ? instance.config : undefined
            const contextWindow = positiveInteger(config?.context_length) ?? positiveInteger(model.max_context_length)
            const capabilities = isRecord(model.capabilities) ? model.capabilities : undefined
            const imageSupport = typeof capabilities?.vision === "boolean" ? (capabilities.vision ? "supported" : "unsupported") : "unknown"
            modelInfo[instance.id] = {
              id: instance.id,
              name: typeof model.display_name === "string" ? model.display_name : instance.id,
              contextWindow,
              capabilities: imageSupport === "supported" ? ["images"] : [],
              imageSupport,
            }
          }
        }
      }
      if (loaded.length > 0) return { models: unique(loaded), modelInfo }
    }
  } catch {
    // Older LM Studio versions may expose only the OpenAI-compatible endpoint.
  }
  return await discoverOpenAiCompatible(baseUrl, timeoutMs)
}

async function discoverOllama(baseUrl: string, timeoutMs?: number): Promise<Pick<ModelDiscovery, "models" | "modelInfo">> {
  const body = await getJson(`${baseUrl}/api/tags`, timeoutMs)
  if (!isRecord(body) || !Array.isArray(body.models)) return { models: [], modelInfo: {} }
  const models = unique(body.models.flatMap((model) => {
    if (!isRecord(model)) return []
    if (typeof model.model === "string") return [model.model]
    return typeof model.name === "string" ? [model.name] : []
  }))
  const modelInfo: Record<string, ModelInfo> = {}
  await Promise.all(models.map(async (id) => {
    try {
      const detail = await postJson(`${baseUrl}/api/show`, { model: id }, timeoutMs)
      const info = isRecord(detail) && isRecord(detail.model_info) ? detail.model_info : {}
      const contextWindow = Object.entries(info).find(([key, value]) => key.endsWith(".context_length") && positiveInteger(value))?.[1]
      const reportedCapabilities = isRecord(detail) && Array.isArray(detail.capabilities)
        ? detail.capabilities.filter((value): value is string => typeof value === "string")
        : undefined
      const imageSupport = reportedCapabilities ? (reportedCapabilities.includes("vision") ? "supported" : "unsupported") : "unknown"
      modelInfo[id] = { id, name: id, contextWindow: positiveInteger(contextWindow), capabilities: imageSupport === "supported" ? ["images"] : [], imageSupport }
    } catch { modelInfo[id] = { id, name: id, imageSupport: "unknown" } }
  }))
  return { models, modelInfo }
}

async function discoverOpenAiCompatible(baseUrl: string, timeoutMs?: number): Promise<Pick<ModelDiscovery, "models" | "modelInfo">> {
  const body = await getJson(`${ensureV1(baseUrl)}/models`, timeoutMs)
  if (!isRecord(body) || !Array.isArray(body.data)) return { models: [], modelInfo: {} }
  const models = unique(body.data.flatMap((model) => isRecord(model) && typeof model.id === "string" ? [model.id] : []))
  const modelInfo: Record<string, ModelInfo> = Object.fromEntries(models.map((id) => [id, { id, name: id, imageSupport: "unknown" }]))
  try {
    const props = await getJson(`${baseUrl}/props`, timeoutMs)
    if (isRecord(props)) {
      const contextWindow = positiveInteger(props.n_ctx) ?? (isRecord(props.default_generation_settings) ? positiveInteger(props.default_generation_settings.n_ctx) : undefined)
      if (contextWindow && models[0]) modelInfo[models[0]] = { ...modelInfo[models[0]], id: models[0], name: modelInfo[models[0]]?.name ?? models[0], contextWindow }
    }
  } catch { /* `/props` is llama.cpp-specific and optional. */ }
  return { models, modelInfo }
}

async function getJson(url: string, timeoutMs?: number): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs ?? 8_000) })
  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`Model request failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`)
  }
  return await response.json()
}

async function postJson(url: string, body: unknown, timeoutMs?: number): Promise<unknown> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs ?? 8_000) })
  if (!response.ok) throw new Error(`Model detail request failed (${response.status})`)
  return await response.json()
}

function normalizeBaseUrl(value: string): string {
  let url: URL
  try { url = new URL(value.trim()) }
  catch { throw new Error("Enter a valid http:// or https:// URL") }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only http:// and https:// URLs are supported")
  url.pathname = url.pathname.replace(/\/(?:v1|api\/v1)\/?$/, "") || "/"
  url.search = ""
  url.hash = ""
  return url.toString().replace(/\/$/, "")
}

function ensureV1(baseUrl: string): string { return `${normalizeBaseUrl(baseUrl)}/v1` }
function cleanOptional(value?: string): string | undefined { const clean = value?.trim(); return clean ? clean : undefined }
function unique(values: string[]): string[] { return [...new Set(values)].sort((a, b) => a.localeCompare(b)) }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null }
function positiveInteger(value: unknown): number | undefined { return Number.isInteger(value) && Number(value) > 0 ? Number(value) : undefined }

export function parseOptionalTimeout(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined
  const timeoutMs = Number(value)
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 3_600_000) throw new Error("Timeout must be between 1 and 3,600 seconds")
  return timeoutMs
}

function parseOptionalBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined) return fallback
  if (typeof value !== "boolean") throw new Error("Image input setting must be a boolean")
  return value
}

function normalizeCatalogModelInfo(id: string, value: unknown): ModelInfo {
  const info = isRecord(value) ? value : {}
  const capabilities = Array.isArray(info.capabilities) ? info.capabilities.filter((item): item is string => typeof item === "string") : undefined
  return {
    ...info,
    id,
    capabilities,
    imageSupport: capabilities ? (capabilities.includes("images") ? "supported" : "unsupported") : "unknown",
  }
}

function parseProvider(value: unknown): ProviderKind {
  if (value === "lmstudio" || value === "llamacpp" || value === "ollama" || value === "codex" || value === "claude-code") return value
  throw new Error("Unsupported provider")
}
