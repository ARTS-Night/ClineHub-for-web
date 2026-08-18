import { hostname, userInfo } from "node:os"
import { basename, posix, win32 } from "node:path"

type PathStyle = "windows" | "posix"

export type WorkspacePromptVariables = {
  user: string
  workspace: string
  workspaceName: string
  workspaceType: "local" | "ssh"
  os: string
  host: string
  date?: string
}

const pathFieldNames = new Set([
  "path", "file", "file_path", "filepath", "target", "target_path",
  "source_path", "destination_path", "old_path", "new_path",
])

export function localPromptVariables(workspace: string, workspaceName?: string): WorkspacePromptVariables {
  let user = process.env.USERNAME ?? process.env.USER ?? "user"
  try { user = userInfo().username || user } catch { /* Fall back to the environment. */ }
  return {
    user,
    workspace,
    workspaceName: workspaceName?.trim() || basename(workspace),
    workspaceType: "local",
    os: process.platform,
    host: hostname(),
  }
}

export function renderSystemPromptTemplate(template: string, variables: WorkspacePromptVariables): string {
  const values: Record<string, string> = {
    user: variables.user,
    workspace: variables.workspace,
    workspacePath: variables.workspace,
    workspace_path: variables.workspace,
    workspaceName: variables.workspaceName,
    workspace_name: variables.workspaceName,
    workspaceType: variables.workspaceType,
    workspace_type: variables.workspaceType,
    os: variables.os,
    host: variables.host,
    date: variables.date ?? new Date().toISOString().slice(0, 10),
  }
  return template.replace(/\{\{([A-Za-z][A-Za-z0-9_]*)\}\}|\{([A-Za-z][A-Za-z0-9_]*)\}/g, (match, doubleName: string | undefined, singleName: string | undefined) => {
    const name = doubleName ?? singleName
    return name && Object.hasOwn(values, name) ? values[name]! : match
  })
}

export function buildWorkspaceSystemPrompt(template: string, variables: WorkspacePromptVariables): string {
  const rendered = renderSystemPromptTemplate(template, variables)
  return [
    rendered,
    "",
    "[Mandatory workspace boundary]",
    `Current user: ${variables.user}`,
    `Workspace type: ${variables.workspaceType}`,
    `Workspace root: ${variables.workspace}`,
    "Treat the workspace root as the only writable filesystem boundary.",
    "You may create any files and subdirectories at the workspace root or below it.",
    "Never create, modify, move, rename, or delete files outside the workspace root. Do not escape through '..', symlinks, absolute external paths, home directories, profile directories, or temporary directories.",
    "Every shell command starts in the workspace root. Keep it there; do not cd, pushd, or Set-Location outside it.",
    "Before using a file-editing or command tool, resolve every target path and verify that it is the workspace root or one of its descendants.",
    "If work outside this boundary is genuinely required, stop and ask the user to select that directory as the workspace. Do not work around this restriction.",
    "The host also checks tool inputs and may reject paths that cannot be proven to stay inside the workspace.",
  ].join("\n")
}

export function createWorkspaceGuardHooks(workspaceRoot: string, pathStyle: PathStyle = detectPathStyle(workspaceRoot)) {
  return {
    beforeTool(context: { tool: { name: string }; input: unknown }) {
      const reason = workspaceViolation(context.tool.name, context.input, workspaceRoot, pathStyle)
      return reason ? { skip: true, reason } : undefined
    },
  }
}

export function workspaceViolation(toolName: string, input: unknown, workspaceRoot: string, pathStyle: PathStyle = detectPathStyle(workspaceRoot)): string | undefined {
  if (["run_commands", "ssh_run_commands", "ssh_run_sudo_commands"].includes(toolName)) {
    for (const command of commandStrings(input)) {
      const violation = commandViolation(command, workspaceRoot, pathStyle)
      if (violation) return `Workspace boundary blocked ${toolName}: ${violation}`
    }
    return undefined
  }

  if (toolName === "apply_patch") {
    const patch = isRecord(input)
      ? typeof input.input === "string" ? input.input : typeof input.patch === "string" ? input.patch : ""
      : typeof input === "string" ? input : ""
    for (const path of patchPaths(patch)) {
      const violation = pathViolation(path, workspaceRoot, pathStyle)
      if (violation) return `Workspace boundary blocked apply_patch: ${violation}`
    }
    return undefined
  }

  if (["editor", "ssh_write_file"].includes(toolName)) {
    for (const path of collectPathFields(input)) {
      const violation = pathViolation(path, workspaceRoot, pathStyle)
      if (violation) return `Workspace boundary blocked ${toolName}: ${violation}`
    }
  }
  return undefined
}

