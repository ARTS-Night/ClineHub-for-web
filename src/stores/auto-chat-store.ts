import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { parseUserTags } from "../tags.js"

export type AutoChatSchedule =
  | { type: "manual" }
  | { type: "once"; runAt: string }
  | { type: "daily"; time: string }
  | { type: "weekly"; days: number[]; time: string }

export type AutoChatRunResult = "success" | "failed" | "skipped"

// Design constraint C13: this is the entire run-state surface. No history
// table, no per-run log — the generated Session itself is the detail view.
export type AutoChatDefinition = {
  id: string
  name: string
  workspaceProfileId: string
  modelProfileId: string
  templateId: string
  mcpServerIds: string[]
  runPrompt: string
  tags: string[]
  schedule: AutoChatSchedule
  enabled: boolean
  nextRunAt?: string
  lastRunAt?: string
  lastRunResult?: AutoChatRunResult
  lastRunSessionId?: string
  lastRunMessage?: string
  createdAt: string
  updatedAt: string
}

export type AutoChatInput = {
  id?: unknown
  name?: unknown
  workspaceProfileId?: unknown
  modelProfileId?: unknown
  templateId?: unknown
  mcpServerIds?: unknown
  runPrompt?: unknown
  tags?: unknown
  schedule?: unknown
  enabled?: unknown
}

type Document = { version: 1; autoChats: AutoChatDefinition[] }

export class AutoChatStore {
  private document: Document = { version: 1, autoChats: [] }

  constructor(private readonly filePath: string) {}

  async load(): Promise<void> {
    try {
      const value: unknown = JSON.parse(await readFile(this.filePath, "utf8"))
      if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.autoChats)) throw new Error("Unsupported Auto Chat storage format")
      this.document = value as Document
    } catch (error: unknown) {
      if (!isNodeError(error) || error.code !== "ENOENT") throw error
    }
  }

  list(): AutoChatDefinition[] {
    return this.document.autoChats.map((item) => ({ ...item, mcpServerIds: [...item.mcpServerIds], tags: [...item.tags] }))
  }

  get(id: string): AutoChatDefinition | undefined {
    const item = this.document.autoChats.find((entry) => entry.id === id)
    return item ? { ...item, mcpServerIds: [...item.mcpServerIds], tags: [...item.tags] } : undefined
  }

  /** Creates or fully replaces (by id) an Auto Chat's own editable fields.
   * Run-state fields (nextRunAt/lastRun*) are only ever touched by
   * recordRun()/claimDue() below, never by this save path — editing an Auto
   * Chat must not reset its run history or its schedule's pending fire. */
  async save(input: AutoChatInput): Promise<AutoChatDefinition> {
    const id = optionalId(input.id) ?? makeId("autochat")
    const current = this.document.autoChats.find((item) => item.id === id)
    const now = new Date().toISOString()
    const schedule = parseSchedule(input.schedule ?? current?.schedule ?? { type: "manual" })
    const enabled = input.enabled !== undefined ? Boolean(input.enabled) : current?.enabled ?? false
    const definition: AutoChatDefinition = {
      id,
      name: requiredString(input.name ?? current?.name, "Auto Chat name", 100),
      workspaceProfileId: requiredString(input.workspaceProfileId ?? current?.workspaceProfileId, "Workspace", 100),
      modelProfileId: requiredString(input.modelProfileId ?? current?.modelProfileId, "Model profile", 100),
      templateId: requiredString(input.templateId ?? current?.templateId, "Template", 100),
      mcpServerIds: parseStringArray(input.mcpServerIds ?? current?.mcpServerIds ?? []),
      runPrompt: requiredString(input.runPrompt ?? current?.runPrompt, "Run prompt", 20_000),
      tags: parseUserTags(input.tags ?? current?.tags ?? []),
      schedule,
      enabled,
      nextRunAt: enabled ? computeNextRunAt(schedule, new Date()) : undefined,
      lastRunAt: current?.lastRunAt,
      lastRunResult: current?.lastRunResult,
      lastRunSessionId: current?.lastRunSessionId,
      lastRunMessage: current?.lastRunMessage,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    }
    this.document.autoChats = [...this.document.autoChats.filter((item) => item.id !== id), definition]
    await this.persist()
    return { ...definition }
  }

  async delete(id: string): Promise<void> {
    this.document.autoChats = this.document.autoChats.filter((item) => item.id !== id)
    await this.persist()
  }

  async recordRun(id: string, result: AutoChatRunResult, sessionId: string | undefined, message: string | undefined): Promise<void> {
    const index = this.document.autoChats.findIndex((item) => item.id === id)
    if (index === -1) return
    const current = this.document.autoChats[index]!
    this.document.autoChats[index] = {
      ...current,
      lastRunAt: new Date().toISOString(),
      lastRunResult: result,
      lastRunSessionId: sessionId ?? current.lastRunSessionId,
      lastRunMessage: message,
      updatedAt: new Date().toISOString(),
    }
    await this.persist()
  }

  /** Scheduler entry point (C14): for every enabled, due Auto Chat, computes
   * and PERSISTS the next fire time before returning — the caller runs the
   * actual Auto Chat afterward. This ordering (persist next-fire, then run)
   * is what keeps a slow run or a mid-run restart from causing the same slot
   * to fire twice. A "once" schedule that has fired is left without a
   * nextRunAt so it never matches again (still visible/editable, just spent). */
  async claimDue(now: Date): Promise<string[]> {
    const due: string[] = []
    let changed = false
    this.document.autoChats = this.document.autoChats.map((item) => {
      if (!item.enabled || !item.nextRunAt || new Date(item.nextRunAt).getTime() > now.getTime()) return item
      due.push(item.id)
      changed = true
      // Missed executions are never caught up (C4): the next occurrence is
      // always computed strictly after `now`, so any slot that passed while
      // the process was down or a previous tick was still running is simply
      // skipped, not queued.
      const nextRunAt = item.schedule.type === "once" ? undefined : computeNextRunAt(item.schedule, now)
      return { ...item, nextRunAt, updatedAt: new Date().toISOString() }
    })
    if (changed) await this.persist()
    return due
  }

  private async persist(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true })
    await writeFile(this.filePath, `${JSON.stringify(this.document, null, 2)}\n`, { encoding: "utf8", mode: 0o600 })
  }
}

