import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { CompactionStore } from "../src/stores/compaction-store.js"

const directory = await mkdtemp(join(tmpdir(), "cline-web-compactions-"))
try {
  const file = join(directory, "compactions.json")
  const store = new CompactionStore(file)
  await store.load()
  const first = await store.record("session-a", "Automatic compaction completed")
  assert.equal(store.list("session-a").length, 1)
  assert.equal(store.list("session-a")[0]?.at, first.at)

  const reloaded = new CompactionStore(file)
  await reloaded.load()
  assert.equal(reloaded.list("session-a")[0]?.message, "Automatic compaction completed")
  await reloaded.move("session-a", "session-b")
  assert.deepEqual(reloaded.list("session-a"), [])
  assert.equal(reloaded.list("session-b").length, 1)
  await reloaded.delete("session-b")
  console.log("compaction store tests passed")
} finally {
  await rm(directory, { recursive: true, force: true })
}
