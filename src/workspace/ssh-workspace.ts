import { createHash, timingSafeEqual } from "node:crypto"
import { readFile } from "node:fs/promises"
import { posix } from "node:path"
import { Client, type ConnectConfig, type SFTPWrapper } from "ssh2"
import { createTool } from "@cline/sdk"
import type { ResolvedSshWorkspaceProfile } from "../stores/profile-store.js"
import { workspaceViolation } from "./workspace-security.js"

const MAX_OUTPUT = 96 * 1024
const MAX_FILE = 2 * 1024 * 1024

export async function testSshWorkspace(profile: ResolvedSshWorkspaceProfile): Promise<{ ok: true; directory: string; system: string; operatingSystem: string }> {
  return await withClient(profile, undefined, async (client) => {
    const result = await execCommand(client, `cd -- ${shellQuote(profile.remoteDirectory)} && printf '%s\\n' "$PWD" && uname -s`, undefined)
    if (result.code !== 0) throw new Error(result.stderr || `SSH test failed with exit code ${result.code}`)
    const [directory = profile.remoteDirectory, system = "Linux"] = result.stdout.trim().split(/\r?\n/)
    if (!matchesOperatingSystem(profile.operatingSystem, system)) {
      throw new Error(`Configured OS is ${profile.operatingSystem}, but SSH reported ${system}`)
    }
    return { ok: true, directory, system, operatingSystem: profile.operatingSystem }
  })
}