/** Server-local time only (C15) — no IANA timezone handling, no per-Auto
 * Chat timezone. `time` is "HH:MM" in whatever timezone this process runs
 * in; the UI is told that timezone via serverTimezone() so it can label the
 * field honestly instead of implying it's configurable. */
export function computeNextRunAt(schedule: AutoChatSchedule, from: Date): string | undefined {
  if (schedule.type === "manual") return undefined
  if (schedule.type === "once") return new Date(schedule.runAt).getTime() > from.getTime() ? schedule.runAt : undefined
  const [hours, minutes] = schedule.time.split(":").map(Number)
  if (schedule.type === "daily") {
    const next = new Date(from)
    next.setHours(hours ?? 0, minutes ?? 0, 0, 0)
    if (next.getTime() <= from.getTime()) next.setDate(next.getDate() + 1)
    return next.toISOString()
  }
  // weekly
  const days = [...schedule.days].sort((a, b) => a - b)
  if (days.length === 0) return undefined
  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(from)
    candidate.setDate(candidate.getDate() + offset)
    candidate.setHours(hours ?? 0, minutes ?? 0, 0, 0)
    if (days.includes(candidate.getDay()) && candidate.getTime() > from.getTime()) return candidate.toISOString()
  }
  return undefined
}

export function parseSchedule(value: unknown): AutoChatSchedule {
  if (!isRecord(value)) throw new Error("Schedule is required")
  if (value.type === "manual") return { type: "manual" }
  if (value.type === "once") return { type: "once", runAt: requiredIso(value.runAt, "Run at") }
  if (value.type === "daily") return { type: "daily", time: requiredTime(value.time) }
  if (value.type === "weekly") {
    if (!Array.isArray(value.days) || value.days.length === 0) throw new Error("Weekly schedule needs at least one day")
    const days = value.days.map((day) => {
      if (!Number.isInteger(day) || Number(day) < 0 || Number(day) > 6) throw new Error("Weekly days must be 0 (Sunday) to 6 (Saturday)")
      return Number(day)
    })
    return { type: "weekly", days: [...new Set(days)], time: requiredTime(value.time) }
  }
  throw new Error("Schedule type must be manual, once, daily, or weekly")
}

/** True if the referenced Template currently allows the tool-approval "Ask"
 * state anywhere — Auto Chat runs unattended, so nothing can be left waiting
 * on a human (C1/C2/C3). Exported so both the save-time guard and the
 * execution-time re-check in runtime.ts share one definition. */
export function templateHasAsk(permissions: Record<string, string>): boolean {
  return Object.values(permissions).includes("ask")
}

function requiredString(value: unknown, label: string, max: number): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is required`)
  if (value.length > max) throw new Error(`${label} is too long`)
  return value.trim()
}

function requiredIso(value: unknown, label: string): string {
  if (typeof value !== "string" || Number.isNaN(new Date(value).getTime())) throw new Error(`${label} must be a valid date/time`)
  return new Date(value).toISOString()
}

function requiredTime(value: unknown): string {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error("Time must be HH:MM (24-hour)")
  return value
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error("Expected an array")
  return [...new Set(value.filter((item): item is string => typeof item === "string"))]
}

function optionalId(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) throw new Error("Invalid Auto Chat id")
  return value
}

function makeId(prefix: string): string { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}` }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null }
function isNodeError(value: unknown): value is NodeJS.ErrnoException { return value instanceof Error && "code" in value }
