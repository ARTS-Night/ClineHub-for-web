import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

export type CompactionRecord = {
  at: string
  message: string
}

type CompactionDocument = {
  version: 1
  sessions: Record<string, CompactionRecord[]>
}

export class CompactionStore {
  private document: CompactionDocument = { version: 1, sessions: {} }

  constructor(private readonly filePath: string) {}

  async load(): Promise<void> {
    try {
      const value: unknown = JSON.parse(await readFile(this.filePath, "utf8"))
      if (!isRecord(value) || value.version !== 1 || !isRecord(value.sessions)) throw new Error("Unsupported compaction history format")
      this.document = value as CompactionDocument
    } catch (error: unknown) {
      if (!isNodeError(error) || error.code !== "ENOENT") throw error
    }
  }

  list(sessionId: string): CompactionRecord[] {
    return (this.document.sessions[sessionId] ?? []).map((record) => ({ ...record }))
  }

  async record(sessionId: string, message: string): Promise<CompactionRecord> {
    const record = { at: new Date().toISOString(), message }
    this.document.sessions[sessionId] = [...(this.document.sessions[sessionId] ?? []), record].slice(-100)
    await this.persist()
    return { ...record }
  }

  async delete(sessionId: string): Promise<void> {
    if (!(sessionId in this.document.sessions)) return
    delete this.document.sessions[sessionId]
    await this.persist()
  }

  async move(fromSessionId: string, toSessionId: string): Promise<void> {
    const records = this.document.sessions[fromSessionId]
    if (!records) return
    this.document.sessions[toSessionId] = records
    delete this.document.sessions[fromSessionId]
    await this.persist()
  }

  async copy(fromSessionId: string, toSessionId: string): Promise<void> {
    const records = this.document.sessions[fromSessionId]
    if (!records) return
    this.document.sessions[toSessionId] = records.map((record) => ({ ...record }))
    await this.persist()
  }

  private async persist(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true })
    await writeFile(this.filePath, `${JSON.stringify(this.document, null, 2)}\n`, { encoding: "utf8", mode: 0o600 })
  }
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value) }
function isNodeError(value: unknown): value is NodeJS.ErrnoException { return value instanceof Error && "code" in value }
