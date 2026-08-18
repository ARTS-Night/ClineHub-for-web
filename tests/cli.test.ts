import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { addUser, flagString, parseArgs, removeUser } from "../src/cli.js"

// --- parseArgs -------------------------------------------------------------

const parsed = parseArgs(["--port=8080", "--ip=0.0.0.0", "--add-user", "alice", "hunter2"])
assert.equal(flagString(parsed.flags, "port"), "8080")
assert.equal(flagString(parsed.flags, "ip"), "0.0.0.0")
assert.equal(parsed.flags.get("add-user"), true, "bare flag with no = has no value")
assert.deepEqual(parsed.positional, ["alice", "hunter2"])
assert.equal(flagString(parsed.flags, "missing"), undefined)

// --- addUser / removeUser ---------------------------------------------------

const dir = await mkdtemp(join(tmpdir(), "clinehub-cli-test-"))
const envPath = join(dir, ".env")

await addUser("alice", "hunter2", envPath)
let content = await readFile(envPath, "utf8")
assert.match(content, /CLINEHUB_USER='alice'/)
assert.match(content, /CLINEHUB_PASSWORD='hunter2'/)

// A second call updates in place rather than duplicating the line.
await addUser("bob", "swordfish", envPath)
content = await readFile(envPath, "utf8")
assert.match(content, /CLINEHUB_USER='bob'/)
assert.match(content, /CLINEHUB_PASSWORD='swordfish'/)
assert.equal(content.match(/CLINEHUB_USER=/g)?.length, 1, "no duplicate lines")

// Unrelated lines already in the file survive untouched.
await writeFile(envPath, `PORT=9999\n${content}`)
await addUser("carol", "plain", envPath)
content = await readFile(envPath, "utf8")
assert.match(content, /PORT=9999/, "pre-existing unrelated var preserved")

// Node's .env parser has no escape mechanism — a value containing a quote
// character must be wrapped in the *other* quote style to round-trip safely.
await addUser("has'quote", 'has"quote', envPath)
content = await readFile(envPath, "utf8")
assert.match(content, /CLINEHUB_USER="has'quote"/)
assert.match(content, /CLINEHUB_PASSWORD='has"quote'/)

// A value with both quote characters can't be represented safely either way —
// must fail loudly instead of silently writing something that mis-parses.
await assert.rejects(() => addUser("both'\"quotes", "x", envPath))

await removeUser(envPath)
content = await readFile(envPath, "utf8")
assert.doesNotMatch(content, /CLINEHUB_USER/)
assert.doesNotMatch(content, /CLINEHUB_PASSWORD/)
assert.match(content, /PORT=9999/, "removeUser only touches the user/password keys")

// removeUser on a file that was never created must not throw.
await rm(dir, { recursive: true, force: true })
const freshDir = await mkdtemp(join(tmpdir(), "clinehub-cli-test-"))
await removeUser(join(freshDir, ".env"))
await rm(freshDir, { recursive: true, force: true })

console.log("cli tests passed")
