// Mirrors src/tags.ts's reserved-tag constants for client-side display only
// (kept as a small standalone copy rather than importing the server module,
// since this file only needs the two string constants, not its Node-side
// validation logic).
export const ARCHIVED_TAG = "clinehub:archived"
export const AUTO_TAG = "clinehub:auto"

export function isReservedTag(tag: string): boolean {
  return tag.startsWith("clinehub:")
}

export function userTags(tags: string[] | undefined): string[] {
  return (tags ?? []).filter((tag) => !isReservedTag(tag))
}
