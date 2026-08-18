import { toBcp47, type Locale } from "./i18n.js"

export function providerDisplayName(provider: string | undefined): string {
  return ({
    codex: "Codex",
    "openai-codex": "Codex",
    "claude-code": "Claude Code",
    lmstudio: "LM Studio",
    llamacpp: "llama.cpp",
    ollama: "Ollama",
    "openai-compatible": "OpenAI Compatible",
  } as Record<string, string>)[provider ?? ""] ?? provider ?? "—"
}

export function shortModelName(model: string | undefined): string {
  const parts = String(model ?? "").split(/[\\/]/).filter(Boolean)
  return parts.at(-1) ?? "—"
}

export function formatTokens(value: number | null | undefined, locale: Locale): string {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat(toBcp47(locale)).format(value)
}
