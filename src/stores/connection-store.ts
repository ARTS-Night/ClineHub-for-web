import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import type { ConnectionSettings, ModelInfo, ProviderKind } from "../providers.js"

type StoredConnection = {
  version: 1
  provider: Exclude<ProviderKind, "codex">
  providerId: ConnectionSettings["providerId"]
  baseUrl: string
  modelId: string
  modelInfo?: Pick<ModelInfo, "id" | "name" | "contextWindow" | "maxInputTokens" | "capabilities" | "imageSupport">
  timeoutMs?: number
  imagesEnabled?: boolean
}

const providerIds: Record<Exclude<ProviderKind, "codex">, ConnectionSettings["providerId"]> = {
  lmstudio: "lmstudio",
  llamacpp: "openai-compatible",
  ollama: "ollama",
  "claude-code": "claude-code",
}

export class ConnectionStore {
  constructor(private readonly filePath: string) {}

  async save(settings: ConnectionSettings): Promise<void> {
    if (settings.provider === "codex") {
      await this.clear()
      return
    }
    const modelInfo = settings.modelInfo ? {
      id: settings.modelInfo.id,
      name: settings.modelInfo.name,
      contextWindow: settings.modelInfo.contextWindow,
      maxInputTokens: settings.modelInfo.maxInputTokens,
      capabilities: settings.modelInfo.capabilities,
      imageSupport: settings.modelInfo.imageSupport,
    } : undefined
    const stored: StoredConnection = {
      version: 1,
      provider: settings.provider,
      providerId: settings.providerId,
      baseUrl: settings.baseUrl,
      modelId: settings.modelId,
      modelInfo,
      timeoutMs: settings.timeoutMs,
      imagesEnabled: settings.imagesEnabled,
    }
    await mkdir(dirname(this.filePath), { recursive: true })
    await writeFile(this.filePath, `${JSON.stringify(stored, null, 2)}\n`, { encoding: "utf8", mode: 0o600 })
  }

  async load(): Promise<ConnectionSettings | undefined> {
    let value: unknown
    try { value = JSON.parse(await readFile(this.filePath, "utf8")) }
    catch (error: unknown) {
      if (isNodeError(error) && error.code === "ENOENT") return undefined
      throw error
    }
    if (!isRecord(value) || value.version !== 1) throw new Error("Unsupported saved connection format")
    const provider = parseProvider(value.provider)
    if (providerIds[provider] !== value.providerId) throw new Error("Saved provider configuration is invalid")
    if (typeof value.baseUrl !== "string" || typeof value.modelId !== "string" || !value.modelId) throw new Error("Saved connection is incomplete")
    return {
      provider,
      providerId: providerIds[provider],
      baseUrl: value.baseUrl,
      modelId: value.modelId,
      apiKey: provider === "claude-code" ? undefined : "local-model",
      modelInfo: parseModelInfo(value.modelInfo, value.modelId),
      timeoutMs: optionalPositiveInteger(value.timeoutMs),
      imagesEnabled: value.imagesEnabled === true,
    }
  }

  async clear(): Promise<void> {
    await rm(this.filePath, { force: true })
  }
}

function parseProvider(value: unknown): Exclude<ProviderKind, "codex"> {
  if (value === "lmstudio" || value === "llamacpp" || value === "ollama" || value === "claude-code") return value
  throw new Error("Saved provider is not supported")
}

function parseModelInfo(value: unknown, modelId: string): ModelInfo | undefined {
  if (!isRecord(value)) return undefined
  return {
    id: typeof value.id === "string" ? value.id : modelId,
    name: typeof value.name === "string" ? value.name : undefined,
    contextWindow: positiveInteger(value.contextWindow),
    maxInputTokens: positiveInteger(value.maxInputTokens),
    capabilities: Array.isArray(value.capabilities) ? value.capabilities.filter((item): item is string => typeof item === "string") : undefined,
    imageSupport: value.imageSupport === "supported" || value.imageSupport === "unsupported" || value.imageSupport === "unknown" ? value.imageSupport : undefined,
  }
}

function positiveInteger(value: unknown): number | undefined {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : undefined
}

function optionalPositiveInteger(value: unknown): number | undefined {
  return value === undefined ? undefined : positiveInteger(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && "code" in value
}
