import assert from "node:assert/strict"
import { containsSudoCommand, createSshTools } from "../src/ssh-workspace.js"
import type { ResolvedSshWorkspaceProfile } from "../src/profile-store.js"

assert.equal(containsSudoCommand("sudo apt update"), true)
assert.equal(containsSudoCommand("cd /tmp && /usr/bin/sudo rm -f file"), true)
assert.equal(containsSudoCommand("printf sudoers"), false)

const base: ResolvedSshWorkspaceProfile = {
  id: "workspace-test",
  name: "Test Linux",
  type: "ssh",
  host: "192.0.2.10",
  port: 22,
  username: "developer",
  remoteDirectory: "/srv/project",
  operatingSystem: "linux",
  authType: "password",
  hasPassword: true,
  hasPassphrase: false,
  sudoPermission: "ask",
  hasSudoPassword: true,
  password: "ssh-secret",
  sudoPassword: "sudo-secret",
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
}

assert.equal(createSshTools(base).some((tool) => tool.name === "ssh_run_sudo_commands"), true)
assert.equal(createSshTools({ ...base, sudoPermission: "disabled" }).some((tool) => tool.name === "ssh_run_sudo_commands"), false)
assert.equal(createSshTools({ ...base, operatingSystem: "macos" }).some((tool) => tool.name === "ssh_run_sudo_commands"), false)
console.log("ssh workspace tests passed")
