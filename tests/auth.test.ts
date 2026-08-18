import assert from "node:assert/strict"

// This suite runs in its own process (see scripts/run-tests.mjs), so mutating
// process.env here can't leak into other suites.
delete process.env.CLINEHUB_USER
delete process.env.CLINEHUB_PASSWORD
const { authRequired, createSession, destroySession, isValidSession, verifyCredentials } = await import("../src/auth.js")

assert.equal(authRequired(), false, "neither env var set -> no login required, matching the pre-login-feature default")

process.env.CLINEHUB_USER = "alice"
assert.equal(authRequired(), false, "only one of the two env vars set -> still not required")

process.env.CLINEHUB_PASSWORD = "hunter2"
assert.equal(authRequired(), true, "both env vars set -> login required")

assert.equal(verifyCredentials("alice", "hunter2"), true)
assert.equal(verifyCredentials("alice", "wrong"), false)
assert.equal(verifyCredentials("bob", "hunter2"), false)
assert.equal(verifyCredentials("", ""), false, "empty credentials never match a configured user/password")

assert.equal(isValidSession(undefined), false)
assert.equal(isValidSession("not-a-real-token"), false)
const token = createSession()
assert.equal(isValidSession(token), true)
destroySession(token)
assert.equal(isValidSession(token), false, "destroyed session is no longer valid")

console.log("auth tests passed")
