import { chmod, open, readFile } from "node:fs/promises"
import { resolve } from "node:path"

export type ParsedArgs = { flags: Map<string, string | true>; positional: string[] }

/** Minimal `--flag`, `--flag=value`, and bare-positional parsing — enough for
 *  this CLI's handful of options, no need for a dependency. */
export function parseArgs(argv: string[]): ParsedArgs {
  const flags = new Map<string, string | true>()
  const positional: string[] = []
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=")
      if (eq === -1) flags.set(arg.slice(2), true)
      else flags.set(arg.slice(2, eq), arg.slice(eq + 1))
    } else {
      positional.push(arg)
    }
  }
  return { flags, positional }
}

export function flagString(flags: Map<string, string | true>, name: string): string | undefined {
  const value = flags.get(name)
  return typeof value === "string" ? value : undefined
}

const ENV_KEYS = { user: "CLINEHUB_USER", password: "CLINEHUB_PASSWORD" } as const

async function readEnvLines(envPath: string): Promise<string[]> {
  try { return (await readFile(envPath, "utf8")).split("\n") } catch { return [] }
}

// Node's built-in .env parser (process.loadEnvFile) has no escape mechanism at
// all: a quoted value just runs literally until the next matching quote
// character, full stop — confirmed empirically, e.g. "a\"b" parses back as `a\`,
// silently truncated, not `a"b`. So the only safe way to quote is to pick
// whichever quote character isn't already IN the value. Unquoted values also
// truncate at the first "#" (treated as a comment), so always quote.
function quote(value: string): string {
  if (!value.includes("'")) return `'${value}'`
  if (!value.includes('"')) return `"${value}"`
  throw new Error("Username/password can't contain both ' and \" characters — pick one or the other")
}

function setLine(lines: string[], key: string, value: string): string[] {
  const line = `${key}=${quote(value)}`
  const index = lines.findIndex((entry) => entry.startsWith(`${key}=`))
  if (index === -1) return [...lines, line]
  const next = [...lines]
  next[index] = line
  return next
}

function removeLine(lines: string[], key: string): string[] {
  return lines.filter((entry) => !entry.startsWith(`${key}=`))
}

// .env holds plaintext login credentials, so it's written owner-only (0o600) —
// both on create (mode passed to open()) and on an existing file that may have
// been sitting there with looser permissions from before this mattered.
async function writeLines(envPath: string, lines: string[]): Promise<void> {
  const content = lines.filter((line) => line.trim() !== "")
  const data = content.length ? content.join("\n") + "\n" : ""
  const handle = await open(envPath, "w", 0o600)
  try { await handle.writeFile(data) } finally { await handle.close() }
  // Windows has no POSIX permission bits; chmod there is a no-op, not an error.
  await chmod(envPath, 0o600).catch(() => {})
}

/** Sets CLINEHUB_USER/CLINEHUB_PASSWORD in .env (creating it if missing),
 *  preserving any other lines already there. */
export async function addUser(username: string, password: string, envPath = resolve(process.cwd(), ".env")): Promise<void> {
  let lines = await readEnvLines(envPath)
  lines = setLine(lines, ENV_KEYS.user, username)
  lines = setLine(lines, ENV_KEYS.password, password)
  await writeLines(envPath, lines)
}

/** Removes CLINEHUB_USER/CLINEHUB_PASSWORD from .env, leaving everything else
 *  untouched — the login gate is back off, same as if neither were ever set. */
export async function removeUser(envPath = resolve(process.cwd(), ".env")): Promise<void> {
  let lines = await readEnvLines(envPath)
  lines = removeLine(lines, ENV_KEYS.user)
  lines = removeLine(lines, ENV_KEYS.password)
  await writeLines(envPath, lines)
}
