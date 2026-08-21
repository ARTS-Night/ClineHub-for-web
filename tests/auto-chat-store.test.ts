import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { AutoChatStore, computeNextRunAt, parseSchedule, templateHasAsk } from "../src/stores/auto-chat-store.js"

const directory = await mkdtemp(join(tmpdir(), "cline-web-autochats-"))
try {
  const file = join(directory, "auto-chats.json")
  const store = new AutoChatStore(file)
  await store.load()

  // --- save: required fields, defaults, persistence round-trip ---
  const created = await store.save({
    name: "Morning AI News", workspaceProfileId: "ws-1", modelProfileId: "model-1", templateId: "daily",
    runPrompt: "Summarize today's {{date}} AI news.", tags: ["ai-news", "daily"], schedule: { type: "manual" }, enabled: false,
  })
  assert.equal(created.name, "Morning AI News")
  assert.deepEqual(created.tags, ["ai-news", "daily"])
  assert.equal(created.nextRunAt, undefined) // manual + disabled -> no nextRunAt

  const reloaded = new AutoChatStore(file)
  await reloaded.load()
  assert.equal(reloaded.get(created.id)?.name, "Morning AI News")

  // Editing must not reset run state (C13's 4 fields survive a save()).
  await reloaded.recordRun(created.id, "success", "session-abc", undefined)
  const edited = await reloaded.save({ id: created.id, name: "Morning AI News (edited)" })
  assert.equal(edited.lastRunResult, "success")
  assert.equal(edited.lastRunSessionId, "session-abc")

  // --- schedule validation ---
  assert.throws(() => parseSchedule({ type: "cron", expr: "* * * * *" }), /manual, once, daily, or weekly/)
  assert.throws(() => parseSchedule({ type: "daily", time: "25:00" }), /HH:MM/)
  assert.throws(() => parseSchedule({ type: "weekly", days: [], time: "07:00" }), /at least one day/)
  assert.throws(() => parseSchedule({ type: "weekly", days: [7], time: "07:00" }), /0 \(Sunday\) to 6/)
  assert.deepEqual(parseSchedule({ type: "weekly", days: [1, 1, 3], time: "07:00" }), { type: "weekly", days: [1, 3], time: "07:00" })

  // --- computeNextRunAt: server-local time, C15 ---
  const wed = new Date("2026-08-19T10:00:00") // a Wednesday, local time
  assert.equal(computeNextRunAt({ type: "manual" }, wed), undefined)
  const dailyBefore = computeNextRunAt({ type: "daily", time: "07:00" }, wed)! // time already passed today -> tomorrow
  assert.equal(new Date(dailyBefore).getDate(), wed.getDate() + 1)
  const dailyAfter = computeNextRunAt({ type: "daily", time: "18:00" }, wed)! // time still ahead today -> today
  assert.equal(new Date(dailyAfter).getDate(), wed.getDate())
  const past = new Date(wed.getTime() - 60_000)
  assert.equal(computeNextRunAt({ type: "once", runAt: past.toISOString() }, wed), undefined) // already-past "once" never fires
  const future = new Date(wed.getTime() + 60_000)
  assert.equal(computeNextRunAt({ type: "once", runAt: future.toISOString() }, wed), future.toISOString())
  // weekly: next Friday (day 5) at 07:00 from a Wednesday
  const weekly = computeNextRunAt({ type: "weekly", days: [5], time: "07:00" }, wed)!
  assert.equal(new Date(weekly).getDay(), 5)
  assert.ok(new Date(weekly).getTime() > wed.getTime())

  // --- templateHasAsk (C2/C3 building block) ---
  assert.equal(templateHasAsk({ read_files: "allow", run_commands: "ask" }), true)
  assert.equal(templateHasAsk({ read_files: "allow", run_commands: "disabled" }), false)

  // --- claimDue: due detection, C14 (persist next fire before running), C4 (missed = skip, never catch up) ---
  // save() computes its initial nextRunAt from the real wall clock (new
  // Date()), so schedule times here are chosen relative to right now rather
  // than hardcoded literals, to stay valid regardless of when this runs.
  const scheduler = new AutoChatStore(join(directory, "scheduler.json"))
  await scheduler.load()
  const soon = new Date(Date.now() + 60_000)
  const soonTime = `${String(soon.getHours()).padStart(2, "0")}:${String(soon.getMinutes()).padStart(2, "0")}`
  const due = await scheduler.save({
    name: "Due daily", workspaceProfileId: "ws-1", modelProfileId: "model-1", templateId: "daily",
    runPrompt: "x", schedule: { type: "daily", time: soonTime }, enabled: true,
  })
  // Simulate: the server was down and only just restarted well past the fire time.
  const lateNow = new Date(soon.getTime() + 2 * 60 * 60 * 1000)
  const claimedFirst = await scheduler.claimDue(lateNow)
  assert.deepEqual(claimedFirst, [due.id])
  const afterClaim = scheduler.get(due.id)!
  // Missed slot (07:00) is not caught up — the freshly computed nextRunAt is
  // strictly after `lateNow` (09:00), i.e. tomorrow 07:00, not today 07:00.
  assert.ok(new Date(afterClaim.nextRunAt!).getTime() > lateNow.getTime())
  // Calling claimDue again immediately (simulating a fast re-tick / restart
  // mid-run) must not re-claim the same slot — double-fire prevention.
  const claimedSecond = await scheduler.claimDue(lateNow)
  assert.deepEqual(claimedSecond, [])

  // A "once" schedule is spent after firing — never claimed again.
  const onceStore = new AutoChatStore(join(directory, "once.json"))
  await onceStore.load()
  const onceAt = new Date(Date.now() + 60_000)
  const onceDef = await onceStore.save({
    name: "One-off", workspaceProfileId: "ws-1", modelProfileId: "model-1", templateId: "daily",
    runPrompt: "x", schedule: { type: "once", runAt: onceAt.toISOString() }, enabled: true,
  })
  assert.deepEqual(await onceStore.claimDue(new Date(onceAt.getTime() + 1000)), [onceDef.id])
  assert.equal(onceStore.get(onceDef.id)?.nextRunAt, undefined)
  assert.deepEqual(await onceStore.claimDue(new Date(onceAt.getTime() + 60_000)), [])

  // Disabled Auto Chats never fire.
  const disabledStore = new AutoChatStore(join(directory, "disabled.json"))
  await disabledStore.load()
  await disabledStore.save({
    name: "Off", workspaceProfileId: "ws-1", modelProfileId: "model-1", templateId: "daily",
    runPrompt: "x", schedule: { type: "daily", time: "00:00" }, enabled: false,
  })
  assert.deepEqual(await disabledStore.claimDue(new Date("2099-01-01")), [])

  console.log("auto-chat store tests passed")
} finally {
  await rm(directory, { recursive: true, force: true })
}
