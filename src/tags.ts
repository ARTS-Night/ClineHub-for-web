// Session Tags (design review C9, C12): a session's tags live entirely inside
// its own metadata.tags array — no Folder concept, no separate tag store.
// Archive is implemented as a reserved tag rather than a new session status
// (C9), and Auto Chat-origin sessions get a reserved marker tag (see
// runtime.ts) — both live in the same "clinehub:" namespace so ordinary user
// tags can never collide with them.
export const ARCHIVED_TAG = "clinehub:archived"
export const AUTO_TAG = "clinehub:auto"
const RESERVED_PREFIX = "clinehub:"
const MAX_TAGS = 20
const MAX_TAG_LENGTH = 40

export function isReservedTag(tag: string): boolean {
  return tag.startsWith(RESERVED_PREFIX)
}

function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "-")
}

/** Validates and normalizes a user-supplied tag list, rejecting the
 * "clinehub:" reserved namespace — callers that need to set a reserved tag
 * (archive, auto-chat origin) do so directly on the metadata array instead
 * of through this validator. */
export function parseUserTags(value: unknown): string[] {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw new Error("Tags must be an array")
  if (value.length > MAX_TAGS) throw new Error(`Configure no more than ${MAX_TAGS} tags`)
  const seen = new Set<string>()
  const tags: string[] = []
  for (const raw of value) {
    if (typeof raw !== "string") throw new Error("Each tag must be text")
    const tag = normalizeTag(raw)
    if (!tag) continue
    if (tag.length > MAX_TAG_LENGTH) throw new Error(`Tag "${raw}" is too long`)
    if (isReservedTag(tag)) throw new Error(`Tag "${raw}" uses a reserved prefix`)
    if (seen.has(tag)) continue
    seen.add(tag)
    tags.push(tag)
  }
  return tags
}

export function sessionTags(metadata: Record<string, unknown> | undefined): string[] {
  const tags = metadata?.tags
  return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === "string") : []
}

/** Replaces the user-visible tag set on a session while preserving whatever
 * reserved ("clinehub:"-prefixed) tags are already there — a tag PATCH from
 * the UI must never accidentally strip the archive or auto-chat marker. */
export function mergeUserTags(current: string[], userTags: string[]): string[] {
  const reserved = current.filter(isReservedTag)
  return [...reserved, ...userTags]
}

export function withReservedTag(current: string[], tag: string, present: boolean): string[] {
  const withoutTag = current.filter((item) => item !== tag)
  return present ? [...withoutTag, tag] : withoutTag
}
