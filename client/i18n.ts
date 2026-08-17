// Translations live outside the bundle, in ./setting/language/<code>.json, so
// anyone can edit the wording or drop in a new language file (e.g. zh.json)
// without touching the code. See src/server.ts for how that directory is served.
export type Locale = string
export type Dictionary = Record<string, string>
export type LocaleOption = { code: Locale; label: string }

const dictionaryCache = new Map<Locale, Dictionary>()

async function fetchDictionary(locale: Locale): Promise<Dictionary> {
  const cached = dictionaryCache.get(locale)
  if (cached) return cached
  const response = await fetch(`/setting/language/${encodeURIComponent(locale)}.json`)
  if (!response.ok) throw new Error(`Language file not found: ${locale}`)
  const dictionary = await response.json() as Dictionary
  dictionaryCache.set(locale, dictionary)
  return dictionary
}

/** Loads a locale's dictionary, falling back to English if the file is missing or invalid. */
export async function loadDictionary(locale: Locale): Promise<Dictionary> {
  try { return await fetchDictionary(locale) } catch {
    if (locale === "en") return {}
    try { return await fetchDictionary("en") } catch { return {} }
  }
}

/** Discovers every language file the server can see, for the language picker. */
export async function listLocales(): Promise<LocaleOption[]> {
  const response = await fetch("/api/languages")
  if (!response.ok) return [{ code: "en", label: "English" }]
  const { locales } = await response.json() as { locales: string[] }
  const options = await Promise.all(locales.map(async (code): Promise<LocaleOption> => {
    try { const dictionary = await fetchDictionary(code); return { code, label: dictionary._label ?? code } }
    catch { return { code, label: code } }
  }))
  return options.sort((a, b) => a.code === "en" ? -1 : b.code === "en" ? 1 : a.label.localeCompare(b.label))
}

export function translate(dictionary: Dictionary, fallback: Dictionary, key: string, vars: Record<string, unknown> = {}): string {
  let value = dictionary[key] ?? fallback[key] ?? key
  for (const [name, replacement] of Object.entries(vars)) value = value.replaceAll(`{${name}}`, String(replacement))
  return value
}

export type TFunction = (key: string, vars?: Record<string, unknown>) => string

export function detectInitialLocale(): Locale {
  return localStorage.getItem("cline-language") ?? (navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en")
}

/** Best-effort BCP-47 tag for Intl.* formatting; unknown codes pass through as-is. */
export function toBcp47(locale: Locale): string {
  return locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : locale
}
