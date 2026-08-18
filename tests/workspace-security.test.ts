import assert from "node:assert/strict"
import { buildWorkspaceSystemPrompt, renderSystemPromptTemplate, workspaceViolation } from "../src/workspace/workspace-security.js"

const variables = {
  user: "alice",
  workspace: "C:\\work\\demo",
  workspaceName: "Demo",
  workspaceType: "local" as const,
  os: "win32",
  host: "devbox",
  date: "2026-08-17",
}

assert.equal(
  renderSystemPromptTemplate("Hi {user}; root={{workspace}}; keep {unknown}", variables),
  "Hi alice; root=C:\\work\\demo; keep {unknown}",
)
const prompt = buildWorkspaceSystemPrompt("Work for {user} in {workspaceName}.", variables)
assert.match(prompt, /Work for alice in Demo/)
assert.match(prompt, /Mandatory workspace boundary/)
assert.match(prompt, /You may create any files and subdirectories at the workspace root or below it/)

assert.equal(workspaceViolation("editor", { path: "src\\index.ts" }, "C:\\work\\demo", "windows"), undefined)
assert.equal(workspaceViolation("editor", { path: "C:\\work\\demo\\src\\index.ts" }, "C:\\work\\demo", "windows"), undefined)
assert.match(workspaceViolation("editor", { path: "C:\\work\\other.txt" }, "C:\\work\\demo", "windows") ?? "", /outside the workspace/)
assert.match(workspaceViolation("editor", { path: "..\\other.txt" }, "C:\\work\\demo", "windows") ?? "", /outside the workspace/)

assert.equal(workspaceViolation("run_commands", { commands: ["pnpm test", "mkdir src\\generated"] }, "C:\\work\\demo", "windows"), undefined)
assert.match(workspaceViolation("run_commands", { commands: { command: "Set-Content", args: ["C:\\temp\\result.txt", "no"] } }, "C:\\work\\demo", "windows") ?? "", /outside the workspace/)
assert.equal(workspaceViolation("run_commands", { commands: ["Set-Content C:\\work\\demo\\result.txt ok"] }, "C:\\work\\demo", "windows"), undefined)
assert.match(workspaceViolation("run_commands", { commands: ["Set-Content C:\\temp\\result.txt no"] }, "C:\\work\\demo", "windows") ?? "", /outside the workspace/)
assert.match(workspaceViolation("run_commands", { commands: ["cd ..; mkdir escaped"] }, "C:\\work\\demo", "windows") ?? "", /parent-directory traversal/)
assert.match(workspaceViolation("run_commands", { commands: ["mkdir src\\..\\..\\escaped"] }, "C:\\work\\demo", "windows") ?? "", /parent-directory traversal/)
assert.match(workspaceViolation("run_commands", { commands: ["New-Item $HOME\\escaped.txt"] }, "C:\\work\\demo", "windows") ?? "", /home\/profile\/temp/)

assert.equal(workspaceViolation("ssh_run_commands", { commands: ["mkdir -p /srv/project/generated"] }, "/srv/project", "posix"), undefined)
assert.match(workspaceViolation("ssh_run_commands", { commands: ["touch /tmp/escaped"] }, "/srv/project", "posix") ?? "", /outside the workspace/)
assert.match(workspaceViolation("apply_patch", { input: "*** Begin Patch\n*** Add File: ../escaped.txt\n+x\n*** End Patch" }, "/srv/project", "posix") ?? "", /outside the workspace/)
assert.match(workspaceViolation("apply_patch", { input: "*** Begin Patch\n*** Update File: source.txt\n*** Move to: /tmp/escaped.txt\n*** End Patch" }, "/srv/project", "posix") ?? "", /outside the workspace/)

console.log("workspace security tests passed")