export function createSshTools(profile: ResolvedSshWorkspaceProfile) {
  const runCommands = createTool({
    name: "ssh_run_commands",
    description: `Run shell commands on ${profile.username}@${profile.host} inside ${profile.remoteDirectory}. Each command starts in that directory. Use this instead of local run_commands.`,
    inputSchema: {
      type: "object",
      properties: { commands: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 20 } },
      required: ["commands"],
    },
    async execute(input: { commands: string[] }, context: { signal: AbortSignal }) {
      try {
        const boundaryError = workspaceViolation("ssh_run_commands", input, profile.remoteDirectory, "posix")
        if (boundaryError) return { error: boundaryError, host: profile.host, directory: profile.remoteDirectory }
        return await withClient(profile, context.signal, async (client) => {
          const results = []
          for (const command of input.commands) {
            if (containsSudoCommand(command)) {
              results.push({ command, stderr: "sudo is blocked in ssh_run_commands; use ssh_run_sudo_commands so its separate approval policy is enforced", stdout: "", code: 126 })
              continue
            }
            const result = await execCommand(client, `cd -- ${shellQuote(profile.remoteDirectory)} && ${command}`, context.signal)
            results.push({ command, ...result })
          }
          return { host: profile.host, directory: profile.remoteDirectory, results }
        })
      } catch (error: unknown) { return { error: errorMessage(error), host: profile.host } }
    },
  })

  const readFiles = createTool({
    name: "ssh_read_files",
    description: `Read UTF-8 files from the remote SSH workspace ${profile.remoteDirectory}. Paths must stay inside the workspace.`,
    inputSchema: {
      type: "object",
      properties: { paths: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 20 } },
      required: ["paths"],
    },
    async execute(input: { paths: string[] }, context: { signal: AbortSignal }) {
      try {
        return await withClient(profile, context.signal, async (client) => {
          const sftp = await getSftp(client)
          const files = []
          for (const requested of input.paths) {
            const path = remotePath(profile.remoteDirectory, requested)
            try {
              const stat = await sftpStat(sftp, path)
              if (stat.size > MAX_FILE) { files.push({ path: requested, error: `File exceeds ${MAX_FILE} bytes` }); continue }
              const content = await sftpReadFile(sftp, path)
              files.push({ path: requested, content: content.toString("utf8") })
            } catch (error: unknown) { files.push({ path: requested, error: errorMessage(error) }) }
          }
          sftp.end()
          return { host: profile.host, directory: profile.remoteDirectory, files }
        })
      } catch (error: unknown) { return { error: errorMessage(error), host: profile.host } }
    },
  })

  const writeFile = createTool({
    name: "ssh_write_file",
    description: `Create or replace one UTF-8 file in the remote SSH workspace ${profile.remoteDirectory}. Parent directories are created automatically.`,
    inputSchema: {
      type: "object",
      properties: { path: { type: "string" }, content: { type: "string", maxLength: MAX_FILE } },
      required: ["path", "content"],
    },
    async execute(input: { path: string; content: string }, context: { signal: AbortSignal }) {
      try {
        const path = remotePath(profile.remoteDirectory, input.path)
        return await withClient(profile, context.signal, async (client) => {
          const mkdir = await execCommand(client, `mkdir -p -- ${shellQuote(posix.dirname(path))}`, context.signal)
          if (mkdir.code !== 0) return { error: mkdir.stderr || "Could not create parent directory", path: input.path }
          const sftp = await getSftp(client)
          await sftpWriteFile(sftp, path, Buffer.from(input.content, "utf8"))
          sftp.end()
          return { ok: true, path: input.path, bytes: Buffer.byteLength(input.content), host: profile.host }
        })
      } catch (error: unknown) { return { error: errorMessage(error), path: input.path, host: profile.host } }
    },
  })

  const searchFiles = createTool({
    name: "ssh_search_files",
    description: `Search text recursively in the remote SSH workspace ${profile.remoteDirectory}. Uses rg when available and grep otherwise.`,
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        path: { type: "string", description: "Optional directory below the workspace" },
        maxResults: { type: "integer", minimum: 1, maximum: 500 },
      },
      required: ["query"],
    },
    async execute(input: { query: string; path?: string; maxResults?: number }, context: { signal: AbortSignal }) {
      try {
        const target = remotePath(profile.remoteDirectory, input.path ?? ".")
        const max = Number.isInteger(input.maxResults) ? Math.min(500, Math.max(1, input.maxResults!)) : 100
        const query = shellQuote(input.query)
        const command = `if command -v rg >/dev/null 2>&1; then rg -n --no-heading --color never -m ${max} -- ${query} ${shellQuote(target)}; else grep -RIn -m ${max} -- ${query} ${shellQuote(target)}; fi`
        return await withClient(profile, context.signal, async (client) => {
          const result = await execCommand(client, command, context.signal)
          return { host: profile.host, directory: profile.remoteDirectory, matches: result.stdout, stderr: result.stderr, code: result.code }
        })
      } catch (error: unknown) { return { error: errorMessage(error), host: profile.host } }
    },
  })

  const sudoCommands = createTool({
    name: "ssh_run_sudo_commands",
    description: `Run commands with sudo on the remote Linux host ${profile.username}@${profile.host}. This is a privileged operation with a separate approval policy. Pass commands without the sudo prefix.`,
    inputSchema: {
      type: "object",
      properties: { commands: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 20 } },
      required: ["commands"],
    },
    async execute(input: { commands: string[] }, context: { signal: AbortSignal }) {
      try {
        const boundaryError = workspaceViolation("ssh_run_sudo_commands", input, profile.remoteDirectory, "posix")
        if (boundaryError) return { error: boundaryError, host: profile.host, directory: profile.remoteDirectory, privileged: true }
        return await withClient(profile, context.signal, async (client) => {
          const results = []
          for (const command of input.commands) {
            const sudo = profile.sudoPassword
              ? `sudo -S -p '' -- sh -lc ${shellQuote(command)}`
              : `sudo -n -- sh -lc ${shellQuote(command)}`
            const result = await execCommand(client, `cd -- ${shellQuote(profile.remoteDirectory)} && ${sudo}`, context.signal, profile.sudoPassword ? `${profile.sudoPassword}\n` : undefined)
            results.push({ command, ...result })
          }
          return { host: profile.host, directory: profile.remoteDirectory, privileged: true, results }
        })
      } catch (error: unknown) { return { error: errorMessage(error), host: profile.host, privileged: true } }
    },
  })

  return profile.operatingSystem === "linux" && profile.sudoPermission !== "disabled"
    ? [runCommands, readFiles, writeFile, searchFiles, sudoCommands]
    : [runCommands, readFiles, writeFile, searchFiles]
}

async function connectConfig(profile: ResolvedSshWorkspaceProfile): Promise<ConnectConfig> {
  const config: ConnectConfig = {
    host: profile.host,
    port: profile.port,
    username: profile.username,
    readyTimeout: 15_000,
    keepaliveInterval: 10_000,
    keepaliveCountMax: 3,
  }
  if (profile.authType === "password") config.password = profile.password
  else {
    if (!profile.keyPath) throw new Error("SSH private key path is missing")
    config.privateKey = await readFile(profile.keyPath)
    config.passphrase = profile.passphrase
  }
  if (profile.hostFingerprint) {
    const expected = normalizeFingerprint(profile.hostFingerprint)
    config.hostVerifier = (key: Buffer) => {
      const actual = createHash("sha256").update(key).digest("base64").replace(/=+$/, "")
      return safeEqual(actual, expected)
    }
  }
  return config
}

