import assert from "node:assert/strict"
import { ARCHIVED_TAG, AUTO_TAG, isReservedTag, mergeUserTags, parseUserTags, sessionTags, withReservedTag } from "../src/tags.js"

// --- parseUserTags: normalization, dedupe, limits, reserved-prefix guard ---
assert.deepEqual(parseUserTags(undefined), [])
assert.deepEqual(parseUserTags(["AI News", "ai news", " daily "]), ["ai-news", "daily"])
assert.throws(() => parseUserTags("not-an-array"), /must be an array/)
assert.throws(() => parseUserTags([123]), /must be text/)
assert.throws(() => parseUserTags(["a".repeat(41)]), /too long/)
assert.throws(() => parseUserTags([ARCHIVED_TAG]), /reserved prefix/)
assert.throws(() => parseUserTags(Array(21).fill("x")), /no more than 20/)

// --- reserved-tag helpers ---
assert.equal(isReservedTag(ARCHIVED_TAG), true)
assert.equal(isReservedTag(AUTO_TAG), true)
assert.equal(isReservedTag("daily"), false)

// --- sessionTags reads metadata.tags defensively ---
assert.deepEqual(sessionTags(undefined), [])
assert.deepEqual(sessionTags({ tags: ["a", 1, "b"] }), ["a", "b"])

// --- mergeUserTags preserves existing reserved tags on a PATCH ---
assert.deepEqual(mergeUserTags([ARCHIVED_TAG, "old"], ["new"]), [ARCHIVED_TAG, "new"])
assert.deepEqual(mergeUserTags([], ["a", "b"]), ["a", "b"])

// --- withReservedTag toggles a single reserved tag idempotently ---
assert.deepEqual(withReservedTag([], ARCHIVED_TAG, true), [ARCHIVED_TAG])
assert.deepEqual(withReservedTag([ARCHIVED_TAG, "x"], ARCHIVED_TAG, false), ["x"])
assert.deepEqual(withReservedTag([ARCHIVED_TAG], ARCHIVED_TAG, true), [ARCHIVED_TAG])

console.log("tags tests passed")