function commandViolation(command: string, workspaceRoot: string, pathStyle: PathStyle): string | undefined {
  if (/\0/.test(command)) return "the command contains a null byte"
  if (/(^|[\s"'=])~(?=$|[\\/\s"';&|])|\$(?:\{)?(?:HOME|USERPROFILE|TMP|TEMP)(?:\})?|%\s*(?:USERPROFILE|HOMEPATH|TMP|TEMP)\s*%|\$env:(?:USERPROFILE|HOMEPATH|TMP|TEMP)\b/i.test(command)) {
    return "home/profile/temp aliases are outside or cannot be proven inside the workspace"
  }
  if (/(^|[\\/\s"'=])\.\.(?=$|[\\/\s"';&|])/.test(command)) return "parent-directory traversal ('..') is not allowed"

  for (const path of absolutePathsInCommand(command, pathStyle)) {
    const violation = pathViolation(path, workspaceRoot, pathStyle)
    if (violation) return violation
  }
  return undefined
}

function pathViolation(rawPath: string, workspaceRoot: string, pathStyle: PathStyle): string | undefined {
  const clean = rawPath.trim().replace(/^["']|["',;:)\]}]+$/g, "")
  if (!clean || clean === "/dev/null") return undefined
  if (clean.includes("\0")) return "a path contains a null byte"
  if (/^(?:~|\$(?:\{)?(?:HOME|USERPROFILE|TMP|TEMP)|%\s*(?:USERPROFILE|HOMEPATH|TMP|TEMP)\s*%)/i.test(clean)) {
    return `path cannot be proven inside the workspace: ${rawPath}`
  }

  const api = pathStyle === "windows" ? win32 : posix
  const root = api.resolve(workspaceRoot)
  const target = api.resolve(root, clean)
  const relative = api.relative(root, target)
  if (relative === "" || (!relative.startsWith("..") && !api.isAbsolute(relative))) return undefined
  return `path is outside the workspace (${root}): ${rawPath}`
}

function commandStrings(input: unknown): string[] {
  if (typeof input === "string") return [input]
  if (Array.isArray(input)) return input.flatMap(commandValue)
  if (!isRecord(input)) return []
  const commands = input.commands
  if (Array.isArray(commands)) return commands.flatMap(commandValue)
  if (commands !== undefined) return commandValue(commands)
  return commandValue(input.command ?? input.cmd)
}

function commandValue(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (!isRecord(value) || typeof value.command !== "string") return []
  const args = Array.isArray(value.args) ? value.args.filter((arg): arg is string => typeof arg === "string") : []
  return [`${value.command}${args.length ? ` ${args.join(" ")}` : ""}`]
}

function collectPathFields(value: unknown): string[] {
  if (!isRecord(value)) return []
  const paths: string[] = []
  for (const [key, field] of Object.entries(value)) {
    if (typeof field === "string" && pathFieldNames.has(key.toLowerCase())) paths.push(field)
    else if (Array.isArray(field) && /paths?|files?/i.test(key)) paths.push(...field.filter((item): item is string => typeof item === "string"))
  }
  return paths
}

function patchPaths(patch: string): string[] {
  const paths: string[] = []
  for (const line of patch.split(/\r?\n/)) {
    const match = line.match(/^\*\*\* (?:Add|Update|Delete) File:\s*(.+)$/)
      ?? line.match(/^\*\*\* Move to:\s*(.+)$/)
      ?? line.match(/^(?:---|\+\+\+)\s+(?:[ab]\/)?([^\t]+?)(?:\t.*)?$/)
    if (match?.[1] && match[1] !== "/dev/null") paths.push(match[1].trim())
  }
  return paths
}

function absolutePathsInCommand(command: string, pathStyle: PathStyle): string[] {
  const paths: string[] = [...(command.match(/[A-Za-z]:[\\/][^\s"'`;|<>]*/g) ?? [])]
  paths.push(...(command.match(/\\\\[^\s"'`;|<>]+\\[^\s"'`;|<>]*/g) ?? []))
  if (pathStyle === "posix") {
    for (const match of command.matchAll(/(?:^|[\s"'=])(\/(?!\/)[^\s"'`;|<>]*)/g)) {
      if (match[1] && !["/c", "/d", "/s", "/q"].includes(match[1].toLowerCase())) paths.push(match[1])
    }
  }
  return paths
}

function detectPathStyle(root: string): PathStyle {
  return /^[A-Za-z]:[\\/]|^\\\\/.test(root) ? "windows" : "posix"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