async function withClient<T>(profile: ResolvedSshWorkspaceProfile, signal: AbortSignal | undefined, action: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client()
  const abort = () => client.end()
  signal?.addEventListener("abort", abort, { once: true })
  try {
    await new Promise<void>(async (resolve, reject) => {
      client.once("ready", resolve).once("error", reject)
      try { client.connect(await connectConfig(profile)) } catch (error) { reject(error) }
    })
    if (signal?.aborted) throw new Error("SSH operation was aborted")
    return await action(client)
  } finally {
    signal?.removeEventListener("abort", abort)
    client.end()
  }
}

async function execCommand(client: Client, command: string, signal: AbortSignal | undefined, stdin?: string): Promise<{ stdout: string; stderr: string; code: number | null; signal?: string }> {
  return await new Promise((resolve, reject) => {
    client.exec(command, (error, channel) => {
      if (error) { reject(error); return }
      let stdout: Buffer<ArrayBufferLike> = Buffer.alloc(0)
      let stderr: Buffer<ArrayBufferLike> = Buffer.alloc(0)
      const append = (current: Buffer<ArrayBufferLike>, chunk: Buffer<ArrayBufferLike>) => current.length >= MAX_OUTPUT ? current : Buffer.concat([current, chunk]).subarray(0, MAX_OUTPUT)
      channel.on("data", (chunk: Buffer) => { stdout = append(stdout, Buffer.from(chunk)) })
      channel.stderr.on("data", (chunk: Buffer) => { stderr = append(stderr, Buffer.from(chunk)) })
      const abort = () => channel.close()
      signal?.addEventListener("abort", abort, { once: true })
      channel.once("error", reject)
      channel.once("close", (code: number | null, closeSignal?: string) => {
        signal?.removeEventListener("abort", abort)
        resolve({ stdout: stdout.toString("utf8"), stderr: stderr.toString("utf8"), code, signal: closeSignal })
      })
      if (stdin !== undefined) channel.end(stdin)
    })
  })
}

async function getSftp(client: Client): Promise<SFTPWrapper> {
  return await new Promise((resolve, reject) => client.sftp((error, sftp) => error ? reject(error) : resolve(sftp)))
}

async function sftpStat(sftp: SFTPWrapper, path: string): Promise<{ size: number }> {
  return await new Promise((resolve, reject) => sftp.stat(path, (error, stats) => error ? reject(error) : resolve({ size: stats.size })))
}

async function sftpReadFile(sftp: SFTPWrapper, path: string): Promise<Buffer> {
  return await new Promise((resolve, reject) => sftp.readFile(path, (error, data) => error ? reject(error) : resolve(Buffer.from(data))))
}

async function sftpWriteFile(sftp: SFTPWrapper, path: string, data: Buffer): Promise<void> {
  await new Promise<void>((resolve, reject) => sftp.writeFile(path, data, { mode: 0o600 }, (error) => error ? reject(error) : resolve()))
}

function remotePath(root: string, requested: string): string {
  const target = posix.resolve(root, requested)
  const normalizedRoot = posix.resolve(root)
  if (target !== normalizedRoot && !target.startsWith(`${normalizedRoot}/`)) throw new Error("Remote path must stay inside the workspace directory")
  return target
}

function shellQuote(value: string): string { return `'${value.replaceAll("'", `'"'"'`)}'` }
export function containsSudoCommand(command: string): boolean {
  const normalized = command.replace(/[\\'"`]/g, "")
  return /(^|[\s;&|()])(?:\/usr\/bin\/|\/bin\/)?sudo(?=\s|$)/i.test(normalized)
}
function matchesOperatingSystem(expected: ResolvedSshWorkspaceProfile["operatingSystem"], uname: string): boolean {
  const normalized = uname.trim().toLowerCase()
  if (expected === "linux") return normalized === "linux"
  if (expected === "macos") return normalized === "darwin"
  return normalized.length > 0 && normalized !== "windows_nt"
}
function normalizeFingerprint(value: string): string { return value.trim().replace(/^SHA256:/i, "").replace(/=+$/, "") }
function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}
function errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error) }
