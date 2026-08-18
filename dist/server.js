#!/usr/bin/env node

// src/server.ts
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { Hono } from "hono";
import { readdir, realpath as realpath2 } from "fs/promises";
import { networkInterfaces } from "os";
import { dirname as dirname5, resolve as resolve4 } from "path";
import { fileURLToPath } from "url";

// src/auth.ts
import { createHash, randomBytes, timingSafeEqual } from "crypto";
function authRequired() {
  return Boolean(process.env.CLINEHUB_USER) && Boolean(process.env.CLINEHUB_PASSWORD);
}
function safeEqual(a, b) {
  const digest = (value) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}
function verifyCredentials(username, password) {
  const expectedUser = process.env.CLINEHUB_USER ?? "";
  const expectedPassword = process.env.CLINEHUB_PASSWORD ?? "";
  return safeEqual(username, expectedUser) && safeEqual(password, expectedPassword);
}
var sessions = /* @__PURE__ */ new Set();
function createSession() {
  const token = randomBytes(32).toString("hex");
  sessions.add(token);
  return token;
}
function isValidSession(token) {
  return Boolean(token && sessions.has(token));
}
function destroySession(token) {
  if (token) sessions.delete(token);
}

// src/cli.ts
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
function parseArgs(argv) {
  const flags = /* @__PURE__ */ new Map();
  const positional = [];
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq === -1) flags.set(arg.slice(2), true);
      else flags.set(arg.slice(2, eq), arg.slice(eq + 1));
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}
function flagString(flags, name) {
  const value = flags.get(name);
  return typeof value === "string" ? value : void 0;
}
var ENV_KEYS = { user: "CLINEHUB_USER", password: "CLINEHUB_PASSWORD" };
async function readEnvLines(envPath) {
  try {
    return (await readFile(envPath, "utf8")).split("\n");
  } catch {
    return [];
  }
}
function quote(value) {
  if (!value.includes("'")) return `'${value}'`;
  if (!value.includes('"')) return `"${value}"`;
  throw new Error(`Username/password can't contain both ' and " characters \u2014 pick one or the other`);
}
function setLine(lines, key, value) {
  const line = `${key}=${quote(value)}`;
  const index = lines.findIndex((entry) => entry.startsWith(`${key}=`));
  if (index === -1) return [...lines, line];
  const next = [...lines];
  next[index] = line;
  return next;
}
function removeLine(lines, key) {
  return lines.filter((entry) => !entry.startsWith(`${key}=`));
}
function writeLines(envPath, lines) {
  const content = lines.filter((line) => line.trim() !== "");
  return writeFile(envPath, content.length ? content.join("\n") + "\n" : "");
}
async function addUser(username, password, envPath = resolve(process.cwd(), ".env")) {
  let lines = await readEnvLines(envPath);
  lines = setLine(lines, ENV_KEYS.user, username);
  lines = setLine(lines, ENV_KEYS.password, password);
  await writeLines(envPath, lines);
}
async function removeUser(envPath = resolve(process.cwd(), ".env")) {
  let lines = await readEnvLines(envPath);
  lines = removeLine(lines, ENV_KEYS.user);
  lines = removeLine(lines, ENV_KEYS.password);
  await writeLines(envPath, lines);
}

// src/runtime.ts
import { ClineCore, getValidOpenAICodexCredentials, loginOpenAICodex, updateMcpSettingsFile } from "@cline/sdk";
import { execFile } from "child_process";
import { truncate } from "fs/promises";
import { resolve as resolve3 } from "path";

// src/providers.ts
import { Llms } from "@cline/sdk";
var providerDefaults = {
  lmstudio: "http://192.168.8.223:1234",
  llamacpp: "http://127.0.0.1:8080",
  ollama: "http://127.0.0.1:11434",
  codex: "https://chatgpt.com/backend-api/codex",
  "claude-code": ""
};
var unsupportedChatGptCodexModels = /* @__PURE__ */ new Set(["gpt-5.6"]);
async function discoverModels(input) {
  const provider = parseProvider(input.provider);
  if (provider === "codex" || provider === "claude-code") {
    const providerId2 = provider === "codex" ? "openai-codex" : "claude-code";
    const discoveredModelInfo = await Llms.getModelsForProvider(providerId2);
    const rawModelInfo = provider === "codex" ? Object.fromEntries(Object.entries(discoveredModelInfo).filter(([id]) => !unsupportedChatGptCodexModels.has(id))) : discoveredModelInfo;
    const modelInfo = Object.fromEntries(Object.entries(rawModelInfo).map(([id, info]) => [id, normalizeCatalogModelInfo(id, info)]));
    const models = Object.keys(modelInfo);
    if (models.length === 0) throw new Error(`No ${provider === "codex" ? "Codex subscription" : "Claude Code"} models are available`);
    return { provider, baseUrl: providerDefaults[provider], models, modelInfo };
  }
  const baseUrl = normalizeBaseUrl(input.baseUrl || providerDefaults[provider]);
  const timeoutMs = parseOptionalTimeout(input.timeoutMs);
  const discovered = provider === "ollama" ? await discoverOllama(baseUrl, timeoutMs) : provider === "lmstudio" ? await discoverLmStudio(baseUrl, timeoutMs) : await discoverOpenAiCompatible(baseUrl, timeoutMs);
  if (discovered.models.length === 0) throw new Error("No usable models were returned by the server");
  return { provider, baseUrl, ...discovered };
}
async function createConnection(input, codexCredentials) {
  const discovery = await discoverModels(input);
  const requestedModel = cleanOptional(input.modelId);
  const modelId = requestedModel ?? discovery.models[0];
  if (!discovery.models.includes(modelId)) {
    throw new Error(`Model is not available: ${modelId}`);
  }
  const timeoutMs = parseOptionalTimeout(input.timeoutMs);
  const imagesEnabled = parseOptionalBoolean(input.imagesEnabled, false);
  const selectedModelInfo = discovery.modelInfo[modelId];
  if (imagesEnabled && selectedModelInfo?.imageSupport === "unsupported") {
    throw new Error(`The selected model reports that image input is not supported: ${modelId}`);
  }
  if (discovery.provider === "codex") {
    if (!codexCredentials) throw new Error("Sign in with ChatGPT before connecting");
    return {
      provider: "codex",
      providerId: "openai-codex",
      baseUrl: providerDefaults.codex,
      modelId,
      apiKey: codexCredentials.access,
      codexCredentials,
      modelInfo: selectedModelInfo,
      timeoutMs,
      imagesEnabled
    };
  }
  if (discovery.provider === "claude-code") {
    return {
      provider: "claude-code",
      providerId: "claude-code",
      baseUrl: "",
      modelId,
      modelInfo: selectedModelInfo,
      timeoutMs,
      imagesEnabled
    };
  }
  return {
    provider: discovery.provider,
    providerId: providerId(discovery.provider),
    baseUrl: apiBaseUrl(discovery.provider, discovery.baseUrl),
    modelId,
    apiKey: "local-model",
    modelInfo: selectedModelInfo,
    timeoutMs,
    imagesEnabled
  };
}
function publicConnection(settings) {
  if (!settings) return { configured: false };
  return {
    configured: true,
    provider: settings.provider,
    baseUrl: settings.baseUrl,
    modelId: settings.modelId,
    authenticated: settings.provider === "codex" ? Boolean(settings.codexCredentials) : true,
    contextWindow: settings.modelInfo?.contextWindow,
    maxInputTokens: settings.modelInfo?.maxInputTokens,
    timeoutMs: settings.timeoutMs,
    imagesEnabled: settings.imagesEnabled === true,
    imageSupport: settings.modelInfo?.imageSupport ?? "unknown"
  };
}
function providerId(provider) {
  if (provider === "lmstudio") return "lmstudio";
  if (provider === "ollama") return "ollama";
  if (provider === "codex") return "openai-codex";
  if (provider === "claude-code") return "claude-code";
  return "openai-compatible";
}
function apiBaseUrl(provider, baseUrl) {
  if (provider === "ollama" || provider === "codex" || provider === "claude-code") return baseUrl;
  return ensureV1(baseUrl);
}
async function discoverLmStudio(baseUrl, timeoutMs) {
  try {
    const body = await getJson(`${baseUrl}/api/v1/models`, timeoutMs);
    if (isRecord(body) && Array.isArray(body.models)) {
      const loaded = [];
      const modelInfo = {};
      for (const model of body.models) {
        if (!isRecord(model) || model.type !== "llm" || !Array.isArray(model.loaded_instances)) continue;
        for (const instance of model.loaded_instances) {
          if (isRecord(instance) && typeof instance.id === "string") {
            loaded.push(instance.id);
            const config = isRecord(instance.config) ? instance.config : void 0;
            const contextWindow = positiveInteger(config?.context_length) ?? positiveInteger(model.max_context_length);
            const capabilities = isRecord(model.capabilities) ? model.capabilities : void 0;
            const imageSupport = typeof capabilities?.vision === "boolean" ? capabilities.vision ? "supported" : "unsupported" : "unknown";
            modelInfo[instance.id] = {
              id: instance.id,
              name: typeof model.display_name === "string" ? model.display_name : instance.id,
              contextWindow,
              capabilities: imageSupport === "supported" ? ["images"] : [],
              imageSupport
            };
          }
        }
      }
      if (loaded.length > 0) return { models: unique(loaded), modelInfo };
    }
  } catch {
  }
  return await discoverOpenAiCompatible(baseUrl, timeoutMs);
}
async function discoverOllama(baseUrl, timeoutMs) {
  const body = await getJson(`${baseUrl}/api/tags`, timeoutMs);
  if (!isRecord(body) || !Array.isArray(body.models)) return { models: [], modelInfo: {} };
  const models = unique(body.models.flatMap((model) => {
    if (!isRecord(model)) return [];
    if (typeof model.model === "string") return [model.model];
    return typeof model.name === "string" ? [model.name] : [];
  }));
  const modelInfo = {};
  await Promise.all(models.map(async (id) => {
    try {
      const detail = await postJson(`${baseUrl}/api/show`, { model: id }, timeoutMs);
      const info = isRecord(detail) && isRecord(detail.model_info) ? detail.model_info : {};
      const contextWindow = Object.entries(info).find(([key, value]) => key.endsWith(".context_length") && positiveInteger(value))?.[1];
      const reportedCapabilities = isRecord(detail) && Array.isArray(detail.capabilities) ? detail.capabilities.filter((value) => typeof value === "string") : void 0;
      const imageSupport = reportedCapabilities ? reportedCapabilities.includes("vision") ? "supported" : "unsupported" : "unknown";
      modelInfo[id] = { id, name: id, contextWindow: positiveInteger(contextWindow), capabilities: imageSupport === "supported" ? ["images"] : [], imageSupport };
    } catch {
      modelInfo[id] = { id, name: id, imageSupport: "unknown" };
    }
  }));
  return { models, modelInfo };
}
async function discoverOpenAiCompatible(baseUrl, timeoutMs) {
  const body = await getJson(`${ensureV1(baseUrl)}/models`, timeoutMs);
  if (!isRecord(body) || !Array.isArray(body.data)) return { models: [], modelInfo: {} };
  const models = unique(body.data.flatMap((model) => isRecord(model) && typeof model.id === "string" ? [model.id] : []));
  const modelInfo = Object.fromEntries(models.map((id) => [id, { id, name: id, imageSupport: "unknown" }]));
  try {
    const props = await getJson(`${baseUrl}/props`, timeoutMs);
    if (isRecord(props)) {
      const contextWindow = positiveInteger(props.n_ctx) ?? (isRecord(props.default_generation_settings) ? positiveInteger(props.default_generation_settings.n_ctx) : void 0);
      if (contextWindow && models[0]) modelInfo[models[0]] = { ...modelInfo[models[0]], id: models[0], name: modelInfo[models[0]]?.name ?? models[0], contextWindow };
    }
  } catch {
  }
  return { models, modelInfo };
}
async function getJson(url, timeoutMs) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs ?? 8e3) });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Model request failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`);
  }
  return await response.json();
}
async function postJson(url, body, timeoutMs) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs ?? 8e3) });
  if (!response.ok) throw new Error(`Model detail request failed (${response.status})`);
  return await response.json();
}
function normalizeBaseUrl(value) {
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid http:// or https:// URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only http:// and https:// URLs are supported");
  url.pathname = url.pathname.replace(/\/(?:v1|api\/v1)\/?$/, "") || "/";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}
function ensureV1(baseUrl) {
  return `${normalizeBaseUrl(baseUrl)}/v1`;
}
function cleanOptional(value) {
  const clean = value?.trim();
  return clean ? clean : void 0;
}
function unique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function positiveInteger(value) {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : void 0;
}
function parseOptionalTimeout(value) {
  if (value === void 0 || value === null || value === "") return void 0;
  const timeoutMs = Number(value);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1e3 || timeoutMs > 36e5) throw new Error("Timeout must be between 1 and 3,600 seconds");
  return timeoutMs;
}
function parseOptionalBoolean(value, fallback) {
  if (value === void 0) return fallback;
  if (typeof value !== "boolean") throw new Error("Image input setting must be a boolean");
  return value;
}
function normalizeCatalogModelInfo(id, value) {
  const info = isRecord(value) ? value : {};
  const capabilities = Array.isArray(info.capabilities) ? info.capabilities.filter((item) => typeof item === "string") : void 0;
  return {
    ...info,
    id,
    capabilities,
    imageSupport: capabilities ? capabilities.includes("images") ? "supported" : "unsupported" : "unknown"
  };
}
function parseProvider(value) {
  if (value === "lmstudio" || value === "llamacpp" || value === "ollama" || value === "codex" || value === "claude-code") return value;
  throw new Error("Unsupported provider");
}

// src/stores/agent-settings.ts
import { mkdir, readFile as readFile2, realpath, stat, writeFile as writeFile2 } from "fs/promises";
import { dirname, isAbsolute, relative, resolve as resolve2 } from "path";
var managedTools = ["read_files", "search_codebase", "fetch_web_content", "skills", "run_commands", "editor", "apply_patch"];
var presetPermissions = {
  readonly: {
    read_files: "allow",
    search_codebase: "allow",
    fetch_web_content: "ask",
    skills: "allow",
    run_commands: "disabled",
    editor: "disabled",
    apply_patch: "disabled"
  },
  balanced: {
    read_files: "allow",
    search_codebase: "allow",
    fetch_web_content: "allow",
    skills: "allow",
    run_commands: "ask",
    editor: "ask",
    apply_patch: "ask"
  },
  full: {
    read_files: "allow",
    search_codebase: "allow",
    fetch_web_content: "allow",
    skills: "allow",
    run_commands: "allow",
    editor: "allow",
    apply_patch: "allow"
  }
};
var dailyTemplatePrompt = [
  "You are a friendly, helpful assistant operating through ClineHub-for-web for {user}.",
  "The active workspace is {workspace} on {os}, but most requests here are everyday questions, writing, or research rather than software changes.",
  "Answer directly and concisely. Only use file or command tools when the task actually requires touching the workspace, and say what you're about to do first."
].join("\n");
var codingTemplatePrompt = [
  "You are a meticulous coding agent operating through ClineHub-for-web for {user}.",
  "The active workspace is {workspace} ({workspaceType}) on {os}.",
  "Inspect the workspace carefully, explain important actions, and use tools only as permitted by the user.",
  "Prefer workspace-relative paths so tool calls remain portable and easy to audit.",
  "For large files, never put the entire document into one editor call. Create the file first, then append or patch it in small coherent sections (normally 6,000 characters or fewer per tool call), verifying the result after the final section. When continuing an existing file, read it first and use the editor's supported insertion or targeted-diff operation; do not overwrite the whole file or attempt an unsupported append.",
  "Keep code modular and split logical components or layers into separate files to improve maintainability and reliability."
].join("\n");
var planTemplatePrompt = [
  "You are a careful planning assistant operating through ClineHub-for-web for {user}.",
  "The active workspace is {workspace} ({workspaceType}) on {os}.",
  "Investigate the request first (read files, search the codebase, fetch web content) and present a clear, concrete plan for {user} to review before anything changes.",
  "Do not run commands, edit files, or apply patches in this mode, even if a tool for that is made available."
].join("\n");
var linuxTemplatePrompt = [
  "You are a Linux systems agent operating through ClineHub-for-web for {user}, working directly on a Linux host (local shell or the SSH workspace tools, whichever is active).",
  "The active workspace is {workspace} ({workspaceType}) on {os}.",
  "Prefer POSIX-compliant shell and standard coreutils/systemd tooling; note distro-specific package managers (apt/dnf/pacman/apk) before assuming one.",
  "Before a change with real system impact (package installs, service/systemd unit changes, permissions, firewall, cron, disk/partition operations), explain what you're about to run and why.",
  "Never run destructive or irreversible commands (rm -rf, disk formatting, dd to a device, mkfs, iptables flush, force-push) without explicit confirmation from the user first.",
  "Quote paths and variables defensively, check exit codes, and prefer non-interactive flags (-y/--yes) only once the user has approved the action."
].join("\n");
var builtinTemplateDefaults = [
  { id: "daily", name: "\u65E5\u5E38 / Daily", prompt: dailyTemplatePrompt, permissionPreset: "balanced", permissions: { ...presetPermissions.balanced }, builtin: true },
  { id: "coding", name: "\u30B3\u30FC\u30C7\u30A3\u30F3\u30B0 / Coding", prompt: codingTemplatePrompt, permissionPreset: "balanced", permissions: { ...presetPermissions.balanced }, builtin: true },
  { id: "plan", name: "\u30D7\u30E9\u30F3 / Plan", prompt: planTemplatePrompt, permissionPreset: "readonly", permissions: { ...presetPermissions.readonly }, builtin: true },
  { id: "linux", name: "Linux", prompt: linuxTemplatePrompt, permissionPreset: "balanced", permissions: { ...presetPermissions.balanced }, builtin: true }
];
function cloneTemplate(template) {
  return { ...template, permissions: { ...template.permissions } };
}
function defaultTemplates() {
  return builtinTemplateDefaults.map(cloneTemplate);
}
var AgentSettingsStore = class {
  constructor(initialWorkspace2, allowedRoot2, storagePath) {
    this.storagePath = storagePath;
    const workspacePath = resolve2(initialWorkspace2);
    const root = allowedRoot2 === "" ? "" : resolve2(allowedRoot2);
    if (!isWithin(root, workspacePath)) throw new Error("Initial workspace must be inside CLINE_ALLOWED_ROOT");
    this.settings = {
      workspacePath,
      allowedRoot: root,
      templates: defaultTemplates(),
      activeTemplateId: "daily",
      maxIterations: 50,
      compactionEnabled: true,
      compactionStrategy: "agentic",
      preserveRecentTokens: 2e4,
      contextWindowOverride: null,
      mcpServers: [],
      mcpEnabled: true,
      shellIdleTimeoutSeconds: 60,
      shellIdleAction: "ask",
      shellIdleCarryContext: true
    };
  }
  storagePath;
  settings;
  async load() {
    if (!this.storagePath) return;
    try {
      const value = JSON.parse(await readFile2(this.storagePath, "utf8"));
      if (!isRecord2(value)) throw new Error("Saved agent settings are invalid");
      if (Array.isArray(value.templates) && value.templates.length > 0) {
        const saved = value.templates.map(parseStoredTemplate);
        const newBuiltins = builtinTemplateDefaults.filter((def) => !saved.some((template) => template.id === def.id)).map(cloneTemplate);
        this.settings = { ...this.settings, templates: [...saved, ...newBuiltins] };
      }
      await this.update(value);
    } catch (error) {
      if (!isNodeError(error) || error.code !== "ENOENT") throw error;
    }
  }
  get() {
    return {
      ...this.settings,
      templates: this.settings.templates.map(cloneTemplate),
      mcpServers: this.settings.mcpServers.map((server) => ({ ...server, args: [...server.args] }))
    };
  }
  /** The template actually in force right now. */
  effectiveTemplate() {
    const found = this.settings.templates.find((template) => template.id === this.settings.activeTemplateId);
    return cloneTemplate(found ?? builtinTemplateDefaults[0]);
  }
  effectivePermissionPreset() {
    return this.effectiveTemplate().permissionPreset;
  }
  effectivePermissions() {
    return this.effectiveTemplate().permissions;
  }
  /** Raw (unsubstituted) system prompt text of the active template. */
  effectiveSystemPrompt() {
    return this.effectiveTemplate().prompt;
  }
  policies() {
    const permissions = this.effectivePermissions();
    return Object.fromEntries(managedTools.map((tool) => {
      const permission = permissions[tool];
      if (permission === "disabled") return [tool, { enabled: false, autoApprove: false }];
      return [tool, { enabled: true, autoApprove: permission === "allow" }];
    }));
  }
  async update(input) {
    const next = this.get();
    if (input.workspacePath !== void 0) {
      if (typeof input.workspacePath !== "string" || !input.workspacePath.trim()) throw new Error("Workspace path is required");
      const requestedPath = resolve2(input.workspacePath.trim());
      if (!isWithin(next.allowedRoot, requestedPath)) throw new Error(`Workspace must be inside: ${next.allowedRoot}`);
      const workspacePath = await realpath(requestedPath).catch(() => null);
      if (!workspacePath || !isWithin(next.allowedRoot, workspacePath)) throw new Error(`Workspace must be inside: ${next.allowedRoot}`);
      const info = await stat(workspacePath).catch(() => null);
      if (!info?.isDirectory()) throw new Error("Workspace path must be an existing directory");
      next.workspacePath = workspacePath;
    }
    if (input.activeTemplateId !== void 0) {
      if (typeof input.activeTemplateId !== "string" || !next.templates.some((template) => template.id === input.activeTemplateId)) {
        throw new Error("Template not found");
      }
      next.activeTemplateId = input.activeTemplateId;
    }
    if (input.maxIterations !== void 0) {
      if (!Number.isInteger(input.maxIterations) || Number(input.maxIterations) < 1 || Number(input.maxIterations) > 500) {
        throw new Error("Max iterations must be an integer from 1 to 500");
      }
      next.maxIterations = Number(input.maxIterations);
    }
    if (input.compactionEnabled !== void 0) {
      if (typeof input.compactionEnabled !== "boolean") throw new Error("Compaction enabled must be a boolean");
      next.compactionEnabled = input.compactionEnabled;
    }
    if (input.compactionStrategy !== void 0) {
      if (input.compactionStrategy !== "basic" && input.compactionStrategy !== "agentic") throw new Error("Invalid compaction strategy");
      next.compactionStrategy = input.compactionStrategy;
    }
    if (input.preserveRecentTokens !== void 0) {
      if (!Number.isInteger(input.preserveRecentTokens) || Number(input.preserveRecentTokens) < 1e3 || Number(input.preserveRecentTokens) > 5e5) {
        throw new Error("Preserved recent tokens must be an integer from 1,000 to 500,000");
      }
      next.preserveRecentTokens = Number(input.preserveRecentTokens);
    }
    if (input.contextWindowOverride !== void 0) {
      if (input.contextWindowOverride === null || input.contextWindowOverride === "") next.contextWindowOverride = null;
      else if (!Number.isInteger(input.contextWindowOverride) || Number(input.contextWindowOverride) < 4096 || Number(input.contextWindowOverride) > 1e7) {
        throw new Error("Context window override must be an integer from 4,096 to 10,000,000");
      } else next.contextWindowOverride = Number(input.contextWindowOverride);
    }
    if (input.shellIdleTimeoutSeconds !== void 0) {
      if (!Number.isInteger(input.shellIdleTimeoutSeconds) || Number(input.shellIdleTimeoutSeconds) < 5 || Number(input.shellIdleTimeoutSeconds) > 3600) {
        throw new Error("Shell idle timeout must be an integer from 5 to 3,600 seconds");
      }
      next.shellIdleTimeoutSeconds = Number(input.shellIdleTimeoutSeconds);
    }
    if (input.shellIdleAction !== void 0) next.shellIdleAction = parseShellIdleAction(input.shellIdleAction);
    if (input.shellIdleCarryContext !== void 0) {
      if (typeof input.shellIdleCarryContext !== "boolean") throw new Error("Shell idle context setting must be a boolean");
      next.shellIdleCarryContext = input.shellIdleCarryContext;
    }
    if (input.mcpServers !== void 0) next.mcpServers = parseMcpServers(input.mcpServers);
    if (input.mcpEnabled !== void 0) {
      if (typeof input.mcpEnabled !== "boolean") throw new Error("MCP enabled must be a boolean");
      next.mcpEnabled = input.mcpEnabled;
    }
    this.settings = next;
    await this.persist();
    return this.get();
  }
  async createTemplate(input) {
    const name = validateTemplateName(input.name);
    const prompt = validateTemplatePrompt(input.prompt);
    let permissionPreset = input.permissionPreset !== void 0 ? parsePreset(input.permissionPreset) : "balanced";
    let permissions = permissionPreset !== "custom" ? { ...presetPermissions[permissionPreset] } : { ...presetPermissions.balanced };
    if (input.permissions !== void 0) {
      if (!isRecord2(input.permissions)) throw new Error("Template permissions must be an object");
      for (const tool of managedTools) if (input.permissions[tool] !== void 0) permissions[tool] = parsePermission(input.permissions[tool]);
      permissionPreset = inferPreset(permissions);
    }
    const template = { id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, prompt, permissionPreset, permissions, builtin: false };
    this.settings = { ...this.settings, templates: [...this.settings.templates, template] };
    await this.persist();
    return template;
  }
  async updateTemplate(id, patch) {
    const index = this.settings.templates.findIndex((template) => template.id === id);
    const current = this.settings.templates[index];
    if (index === -1 || !current) throw new Error("Template not found");
    const name = patch.name !== void 0 ? validateTemplateName(patch.name) : current.name;
    const prompt = patch.prompt !== void 0 ? validateTemplatePrompt(patch.prompt) : current.prompt;
    let permissionPreset = current.permissionPreset;
    let permissions = { ...current.permissions };
    if (patch.permissionPreset !== void 0) {
      permissionPreset = parsePreset(patch.permissionPreset);
      if (permissionPreset !== "custom") permissions = { ...presetPermissions[permissionPreset] };
    }
    if (patch.permissions !== void 0) {
      if (!isRecord2(patch.permissions)) throw new Error("Template permissions must be an object");
      for (const tool of managedTools) if (patch.permissions[tool] !== void 0) permissions[tool] = parsePermission(patch.permissions[tool]);
      permissionPreset = inferPreset(permissions);
    }
    const updated = { ...current, name, prompt, permissionPreset, permissions };
    const templates = [...this.settings.templates];
    templates[index] = updated;
    this.settings = { ...this.settings, templates };
    await this.persist();
    return updated;
  }
  async deleteTemplate(id) {
    const template = this.settings.templates.find((item) => item.id === id);
    if (!template) throw new Error("Template not found");
    if (template.builtin) throw new Error("Built-in templates cannot be deleted; reset them instead");
    const templates = this.settings.templates.filter((item) => item.id !== id);
    const activeTemplateId = this.settings.activeTemplateId === id ? templates[0]?.id ?? "daily" : this.settings.activeTemplateId;
    this.settings = { ...this.settings, templates, activeTemplateId };
    await this.persist();
  }
  async resetTemplate(id) {
    const original = builtinTemplateDefaults.find((template) => template.id === id);
    if (!original) throw new Error("Only built-in templates can be reset");
    const reset = cloneTemplate(original);
    this.settings = { ...this.settings, templates: this.settings.templates.map((template) => template.id === id ? reset : template) };
    await this.persist();
    return reset;
  }
  async persist() {
    if (!this.storagePath) return;
    await mkdir(dirname(this.storagePath), { recursive: true });
    const { allowedRoot: _allowedRoot, ...stored } = this.settings;
    await writeFile2(this.storagePath, `${JSON.stringify({ version: 2, ...stored }, null, 2)}
`, { encoding: "utf8", mode: 384 });
  }
};
function validateTemplateName(value) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Template name is required");
  if (value.length > 100) throw new Error("Template name must be 100 characters or fewer");
  return value.trim();
}
function validateTemplatePrompt(value) {
  if (typeof value !== "string" || !value.trim()) throw new Error("Template prompt is required");
  if (value.length > 2e4) throw new Error("Template prompt must be 20,000 characters or fewer");
  return value.trim();
}
function parseStoredTemplate(raw) {
  if (!isRecord2(raw)) throw new Error("Saved template is invalid");
  const id = typeof raw.id === "string" && raw.id ? raw.id : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const permissionPreset = parsePreset(raw.permissionPreset);
  const permissions = { ...presetPermissions.balanced };
  if (isRecord2(raw.permissions)) {
    for (const tool of managedTools) if (raw.permissions[tool] !== void 0) permissions[tool] = parsePermission(raw.permissions[tool]);
  }
  return { id, name: validateTemplateName(raw.name), prompt: validateTemplatePrompt(raw.prompt), permissionPreset, permissions, builtin: raw.builtin === true };
}
function inferPreset(permissions) {
  for (const preset of ["readonly", "balanced", "full"]) {
    if (managedTools.every((tool) => permissions[tool] === presetPermissions[preset][tool])) return preset;
  }
  return "custom";
}
function parsePreset(value) {
  if (value === "readonly" || value === "balanced" || value === "full" || value === "custom") return value;
  throw new Error("Invalid permission preset");
}
function parsePermission(value) {
  if (value === "disabled" || value === "ask" || value === "allow") return value;
  throw new Error("Invalid tool permission");
}
function parseShellIdleAction(value) {
  if (value === "ask" || value === "enter" || value === "wait" || value === "close" || value === "auto") return value;
  throw new Error("Invalid shell idle action");
}
function parseMcpServerConnectionFields(raw, label) {
  const transport = raw.transport;
  if (transport !== "stdio" && transport !== "sse" && transport !== "streamableHttp") throw new Error(`${label} has an invalid transport`);
  const command = typeof raw.command === "string" ? raw.command.trim() : "";
  const url = typeof raw.url === "string" ? raw.url.trim() : "";
  if (transport === "stdio" && !command) throw new Error(`${label} needs a command`);
  if (transport !== "stdio") {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error();
    } catch {
      throw new Error(`${label} needs an http(s) URL`);
    }
  }
  if (!Array.isArray(raw.args) || raw.args.some((arg) => typeof arg !== "string" || arg.length > 2e3)) throw new Error(`${label} has invalid arguments`);
  return { transport, command, args: raw.args.map((arg) => arg.trim()).filter(Boolean), url };
}
function parseMcpServers(value) {
  if (!Array.isArray(value)) throw new Error("MCP servers must be an array");
  if (value.length > 20) throw new Error("Configure no more than 20 MCP servers");
  const names = /* @__PURE__ */ new Set();
  return value.map((raw, index) => {
    if (!isRecord2(raw)) throw new Error(`MCP server ${index + 1} must be an object`);
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(name)) throw new Error(`MCP server ${index + 1} needs a name using letters, numbers, _ or -`);
    if (names.has(name.toLowerCase())) throw new Error(`MCP server name '${name}' is duplicated`);
    names.add(name.toLowerCase());
    const fields = parseMcpServerConnectionFields(raw, `MCP server '${name}'`);
    const disabledTools = Array.isArray(raw.disabledTools) ? raw.disabledTools.filter((tool) => typeof tool === "string") : [];
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id.slice(0, 80) : `mcp-${Date.now()}-${index}`,
      name,
      enabled: raw.enabled !== false,
      autoApprove: raw.autoApprove === true,
      disabledTools,
      ...fields
    };
  });
}
function isWithin(root, target) {
  if (root === "") return true;
  const path = relative(root, target);
  return path === "" || !path.startsWith("..") && !isAbsolute(path);
}
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isNodeError(value) {
  return value instanceof Error && "code" in value;
}

// src/stores/connection-store.ts
import { mkdir as mkdir2, readFile as readFile3, rm, writeFile as writeFile3 } from "fs/promises";
import { dirname as dirname2 } from "path";
var providerIds = {
  lmstudio: "lmstudio",
  llamacpp: "openai-compatible",
  ollama: "ollama",
  "claude-code": "claude-code"
};
var ConnectionStore = class {
  constructor(filePath) {
    this.filePath = filePath;
  }
  filePath;
  async save(settings) {
    if (settings.provider === "codex") {
      await this.clear();
      return;
    }
    const modelInfo = settings.modelInfo ? {
      id: settings.modelInfo.id,
      name: settings.modelInfo.name,
      contextWindow: settings.modelInfo.contextWindow,
      maxInputTokens: settings.modelInfo.maxInputTokens,
      capabilities: settings.modelInfo.capabilities,
      imageSupport: settings.modelInfo.imageSupport
    } : void 0;
    const stored = {
      version: 1,
      provider: settings.provider,
      providerId: settings.providerId,
      baseUrl: settings.baseUrl,
      modelId: settings.modelId,
      modelInfo,
      timeoutMs: settings.timeoutMs,
      imagesEnabled: settings.imagesEnabled
    };
    await mkdir2(dirname2(this.filePath), { recursive: true });
    await writeFile3(this.filePath, `${JSON.stringify(stored, null, 2)}
`, { encoding: "utf8", mode: 384 });
  }
  async load() {
    let value;
    try {
      value = JSON.parse(await readFile3(this.filePath, "utf8"));
    } catch (error) {
      if (isNodeError2(error) && error.code === "ENOENT") return void 0;
      throw error;
    }
    if (!isRecord3(value) || value.version !== 1) throw new Error("Unsupported saved connection format");
    const provider = parseProvider2(value.provider);
    if (providerIds[provider] !== value.providerId) throw new Error("Saved provider configuration is invalid");
    if (typeof value.baseUrl !== "string" || typeof value.modelId !== "string" || !value.modelId) throw new Error("Saved connection is incomplete");
    return {
      provider,
      providerId: providerIds[provider],
      baseUrl: value.baseUrl,
      modelId: value.modelId,
      apiKey: provider === "claude-code" ? void 0 : "local-model",
      modelInfo: parseModelInfo(value.modelInfo, value.modelId),
      timeoutMs: optionalPositiveInteger(value.timeoutMs),
      imagesEnabled: value.imagesEnabled === true
    };
  }
  async clear() {
    await rm(this.filePath, { force: true });
  }
};
function parseProvider2(value) {
  if (value === "lmstudio" || value === "llamacpp" || value === "ollama" || value === "claude-code") return value;
  throw new Error("Saved provider is not supported");
}
function parseModelInfo(value, modelId) {
  if (!isRecord3(value)) return void 0;
  return {
    id: typeof value.id === "string" ? value.id : modelId,
    name: typeof value.name === "string" ? value.name : void 0,
    contextWindow: positiveInteger2(value.contextWindow),
    maxInputTokens: positiveInteger2(value.maxInputTokens),
    capabilities: Array.isArray(value.capabilities) ? value.capabilities.filter((item) => typeof item === "string") : void 0,
    imageSupport: value.imageSupport === "supported" || value.imageSupport === "unsupported" || value.imageSupport === "unknown" ? value.imageSupport : void 0
  };
}
function positiveInteger2(value) {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : void 0;
}
function optionalPositiveInteger(value) {
  return value === void 0 ? void 0 : positiveInteger2(value);
}
function isRecord3(value) {
  return typeof value === "object" && value !== null;
}
function isNodeError2(value) {
  return value instanceof Error && "code" in value;
}

// src/stores/profile-store.ts
import { createCipheriv, createDecipheriv, randomBytes as randomBytes2 } from "crypto";
import { mkdir as mkdir3, readFile as readFile4, writeFile as writeFile4 } from "fs/promises";
import { dirname as dirname3 } from "path";
var ProfileStore = class {
  constructor(filePath, keyPath) {
    this.filePath = filePath;
    this.keyPath = keyPath;
  }
  filePath;
  keyPath;
  document = { version: 1, models: [], workspaces: [] };
  key;
  async load() {
    try {
      const value = JSON.parse(await readFile4(this.filePath, "utf8"));
      if (!isRecord4(value) || value.version !== 1 || !Array.isArray(value.models) || !Array.isArray(value.workspaces)) {
        throw new Error("Unsupported profile storage format");
      }
      this.document = value;
    } catch (error) {
      if (!isNodeError3(error) || error.code !== "ENOENT") throw error;
    }
  }
  list() {
    return {
      activeModelProfileId: this.document.activeModelProfileId,
      activeWorkspaceProfileId: this.document.activeWorkspaceProfileId,
      models: this.document.models.map((profile) => ({ ...profile })),
      workspaces: this.document.workspaces.map((profile) => this.publicWorkspace(profile))
    };
  }
  model(id) {
    const profile = this.document.models.find((item) => item.id === id);
    return profile ? { ...profile } : void 0;
  }
  activeWorkspace() {
    const id = this.document.activeWorkspaceProfileId;
    if (!id) return void 0;
    const profile = this.document.workspaces.find((item) => item.id === id);
    return profile ? this.publicWorkspace(profile) : void 0;
  }
  async resolvedActiveSshWorkspace() {
    const id = this.document.activeWorkspaceProfileId;
    if (!id) return void 0;
    const profile = this.document.workspaces.find((item) => item.id === id);
    if (!profile || profile.type !== "ssh") return void 0;
    return await this.resolveSsh(profile);
  }
  async ensureModel(settings, name) {
    const existing = this.document.models.find((item) => item.provider === settings.provider && item.baseUrl === settings.baseUrl && item.modelId === settings.modelId);
    if (existing) {
      this.document.activeModelProfileId = existing.id;
      await this.persist();
      return { ...existing };
    }
    return await this.saveModel({ name: name ?? defaultModelName(settings), settings });
  }
  async saveModel(input) {
    const id = optionalId(input.id) ?? makeId("model");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const current = this.document.models.find((item) => item.id === id);
    const name = requiredString(input.name, "Model profile name", 100);
    const modelInfo = input.settings.modelInfo ? {
      id: input.settings.modelInfo.id,
      name: input.settings.modelInfo.name,
      contextWindow: input.settings.modelInfo.contextWindow,
      maxInputTokens: input.settings.modelInfo.maxInputTokens,
      capabilities: input.settings.modelInfo.capabilities,
      imageSupport: input.settings.modelInfo.imageSupport
    } : void 0;
    const profile = {
      id,
      name,
      provider: input.settings.provider,
      baseUrl: input.settings.baseUrl,
      modelId: input.settings.modelId,
      modelInfo,
      timeoutMs: input.settings.timeoutMs,
      imagesEnabled: input.settings.imagesEnabled === true,
      createdAt: current?.createdAt ?? now,
      updatedAt: now
    };
    this.document.models = [...this.document.models.filter((item) => item.id !== id), profile];
    this.document.activeModelProfileId = id;
    await this.persist();
    return { ...profile };
  }
  /** Edits an existing model profile's own fields (name, timeout, image input, and —
   * once the caller has re-resolved them via createConnection() — URL/model/modelInfo)
   * without touching which profile is active — unlike saveModel(), which is also the
   * connect flow's upsert-and-activate path. This method trusts baseUrl/modelId/modelInfo
   * as already-validated; callers must resolve them through createConnection() first. */
  async updateModel(id, patch) {
    const index = this.document.models.findIndex((item) => item.id === id);
    const current = this.document.models[index];
    if (index === -1 || !current) throw new Error("Model profile not found");
    const profile = {
      ...current,
      name: patch.name !== void 0 ? requiredString(patch.name, "Model profile name", 100) : current.name,
      baseUrl: patch.baseUrl !== void 0 ? requiredString(patch.baseUrl, "Server URL", 2e3) : current.baseUrl,
      modelId: patch.modelId !== void 0 ? requiredString(patch.modelId, "Model", 300) : current.modelId,
      modelInfo: patch.modelInfo !== void 0 ? patch.modelInfo : current.modelInfo,
      timeoutMs: patch.timeoutMs !== void 0 ? parseOptionalTimeout(patch.timeoutMs) : current.timeoutMs,
      imagesEnabled: patch.imagesEnabled !== void 0 ? Boolean(patch.imagesEnabled) : current.imagesEnabled,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const models = [...this.document.models];
    models[index] = profile;
    this.document.models = models;
    await this.persist();
    return { ...profile };
  }
  async activateModel(id) {
    const profile = this.document.models.find((item) => item.id === id);
    if (!profile) throw new Error("Model profile not found");
    this.document.activeModelProfileId = id;
    await this.persist();
    return { ...profile };
  }
  async deleteModel(id) {
    this.document.models = this.document.models.filter((item) => item.id !== id);
    if (this.document.activeModelProfileId === id) this.document.activeModelProfileId = void 0;
    await this.persist();
  }
  async ensureLocalWorkspace(name, path) {
    const existing = this.document.workspaces.find((item) => item.type === "local" && item.path === path);
    if (existing?.type === "local") {
      this.document.activeWorkspaceProfileId ??= existing.id;
      await this.persist();
      return { ...existing };
    }
    const profile = await this.saveLocalWorkspace({ name, path });
    if (!this.document.activeWorkspaceProfileId) {
      this.document.activeWorkspaceProfileId = profile.id;
      await this.persist();
    }
    return profile;
  }
  async saveLocalWorkspace(input) {
    const id = optionalId(input.id) ?? makeId("workspace");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const current = this.document.workspaces.find((item) => item.id === id);
    const profile = {
      id,
      name: requiredString(input.name, "Workspace profile name", 100),
      type: "local",
      path: input.path,
      createdAt: current?.createdAt ?? now,
      updatedAt: now
    };
    this.document.workspaces = [...this.document.workspaces.filter((item) => item.id !== id), profile];
    await this.persist();
    return { ...profile };
  }
  async saveSshWorkspace(input) {
    const id = optionalId(input.id) ?? makeId("workspace");
    const current = this.document.workspaces.find((item) => item.id === id);
    const currentSsh = current?.type === "ssh" ? current : void 0;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const authType = input.authType === "password" || input.authType === "key" ? input.authType : null;
    if (!authType) throw new Error("SSH authentication must be password or key");
    const password = optionalSecret(input.password);
    const passphrase = optionalSecret(input.passphrase);
    const sudoPassword = optionalSecret(input.sudoPassword);
    const encryptedPassword = authType === "password" ? password ? await this.encrypt(password) : currentSsh?.encryptedPassword : void 0;
    const encryptedPassphrase = authType === "key" ? passphrase ? await this.encrypt(passphrase) : currentSsh?.encryptedPassphrase : void 0;
    const encryptedSudoPassword = sudoPassword ? await this.encrypt(sudoPassword) : currentSsh?.encryptedSudoPassword;
    const keyPath = authType === "key" ? requiredString(input.keyPath, "Private key path", 2e3) : void 0;
    if (authType === "password" && !encryptedPassword) throw new Error("SSH password is required");
    const profile = {
      id,
      name: requiredString(input.name, "Workspace profile name", 100),
      type: "ssh",
      host: requiredString(input.host, "SSH host", 255),
      port: integer(input.port, "SSH port", 1, 65535, 22),
      username: requiredString(input.username, "SSH username", 255),
      remoteDirectory: normalizeRemoteDirectory(requiredString(input.remoteDirectory, "Remote directory", 4096)),
      operatingSystem: parseOperatingSystem(input.operatingSystem),
      authType,
      keyPath,
      hostFingerprint: optionalString(input.hostFingerprint, 512),
      encryptedPassword,
      encryptedPassphrase,
      sudoPermission: parseSudoPermission(input.sudoPermission),
      encryptedSudoPassword,
      createdAt: current?.createdAt ?? now,
      updatedAt: now
    };
    this.document.workspaces = [...this.document.workspaces.filter((item) => item.id !== id), profile];
    await this.persist();
    return this.publicWorkspace(profile);
  }
  async activateWorkspace(id) {
    const profile = this.document.workspaces.find((item) => item.id === id);
    if (!profile) throw new Error("Workspace profile not found");
    this.document.activeWorkspaceProfileId = id;
    await this.persist();
    return this.publicWorkspace(profile);
  }
  async deleteWorkspace(id) {
    this.document.workspaces = this.document.workspaces.filter((item) => item.id !== id);
    if (this.document.activeWorkspaceProfileId === id) this.document.activeWorkspaceProfileId = void 0;
    await this.persist();
  }
  async resolveSshById(id) {
    const profile = this.document.workspaces.find((item) => item.id === id);
    if (!profile || profile.type !== "ssh") throw new Error("SSH workspace profile not found");
    return await this.resolveSsh(profile);
  }
  publicWorkspace(profile) {
    if (profile.type === "local") return { ...profile };
    const { encryptedPassword, encryptedPassphrase, encryptedSudoPassword, ...publicFields } = profile;
    return {
      ...publicFields,
      operatingSystem: profile.operatingSystem ?? "linux",
      sudoPermission: profile.sudoPermission ?? "ask",
      hasPassword: Boolean(encryptedPassword),
      hasPassphrase: Boolean(encryptedPassphrase),
      hasSudoPassword: Boolean(encryptedSudoPassword)
    };
  }
  async resolveSsh(profile) {
    const publicProfile = this.publicWorkspace(profile);
    return {
      ...publicProfile,
      password: profile.encryptedPassword ? await this.decrypt(profile.encryptedPassword) : void 0,
      passphrase: profile.encryptedPassphrase ? await this.decrypt(profile.encryptedPassphrase) : void 0,
      sudoPassword: profile.encryptedSudoPassword ? await this.decrypt(profile.encryptedSudoPassword) : void 0
    };
  }
  async encryptionKey() {
    if (this.key) return this.key;
    try {
      this.key = Buffer.from(await readFile4(this.keyPath, "utf8"), "base64");
    } catch (error) {
      if (!isNodeError3(error) || error.code !== "ENOENT") throw error;
      this.key = randomBytes2(32);
      await mkdir3(dirname3(this.keyPath), { recursive: true });
      await writeFile4(this.keyPath, this.key.toString("base64"), { encoding: "utf8", mode: 384 });
    }
    if (this.key.length !== 32) throw new Error("Profile encryption key is invalid");
    return this.key;
  }
  async encrypt(value) {
    const iv = randomBytes2(12);
    const cipher = createCipheriv("aes-256-gcm", await this.encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    return `v1:${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${encrypted.toString("base64")}`;
  }
  async decrypt(value) {
    const [version, iv, tag, encrypted] = value.split(":");
    if (version !== "v1" || !iv || !tag || !encrypted) throw new Error("Encrypted profile secret is invalid");
    const decipher = createDecipheriv("aes-256-gcm", await this.encryptionKey(), Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString("utf8");
  }
  async persist() {
    await mkdir3(dirname3(this.filePath), { recursive: true });
    await writeFile4(this.filePath, `${JSON.stringify(this.document, null, 2)}
`, { encoding: "utf8", mode: 384 });
  }
};
function defaultModelName(settings) {
  const provider = settings.provider === "claude-code" ? "Claude Code" : settings.provider === "codex" ? "Codex" : settings.provider;
  return `${provider} \xB7 ${settings.modelId}`;
}
function requiredString(value, label, max) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is required`);
  if (value.trim().length > max) throw new Error(`${label} is too long`);
  return value.trim();
}
function optionalString(value, max) {
  if (value === void 0 || value === null || value === "") return void 0;
  if (typeof value !== "string" || value.trim().length > max) throw new Error("Invalid optional text value");
  return value.trim();
}
function optionalSecret(value) {
  if (value === void 0 || value === null || value === "") return void 0;
  if (typeof value !== "string" || value.length > 2e4) throw new Error("Invalid SSH secret");
  return value;
}
function optionalId(value) {
  if (value === void 0 || value === null || value === "") return void 0;
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) throw new Error("Invalid profile id");
  return value;
}
function integer(value, label, min, max, fallback) {
  if (value === void 0 || value === null || value === "") return fallback;
  const number = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(number) || Number(number) < min || Number(number) > max) throw new Error(`${label} must be from ${min} to ${max}`);
  return Number(number);
}
function normalizeRemoteDirectory(value) {
  if (!value.startsWith("/")) throw new Error("Remote directory must be an absolute Linux path");
  return value.replace(/\/$/, "") || "/";
}
function parseOperatingSystem(value) {
  if (value === void 0 || value === null || value === "") return "linux";
  if (value === "linux" || value === "macos" || value === "unix") return value;
  throw new Error("Remote operating system must be linux, macos, or unix");
}
function parseSudoPermission(value) {
  if (value === void 0 || value === null || value === "") return "ask";
  if (value === "disabled" || value === "ask" || value === "allow") return value;
  throw new Error("Sudo permission must be disabled, ask, or allow");
}
function makeId(prefix) {
  return `${prefix}-${Date.now()}-${randomBytes2(5).toString("hex")}`;
}
function isRecord4(value) {
  return typeof value === "object" && value !== null;
}
function isNodeError3(value) {
  return value instanceof Error && "code" in value;
}

// src/workspace/ssh-workspace.ts
import { createHash as createHash2, timingSafeEqual as timingSafeEqual2 } from "crypto";
import { readFile as readFile5 } from "fs/promises";
import { posix as posix2 } from "path";
import { Client } from "ssh2";
import { createTool } from "@cline/sdk";

// src/workspace/workspace-security.ts
import { hostname, userInfo } from "os";
import { basename, posix, win32 } from "path";
var pathFieldNames = /* @__PURE__ */ new Set([
  "path",
  "file",
  "file_path",
  "filepath",
  "target",
  "target_path",
  "source_path",
  "destination_path",
  "old_path",
  "new_path"
]);
function localPromptVariables(workspace, workspaceName) {
  let user = process.env.USERNAME ?? process.env.USER ?? "user";
  try {
    user = userInfo().username || user;
  } catch {
  }
  return {
    user,
    workspace,
    workspaceName: workspaceName?.trim() || basename(workspace),
    workspaceType: "local",
    os: process.platform,
    host: hostname()
  };
}
function renderSystemPromptTemplate(template, variables) {
  const values = {
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
    date: variables.date ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
  };
  return template.replace(/\{\{([A-Za-z][A-Za-z0-9_]*)\}\}|\{([A-Za-z][A-Za-z0-9_]*)\}/g, (match, doubleName, singleName) => {
    const name = doubleName ?? singleName;
    return name && Object.hasOwn(values, name) ? values[name] : match;
  });
}
function buildWorkspaceSystemPrompt(template, variables) {
  const rendered = renderSystemPromptTemplate(template, variables);
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
    "The host also checks tool inputs and may reject paths that cannot be proven to stay inside the workspace."
  ].join("\n");
}
function createWorkspaceGuardHooks(workspaceRoot, pathStyle = detectPathStyle(workspaceRoot)) {
  return {
    beforeTool(context) {
      const reason = workspaceViolation(context.tool.name, context.input, workspaceRoot, pathStyle);
      return reason ? { skip: true, reason } : void 0;
    }
  };
}
function workspaceViolation(toolName, input, workspaceRoot, pathStyle = detectPathStyle(workspaceRoot)) {
  if (["run_commands", "ssh_run_commands", "ssh_run_sudo_commands"].includes(toolName)) {
    for (const command of commandStrings(input)) {
      const violation = commandViolation(command, workspaceRoot, pathStyle);
      if (violation) return `Workspace boundary blocked ${toolName}: ${violation}`;
    }
    return void 0;
  }
  if (toolName === "apply_patch") {
    const patch = isRecord5(input) ? typeof input.input === "string" ? input.input : typeof input.patch === "string" ? input.patch : "" : typeof input === "string" ? input : "";
    for (const path of patchPaths(patch)) {
      const violation = pathViolation(path, workspaceRoot, pathStyle);
      if (violation) return `Workspace boundary blocked apply_patch: ${violation}`;
    }
    return void 0;
  }
  if (["editor", "ssh_write_file"].includes(toolName)) {
    for (const path of collectPathFields(input)) {
      const violation = pathViolation(path, workspaceRoot, pathStyle);
      if (violation) return `Workspace boundary blocked ${toolName}: ${violation}`;
    }
  }
  return void 0;
}
function commandViolation(command, workspaceRoot, pathStyle) {
  if (/\0/.test(command)) return "the command contains a null byte";
  if (/(^|[\s"'=])~(?=$|[\\/\s"';&|])|\$(?:\{)?(?:HOME|USERPROFILE|TMP|TEMP)(?:\})?|%\s*(?:USERPROFILE|HOMEPATH|TMP|TEMP)\s*%|\$env:(?:USERPROFILE|HOMEPATH|TMP|TEMP)\b/i.test(command)) {
    return "home/profile/temp aliases are outside or cannot be proven inside the workspace";
  }
  if (/(^|[\\/\s"'=])\.\.(?=$|[\\/\s"';&|])/.test(command)) return "parent-directory traversal ('..') is not allowed";
  for (const path of absolutePathsInCommand(command, pathStyle)) {
    const violation = pathViolation(path, workspaceRoot, pathStyle);
    if (violation) return violation;
  }
  return void 0;
}
function pathViolation(rawPath, workspaceRoot, pathStyle) {
  const clean = rawPath.trim().replace(/^["']|["',;:)\]}]+$/g, "");
  if (!clean || clean === "/dev/null") return void 0;
  if (clean.includes("\0")) return "a path contains a null byte";
  if (/^(?:~|\$(?:\{)?(?:HOME|USERPROFILE|TMP|TEMP)|%\s*(?:USERPROFILE|HOMEPATH|TMP|TEMP)\s*%)/i.test(clean)) {
    return `path cannot be proven inside the workspace: ${rawPath}`;
  }
  const api = pathStyle === "windows" ? win32 : posix;
  const root = api.resolve(workspaceRoot);
  const target = api.resolve(root, clean);
  const relative2 = api.relative(root, target);
  if (relative2 === "" || !relative2.startsWith("..") && !api.isAbsolute(relative2)) return void 0;
  return `path is outside the workspace (${root}): ${rawPath}`;
}
function commandStrings(input) {
  if (typeof input === "string") return [input];
  if (Array.isArray(input)) return input.flatMap(commandValue);
  if (!isRecord5(input)) return [];
  const commands = input.commands;
  if (Array.isArray(commands)) return commands.flatMap(commandValue);
  if (commands !== void 0) return commandValue(commands);
  return commandValue(input.command ?? input.cmd);
}
function commandValue(value) {
  if (typeof value === "string") return [value];
  if (!isRecord5(value) || typeof value.command !== "string") return [];
  const args = Array.isArray(value.args) ? value.args.filter((arg) => typeof arg === "string") : [];
  return [`${value.command}${args.length ? ` ${args.join(" ")}` : ""}`];
}
function collectPathFields(value) {
  if (!isRecord5(value)) return [];
  const paths = [];
  for (const [key, field] of Object.entries(value)) {
    if (typeof field === "string" && pathFieldNames.has(key.toLowerCase())) paths.push(field);
    else if (Array.isArray(field) && /paths?|files?/i.test(key)) paths.push(...field.filter((item) => typeof item === "string"));
  }
  return paths;
}
function patchPaths(patch) {
  const paths = [];
  for (const line of patch.split(/\r?\n/)) {
    const match = line.match(/^\*\*\* (?:Add|Update|Delete) File:\s*(.+)$/) ?? line.match(/^\*\*\* Move to:\s*(.+)$/) ?? line.match(/^(?:---|\+\+\+)\s+(?:[ab]\/)?([^\t]+?)(?:\t.*)?$/);
    if (match?.[1] && match[1] !== "/dev/null") paths.push(match[1].trim());
  }
  return paths;
}
function absolutePathsInCommand(command, pathStyle) {
  const paths = [...command.match(/[A-Za-z]:[\\/][^\s"'`;|<>]*/g) ?? []];
  paths.push(...command.match(/\\\\[^\s"'`;|<>]+\\[^\s"'`;|<>]*/g) ?? []);
  if (pathStyle === "posix") {
    for (const match of command.matchAll(/(?:^|[\s"'=])(\/(?!\/)[^\s"'`;|<>]*)/g)) {
      if (match[1] && !["/c", "/d", "/s", "/q"].includes(match[1].toLowerCase())) paths.push(match[1]);
    }
  }
  return paths;
}
function detectPathStyle(root) {
  return /^[A-Za-z]:[\\/]|^\\\\/.test(root) ? "windows" : "posix";
}
function isRecord5(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// src/workspace/ssh-workspace.ts
var MAX_OUTPUT = 96 * 1024;
var MAX_FILE = 2 * 1024 * 1024;
async function testSshWorkspace(profile) {
  return await withClient(profile, void 0, async (client) => {
    const result = await execCommand(client, `cd -- ${shellQuote(profile.remoteDirectory)} && printf '%s\\n' "$PWD" && uname -s`, void 0);
    if (result.code !== 0) throw new Error(result.stderr || `SSH test failed with exit code ${result.code}`);
    const [directory = profile.remoteDirectory, system = "Linux"] = result.stdout.trim().split(/\r?\n/);
    if (!matchesOperatingSystem(profile.operatingSystem, system)) {
      throw new Error(`Configured OS is ${profile.operatingSystem}, but SSH reported ${system}`);
    }
    return { ok: true, directory, system, operatingSystem: profile.operatingSystem };
  });
}
function createSshTools(profile) {
  const runCommands = createTool({
    name: "ssh_run_commands",
    description: `Run shell commands on ${profile.username}@${profile.host} inside ${profile.remoteDirectory}. Each command starts in that directory. Use this instead of local run_commands.`,
    inputSchema: {
      type: "object",
      properties: { commands: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 20 } },
      required: ["commands"]
    },
    async execute(input, context) {
      try {
        const boundaryError = workspaceViolation("ssh_run_commands", input, profile.remoteDirectory, "posix");
        if (boundaryError) return { error: boundaryError, host: profile.host, directory: profile.remoteDirectory };
        return await withClient(profile, context.signal, async (client) => {
          const results = [];
          for (const command of input.commands) {
            if (containsSudoCommand(command)) {
              results.push({ command, stderr: "sudo is blocked in ssh_run_commands; use ssh_run_sudo_commands so its separate approval policy is enforced", stdout: "", code: 126 });
              continue;
            }
            const result = await execCommand(client, `cd -- ${shellQuote(profile.remoteDirectory)} && ${command}`, context.signal);
            results.push({ command, ...result });
          }
          return { host: profile.host, directory: profile.remoteDirectory, results };
        });
      } catch (error) {
        return { error: errorMessage(error), host: profile.host };
      }
    }
  });
  const readFiles = createTool({
    name: "ssh_read_files",
    description: `Read UTF-8 files from the remote SSH workspace ${profile.remoteDirectory}. Paths must stay inside the workspace.`,
    inputSchema: {
      type: "object",
      properties: { paths: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 20 } },
      required: ["paths"]
    },
    async execute(input, context) {
      try {
        return await withClient(profile, context.signal, async (client) => {
          const sftp = await getSftp(client);
          const files = [];
          for (const requested of input.paths) {
            const path = remotePath(profile.remoteDirectory, requested);
            try {
              const stat2 = await sftpStat(sftp, path);
              if (stat2.size > MAX_FILE) {
                files.push({ path: requested, error: `File exceeds ${MAX_FILE} bytes` });
                continue;
              }
              const content = await sftpReadFile(sftp, path);
              files.push({ path: requested, content: content.toString("utf8") });
            } catch (error) {
              files.push({ path: requested, error: errorMessage(error) });
            }
          }
          sftp.end();
          return { host: profile.host, directory: profile.remoteDirectory, files };
        });
      } catch (error) {
        return { error: errorMessage(error), host: profile.host };
      }
    }
  });
  const writeFile6 = createTool({
    name: "ssh_write_file",
    description: `Create or replace one UTF-8 file in the remote SSH workspace ${profile.remoteDirectory}. Parent directories are created automatically.`,
    inputSchema: {
      type: "object",
      properties: { path: { type: "string" }, content: { type: "string", maxLength: MAX_FILE } },
      required: ["path", "content"]
    },
    async execute(input, context) {
      try {
        const path = remotePath(profile.remoteDirectory, input.path);
        return await withClient(profile, context.signal, async (client) => {
          const mkdir5 = await execCommand(client, `mkdir -p -- ${shellQuote(posix2.dirname(path))}`, context.signal);
          if (mkdir5.code !== 0) return { error: mkdir5.stderr || "Could not create parent directory", path: input.path };
          const sftp = await getSftp(client);
          await sftpWriteFile(sftp, path, Buffer.from(input.content, "utf8"));
          sftp.end();
          return { ok: true, path: input.path, bytes: Buffer.byteLength(input.content), host: profile.host };
        });
      } catch (error) {
        return { error: errorMessage(error), path: input.path, host: profile.host };
      }
    }
  });
  const searchFiles = createTool({
    name: "ssh_search_files",
    description: `Search text recursively in the remote SSH workspace ${profile.remoteDirectory}. Uses rg when available and grep otherwise.`,
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        path: { type: "string", description: "Optional directory below the workspace" },
        maxResults: { type: "integer", minimum: 1, maximum: 500 }
      },
      required: ["query"]
    },
    async execute(input, context) {
      try {
        const target = remotePath(profile.remoteDirectory, input.path ?? ".");
        const max = Number.isInteger(input.maxResults) ? Math.min(500, Math.max(1, input.maxResults)) : 100;
        const query = shellQuote(input.query);
        const command = `if command -v rg >/dev/null 2>&1; then rg -n --no-heading --color never -m ${max} -- ${query} ${shellQuote(target)}; else grep -RIn -m ${max} -- ${query} ${shellQuote(target)}; fi`;
        return await withClient(profile, context.signal, async (client) => {
          const result = await execCommand(client, command, context.signal);
          return { host: profile.host, directory: profile.remoteDirectory, matches: result.stdout, stderr: result.stderr, code: result.code };
        });
      } catch (error) {
        return { error: errorMessage(error), host: profile.host };
      }
    }
  });
  const sudoCommands = createTool({
    name: "ssh_run_sudo_commands",
    description: `Run commands with sudo on the remote Linux host ${profile.username}@${profile.host}. This is a privileged operation with a separate approval policy. Pass commands without the sudo prefix.`,
    inputSchema: {
      type: "object",
      properties: { commands: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 20 } },
      required: ["commands"]
    },
    async execute(input, context) {
      try {
        const boundaryError = workspaceViolation("ssh_run_sudo_commands", input, profile.remoteDirectory, "posix");
        if (boundaryError) return { error: boundaryError, host: profile.host, directory: profile.remoteDirectory, privileged: true };
        return await withClient(profile, context.signal, async (client) => {
          const results = [];
          for (const command of input.commands) {
            const sudo = profile.sudoPassword ? `sudo -S -p '' -- sh -lc ${shellQuote(command)}` : `sudo -n -- sh -lc ${shellQuote(command)}`;
            const result = await execCommand(client, `cd -- ${shellQuote(profile.remoteDirectory)} && ${sudo}`, context.signal, profile.sudoPassword ? `${profile.sudoPassword}
` : void 0);
            results.push({ command, ...result });
          }
          return { host: profile.host, directory: profile.remoteDirectory, privileged: true, results };
        });
      } catch (error) {
        return { error: errorMessage(error), host: profile.host, privileged: true };
      }
    }
  });
  return profile.operatingSystem === "linux" && profile.sudoPermission !== "disabled" ? [runCommands, readFiles, writeFile6, searchFiles, sudoCommands] : [runCommands, readFiles, writeFile6, searchFiles];
}
async function connectConfig(profile) {
  const config = {
    host: profile.host,
    port: profile.port,
    username: profile.username,
    readyTimeout: 15e3,
    keepaliveInterval: 1e4,
    keepaliveCountMax: 3
  };
  if (profile.authType === "password") config.password = profile.password;
  else {
    if (!profile.keyPath) throw new Error("SSH private key path is missing");
    config.privateKey = await readFile5(profile.keyPath);
    config.passphrase = profile.passphrase;
  }
  if (profile.hostFingerprint) {
    const expected = normalizeFingerprint(profile.hostFingerprint);
    config.hostVerifier = (key) => {
      const actual = createHash2("sha256").update(key).digest("base64").replace(/=+$/, "");
      return safeEqual2(actual, expected);
    };
  }
  return config;
}
async function withClient(profile, signal, action) {
  const client = new Client();
  const abort = () => client.end();
  signal?.addEventListener("abort", abort, { once: true });
  try {
    await new Promise(async (resolve5, reject) => {
      client.once("ready", resolve5).once("error", reject);
      try {
        client.connect(await connectConfig(profile));
      } catch (error) {
        reject(error);
      }
    });
    if (signal?.aborted) throw new Error("SSH operation was aborted");
    return await action(client);
  } finally {
    signal?.removeEventListener("abort", abort);
    client.end();
  }
}
async function execCommand(client, command, signal, stdin) {
  return await new Promise((resolve5, reject) => {
    client.exec(command, (error, channel) => {
      if (error) {
        reject(error);
        return;
      }
      let stdout = Buffer.alloc(0);
      let stderr = Buffer.alloc(0);
      const append = (current, chunk) => current.length >= MAX_OUTPUT ? current : Buffer.concat([current, chunk]).subarray(0, MAX_OUTPUT);
      channel.on("data", (chunk) => {
        stdout = append(stdout, Buffer.from(chunk));
      });
      channel.stderr.on("data", (chunk) => {
        stderr = append(stderr, Buffer.from(chunk));
      });
      const abort = () => channel.close();
      signal?.addEventListener("abort", abort, { once: true });
      channel.once("error", reject);
      channel.once("close", (code, closeSignal) => {
        signal?.removeEventListener("abort", abort);
        resolve5({ stdout: stdout.toString("utf8"), stderr: stderr.toString("utf8"), code, signal: closeSignal });
      });
      if (stdin !== void 0) channel.end(stdin);
    });
  });
}
async function getSftp(client) {
  return await new Promise((resolve5, reject) => client.sftp((error, sftp) => error ? reject(error) : resolve5(sftp)));
}
async function sftpStat(sftp, path) {
  return await new Promise((resolve5, reject) => sftp.stat(path, (error, stats) => error ? reject(error) : resolve5({ size: stats.size })));
}
async function sftpReadFile(sftp, path) {
  return await new Promise((resolve5, reject) => sftp.readFile(path, (error, data) => error ? reject(error) : resolve5(Buffer.from(data))));
}
async function sftpWriteFile(sftp, path, data) {
  await new Promise((resolve5, reject) => sftp.writeFile(path, data, { mode: 384 }, (error) => error ? reject(error) : resolve5()));
}
function remotePath(root, requested) {
  const target = posix2.resolve(root, requested);
  const normalizedRoot = posix2.resolve(root);
  if (target !== normalizedRoot && !target.startsWith(`${normalizedRoot}/`)) throw new Error("Remote path must stay inside the workspace directory");
  return target;
}
function shellQuote(value) {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}
function containsSudoCommand(command) {
  const normalized = command.replace(/[\\'"`]/g, "");
  return /(^|[\s;&|()])(?:\/usr\/bin\/|\/bin\/)?sudo(?=\s|$)/i.test(normalized);
}
function matchesOperatingSystem(expected, uname) {
  const normalized = uname.trim().toLowerCase();
  if (expected === "linux") return normalized === "linux";
  if (expected === "macos") return normalized === "darwin";
  return normalized.length > 0 && normalized !== "windows_nt";
}
function normalizeFingerprint(value) {
  return value.trim().replace(/^SHA256:/i, "").replace(/=+$/, "");
}
function safeEqual2(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual2(a, b);
}
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

// src/stores/compaction-store.ts
import { mkdir as mkdir4, readFile as readFile6, writeFile as writeFile5 } from "fs/promises";
import { dirname as dirname4 } from "path";
var CompactionStore = class {
  constructor(filePath) {
    this.filePath = filePath;
  }
  filePath;
  document = { version: 1, sessions: {} };
  async load() {
    try {
      const value = JSON.parse(await readFile6(this.filePath, "utf8"));
      if (!isRecord6(value) || value.version !== 1 || !isRecord6(value.sessions)) throw new Error("Unsupported compaction history format");
      this.document = value;
    } catch (error) {
      if (!isNodeError4(error) || error.code !== "ENOENT") throw error;
    }
  }
  list(sessionId) {
    return (this.document.sessions[sessionId] ?? []).map((record) => ({ ...record }));
  }
  async record(sessionId, message) {
    const record = { at: (/* @__PURE__ */ new Date()).toISOString(), message };
    this.document.sessions[sessionId] = [...this.document.sessions[sessionId] ?? [], record].slice(-100);
    await this.persist();
    return { ...record };
  }
  async delete(sessionId) {
    if (!(sessionId in this.document.sessions)) return;
    delete this.document.sessions[sessionId];
    await this.persist();
  }
  async move(fromSessionId, toSessionId) {
    const records = this.document.sessions[fromSessionId];
    if (!records) return;
    this.document.sessions[toSessionId] = records;
    delete this.document.sessions[fromSessionId];
    await this.persist();
  }
  async copy(fromSessionId, toSessionId) {
    const records = this.document.sessions[fromSessionId];
    if (!records) return;
    this.document.sessions[toSessionId] = records.map((record) => ({ ...record }));
    await this.persist();
  }
  async persist() {
    await mkdir4(dirname4(this.filePath), { recursive: true });
    await writeFile5(this.filePath, `${JSON.stringify(this.document, null, 2)}
`, { encoding: "utf8", mode: 384 });
  }
};
function isRecord6(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isNodeError4(value) {
  return value instanceof Error && "code" in value;
}

// src/mcp-extension.ts
import { Client as Client2 } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
function buildMcpSettingsServers(servers, existing) {
  const result = {};
  for (const server of servers) {
    const transport = server.transport === "stdio" ? { type: "stdio", command: server.command, args: server.args } : server.transport === "sse" ? { type: "sse", url: server.url } : { type: "streamableHttp", url: server.url };
    const previous = isRecord7(existing[server.name]) ? existing[server.name] : {};
    result[server.name] = {
      ...previous.oauth !== void 0 ? { oauth: previous.oauth } : {},
      ...previous.oauthClient !== void 0 ? { oauthClient: previous.oauthClient } : {},
      transport,
      disabled: !server.enabled,
      metadata: { source: "cline-for-web" }
    };
  }
  return result;
}
function isRecord7(value) {
  return typeof value === "object" && value !== null;
}
function mcpServerNameForTool(toolName) {
  const separator = toolName.indexOf("__");
  return separator > 0 ? toolName.slice(0, separator) : void 0;
}
async function testMcpConnection(input, timeoutMs = 1e4, signal) {
  let client;
  try {
    if (signal?.aborted) throw new Error("Cancelled");
    const transport = buildTestTransport(input);
    client = new Client2({ name: "cline-for-web-mcp-test", version: "1.0.0" }, { capabilities: {} });
    await withTimeout(client.connect(transport), timeoutMs, "Connection timed out", signal);
    const tools = await withTimeout(client.listTools(), timeoutMs, "Listing tools timed out", signal);
    const info = client.getServerVersion();
    return {
      ok: true,
      toolCount: tools.tools.length,
      tools: tools.tools.map((tool) => ({ name: tool.name, description: tool.description })),
      serverName: info?.name,
      serverVersion: info?.version
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    if (client) await client.close().catch(() => {
    });
  }
}
function buildTestTransport(input) {
  if (input.transport === "stdio") {
    if (!input.command.trim()) throw new Error("Command is required");
    return new StdioClientTransport({ command: input.command, args: input.args, stderr: "ignore" });
  }
  if (!input.url.trim()) throw new Error("URL is required");
  const url = new URL(input.url);
  return input.transport === "sse" ? new SSEClientTransport(url) : new StreamableHTTPClientTransport(url);
}
async function withTimeout(promise, ms, message, signal) {
  let timer;
  let onAbort;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
      ...signal ? [new Promise((_, reject) => {
        onAbort = () => reject(new Error("Cancelled"));
        signal.addEventListener("abort", onAbort);
      })] : []
    ]);
  } finally {
    clearTimeout(timer);
    if (signal && onAbort) signal.removeEventListener("abort", onAbort);
  }
}

// src/runtime.ts
var SessionNotFoundError = class extends Error {
  constructor(sessionId) {
    super(`Session not found: ${sessionId}`);
    this.name = "SessionNotFoundError";
  }
};
var ClineRuntime = class _ClineRuntime {
  listeners = /* @__PURE__ */ new Set();
  approvals = /* @__PURE__ */ new Map();
  cline;
  connection;
  codexCredentials;
  codexLogin;
  codexAuth = { status: "idle" };
  agentSettings;
  latestInputTokens = /* @__PURE__ */ new Map();
  connectionStore;
  profileStore;
  compactionStore;
  dataDirectory;
  mcpSettingsPath;
  mcpToolCache = /* @__PURE__ */ new Map();
  promptQueues = /* @__PURE__ */ new Map();
  runningSessions = /* @__PURE__ */ new Set();
  queueWorkers = /* @__PURE__ */ new Set();
  settingsGeneration = 0;
  sessionSettingsGeneration = /* @__PURE__ */ new Map();
  constructor(cline, initialWorkspace2, allowedRoot2) {
    this.cline = cline;
    const dataDirectory = process.env.CLINE_DATA_DIR ?? resolve3(process.cwd(), ".cline-data");
    this.dataDirectory = dataDirectory;
    this.agentSettings = new AgentSettingsStore(initialWorkspace2, allowedRoot2, resolve3(dataDirectory, "agent-settings.json"));
    this.connectionStore = new ConnectionStore(resolve3(dataDirectory, "connection.json"));
    this.profileStore = new ProfileStore(resolve3(dataDirectory, "profiles.json"), resolve3(dataDirectory, "profiles.key"));
    this.compactionStore = new CompactionStore(resolve3(dataDirectory, "compactions.json"));
    this.mcpSettingsPath = resolve3(dataDirectory, "mcp-settings.json");
    process.env.CLINE_MCP_SETTINGS_PATH = this.mcpSettingsPath;
    this.cline.subscribe((event) => this.handleEvent(event));
  }
  static async create(initialWorkspace2, allowedRoot2) {
    let runtime2;
    const cline = await ClineCore.create({
      clientName: "cline-for-web",
      backendMode: "local",
      capabilities: {
        requestToolApproval: async (request) => {
          if (!runtime2) throw new Error("Runtime is not initialized");
          const currentDecision = runtime2.currentApprovalDecision(request.toolName);
          if (currentDecision !== void 0) return { approved: currentDecision };
          const approval = {
            id: `approval-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            sessionId: request.sessionId,
            toolName: request.toolName,
            input: request.input
          };
          return await new Promise((resolve5) => {
            runtime2?.addApproval({ approval, resolve: resolve5 });
          });
        }
      }
    });
    runtime2 = new _ClineRuntime(cline, initialWorkspace2, allowedRoot2);
    await runtime2.agentSettings.load().catch((error) => console.warn(`Saved agent settings could not be restored: ${errorMessage2(error)}`));
    await runtime2.profileStore.load();
    await runtime2.compactionStore.load();
    await runtime2.restoreConnection();
    if (runtime2.connection) await runtime2.profileStore.ensureModel(runtime2.connection);
    await runtime2.profileStore.ensureLocalWorkspace("Local workspace", initialWorkspace2);
    const activeWorkspace = runtime2.profileStore.activeWorkspace();
    if (activeWorkspace?.type === "local") await runtime2.agentSettings.update({ workspacePath: activeWorkspace.path });
    return runtime2;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  async list() {
    const sessions2 = await this.cline.list(200);
    const superseded = /* @__PURE__ */ new Set();
    for (const session of sessions2) {
      const continuedFrom = isRecord8(session.metadata) ? session.metadata.continuedFrom : void 0;
      if (typeof continuedFrom === "string") superseded.add(continuedFrom);
    }
    return sessions2.filter((session) => !superseded.has(session.sessionId)).slice(0, 50);
  }
  async session(sessionId) {
    const session = await this.cline.get(sessionId);
    if (!session) throw new SessionNotFoundError(sessionId);
    const usage = await this.cline.getAccumulatedUsage(sessionId).catch(() => null);
    const messages = await this.cline.readMessages(sessionId).catch(() => []);
    const persistedInput = findLatestRequestInputTokens(messages);
    const compactions = this.compactionStore.list(sessionId);
    return { session, usage, context: this.contextUsage(this.latestInputTokens.get(sessionId) ?? persistedInput), compactions, lastCompaction: compactions.at(-1) ?? null };
  }
  async messages(sessionId) {
    const messages = await this.cline.readMessages(sessionId).catch(() => []);
    if (messages.length > 0) return messages;
    const session = await this.cline.get(sessionId);
    const continuedFrom = isRecord8(session?.metadata) ? session.metadata.continuedFrom : void 0;
    return typeof continuedFrom === "string" ? await this.cline.readMessages(continuedFrom).catch(() => []) : messages;
  }
  pendingPrompts(sessionId) {
    return (this.promptQueues.get(sessionId) ?? []).map(({ images, ...item }) => ({ ...item, imageCount: images.length }));
  }
  updatePendingPrompt(sessionId, promptId, prompt) {
    if (typeof prompt !== "string" || !prompt.trim()) throw new Error("Prompt is required");
    const queue = this.promptQueues.get(sessionId);
    const index = queue?.findIndex((item) => item.id === promptId) ?? -1;
    if (!queue || index < 0) return void 0;
    const current = queue[index];
    if (!current) return void 0;
    const updated = { ...current, prompt: prompt.trim() };
    queue[index] = updated;
    this.emitQueue(sessionId);
    return { ...updated };
  }
  deletePendingPrompt(sessionId, promptId) {
    const queue = this.promptQueues.get(sessionId);
    const index = queue?.findIndex((item) => item.id === promptId) ?? -1;
    if (!queue || index < 0) return false;
    queue.splice(index, 1);
    if (queue.length === 0) this.promptQueues.delete(sessionId);
    this.emitQueue(sessionId);
    return true;
  }
  async rename(sessionId, title) {
    if (typeof title !== "string" || !title.trim()) throw new Error("Session title is required");
    if (title.trim().length > 120) throw new Error("Session title must be 120 characters or fewer");
    await this.cline.update(sessionId, { title: title.trim() });
  }
  async delete(sessionId) {
    this.clearPromptQueue(sessionId);
    await this.cline.delete(sessionId);
    await this.compactionStore.delete(sessionId);
  }
  async deleteAll() {
    const sessions2 = await this.cline.list(1e3);
    const failed = [];
    let deleted = 0;
    for (const session of sessions2) {
      try {
        await this.delete(session.sessionId);
        deleted++;
      } catch {
        failed.push(session.sessionId);
      }
    }
    await truncate(resolve3(this.dataDirectory, "logs", "hooks.jsonl"), 0).catch(() => {
    });
    return { deleted, failed };
  }
  agentSettingsInfo() {
    return this.agentSettings.get();
  }
  async createPromptTemplate(input) {
    const template = await this.agentSettings.createTemplate(input);
    this.settingsGeneration++;
    return template;
  }
  async updatePromptTemplate(id, input) {
    const template = await this.agentSettings.updateTemplate(id, input);
    this.settingsGeneration++;
    return template;
  }
  async deletePromptTemplate(id) {
    await this.agentSettings.deleteTemplate(id);
    this.settingsGeneration++;
  }
  async resetPromptTemplate(id) {
    const template = await this.agentSettings.resetTemplate(id);
    this.settingsGeneration++;
    return template;
  }
  /** Actually connects (spawns the stdio process, or hits the SSE/HTTP URL) using
   * whatever is currently in the form, before it's ever saved — the same
   * "test before you trust it" pattern as the SSH workspace test button. */
  async testMcpServer(input, signal) {
    if (!isRecord8(input)) throw new Error("MCP server config must be an object");
    const fields = parseMcpServerConnectionFields(input, "This MCP server");
    return await testMcpConnection(fields, 1e4, signal);
  }
  async previewSystemPrompt(template) {
    const settings = this.agentSettings.get();
    const source = typeof template === "string" && template.trim() ? template : this.agentSettings.effectiveSystemPrompt();
    const activeWorkspace = this.profileStore.activeWorkspace();
    const sshWorkspace = activeWorkspace?.type === "ssh" ? await this.profileStore.resolvedActiveSshWorkspace() : void 0;
    const variables = sshWorkspace ? {
      user: sshWorkspace.username,
      workspace: sshWorkspace.remoteDirectory,
      workspaceName: sshWorkspace.name,
      workspaceType: "ssh",
      os: sshWorkspace.operatingSystem,
      host: sshWorkspace.host
    } : localPromptVariables(settings.workspacePath, activeWorkspace?.name);
    return {
      variables,
      model: this.connection ? { provider: this.connection.provider, modelId: this.connection.modelId } : null,
      workspace: this.workspaceDisplay(),
      preview: buildWorkspaceSystemPrompt(`${source}${shellIdlePrompt(settings)}`, variables)
    };
  }
  async updateAgentSettings(input) {
    const settings = await this.agentSettings.update(input);
    this.settingsGeneration++;
    const activeWorkspace = this.profileStore.activeWorkspace();
    if (input.workspacePath !== void 0 && activeWorkspace?.type === "local") {
      await this.profileStore.saveLocalWorkspace({ id: activeWorkspace.id, name: activeWorkspace.name, path: settings.workspacePath });
      await this.profileStore.activateWorkspace(activeWorkspace.id);
    }
    return settings;
  }
  connectionInfo() {
    return publicConnection(this.connection);
  }
  contextInfo() {
    return this.contextUsage();
  }
  codexAuthInfo() {
    return { ...this.codexAuth, url: this.codexAuth.status === "waiting" ? this.codexAuth.url : void 0 };
  }
  async claudeCodeAuthInfo() {
    return await new Promise((resolve5) => {
      execFile("claude", ["auth", "status"], { timeout: 1e4, windowsHide: true }, (error, stdout, stderr) => {
        const output = stdout.trim();
        if (output) {
          try {
            const status = JSON.parse(output);
            if (status.loggedIn === true) {
              resolve5({ status: "authenticated", message: "Claude Code is signed in.", authMethod: typeof status.authMethod === "string" ? status.authMethod : void 0 });
              return;
            }
            resolve5({ status: "not_authenticated", message: "Claude Code is not signed in. Run: claude auth login" });
            return;
          } catch {
          }
        }
        const code = isRecord8(error) ? error.code : void 0;
        if (code === "ENOENT") resolve5({ status: "unavailable", message: "Claude Code CLI was not found. Install it, then run: claude auth login" });
        else resolve5({ status: "error", message: stderr.trim() || output || (error instanceof Error ? error.message : "Claude Code status check failed") });
      });
    });
  }
  async discover(input) {
    return await discoverModels(input);
  }
  profilesInfo() {
    return this.profileStore.list();
  }
  activeWorkspaceInfo() {
    return this.profileStore.activeWorkspace();
  }
  async configure(input) {
    const connection = await createConnection(input, this.codexCredentials);
    await this.connectionStore.save(connection);
    this.connection = connection;
    if (input.profileName !== void 0 || input.profileId !== void 0) {
      await this.profileStore.saveModel({ id: input.profileId, name: input.profileName, settings: connection });
    } else {
      await this.profileStore.ensureModel(connection);
    }
    this.settingsGeneration++;
    return this.connectionInfo();
  }
  async activateModelProfile(id) {
    const profile = this.profileStore.model(id);
    if (!profile) throw new Error("Model profile not found");
    if (profile.provider === "claude-code") {
      const auth = await this.claudeCodeAuthInfo();
      if (auth.status !== "authenticated") throw new Error(auth.message);
    }
    const connection = this.connectionFromProfile(profile);
    await this.connectionStore.save(connection);
    this.connection = connection;
    await this.profileStore.activateModel(id);
    this.settingsGeneration++;
    return { connection: this.connectionInfo(), profiles: this.profilesInfo() };
  }
  async updateModelProfile(id, patch) {
    const current = this.profileStore.model(id);
    if (!current) throw new Error("Model profile not found");
    const changingConnection = patch.baseUrl !== void 0 || patch.modelId !== void 0;
    let profile;
    if (changingConnection) {
      if (current.provider === "claude-code") {
        const auth = await this.claudeCodeAuthInfo();
        if (auth.status !== "authenticated") throw new Error(auth.message);
      }
      const timeoutMs = patch.timeoutMs !== void 0 ? patch.timeoutMs : current.timeoutMs;
      const imagesEnabled = patch.imagesEnabled !== void 0 ? patch.imagesEnabled : current.imagesEnabled;
      const request = {
        provider: current.provider,
        baseUrl: typeof patch.baseUrl === "string" && patch.baseUrl.trim() ? patch.baseUrl : current.baseUrl,
        modelId: typeof patch.modelId === "string" && patch.modelId.trim() ? patch.modelId : current.modelId,
        timeoutMs,
        imagesEnabled
      };
      const connection = await createConnection(request, this.codexCredentials);
      profile = await this.profileStore.updateModel(id, {
        name: patch.name,
        timeoutMs: connection.timeoutMs,
        imagesEnabled: connection.imagesEnabled,
        baseUrl: connection.baseUrl,
        modelId: connection.modelId,
        modelInfo: connection.modelInfo
      });
    } else {
      profile = await this.profileStore.updateModel(id, patch);
    }
    if (this.profileStore.list().activeModelProfileId === id) {
      const connection = this.connectionFromProfile(profile);
      await this.connectionStore.save(connection);
      this.connection = connection;
      this.settingsGeneration++;
    }
    return { profile, profiles: this.profilesInfo() };
  }
  connectionFromProfile(profile) {
    if (profile.provider === "codex") {
      if (!this.codexCredentials) throw new Error("Sign in with ChatGPT before activating this profile");
      return {
        provider: "codex",
        providerId: "openai-codex",
        baseUrl: profile.baseUrl,
        modelId: profile.modelId,
        apiKey: this.codexCredentials.access,
        codexCredentials: this.codexCredentials,
        modelInfo: profile.modelInfo,
        timeoutMs: profile.timeoutMs,
        imagesEnabled: profile.imagesEnabled === true
      };
    }
    if (profile.provider === "claude-code") {
      return { provider: "claude-code", providerId: "claude-code", baseUrl: "", modelId: profile.modelId, modelInfo: profile.modelInfo, timeoutMs: profile.timeoutMs, imagesEnabled: profile.imagesEnabled === true };
    }
    const providerId2 = profile.provider === "lmstudio" ? "lmstudio" : profile.provider === "ollama" ? "ollama" : "openai-compatible";
    return {
      provider: profile.provider,
      providerId: providerId2,
      baseUrl: profile.baseUrl,
      modelId: profile.modelId,
      apiKey: "local-model",
      modelInfo: profile.modelInfo,
      timeoutMs: profile.timeoutMs,
      imagesEnabled: profile.imagesEnabled === true
    };
  }
  async deleteModelProfile(id) {
    const wasActive = this.profileStore.list().activeModelProfileId === id;
    await this.profileStore.deleteModel(id);
    if (wasActive) {
      this.connection = void 0;
      await this.connectionStore.clear();
    }
  }
  async saveWorkspaceProfile(input) {
    if (input.type === "local") {
      const updated = await this.agentSettings.update({ workspacePath: input.path });
      const profile = await this.profileStore.saveLocalWorkspace({ id: input.id, name: input.name, path: updated.workspacePath });
      await this.profileStore.activateWorkspace(profile.id);
      this.settingsGeneration++;
      return { profile, profiles: this.profilesInfo() };
    }
    if (input.type === "ssh") {
      const profile = await this.profileStore.saveSshWorkspace(input);
      const test = await testSshWorkspace(await this.profileStore.resolveSshById(profile.id));
      await this.profileStore.activateWorkspace(profile.id);
      this.settingsGeneration++;
      return { profile, test, profiles: this.profilesInfo() };
    }
    throw new Error("Workspace type must be local or ssh");
  }
  async activateWorkspaceProfile(id) {
    const profile = this.profileStore.list().workspaces.find((item) => item.id === id);
    if (!profile) throw new Error("Workspace profile not found");
    let test;
    if (profile.type === "local") await this.agentSettings.update({ workspacePath: profile.path });
    else test = await testSshWorkspace(await this.profileStore.resolveSshById(id));
    const active = await this.profileStore.activateWorkspace(id);
    this.settingsGeneration++;
    return { profile: active, test, profiles: this.profilesInfo() };
  }
  async testWorkspaceProfile(id) {
    return await testSshWorkspace(await this.profileStore.resolveSshById(id));
  }
  async deleteWorkspaceProfile(id) {
    if (this.profileStore.list().activeWorkspaceProfileId === id) throw new Error("Switch to another workspace before deleting the active profile");
    await this.profileStore.deleteWorkspace(id);
  }
  async restoreConnection() {
    try {
      const saved = await this.connectionStore.load();
      if (!saved) return;
      if (saved.provider === "claude-code") {
        const auth = await this.claudeCodeAuthInfo();
        if (auth.status !== "authenticated") return;
      }
      this.connection = saved;
    } catch (error) {
      console.warn(`Saved AI connection could not be restored: ${errorMessage2(error)}`);
    }
  }
  async beginCodexLogin() {
    if (this.codexCredentials) return this.codexAuthInfo();
    if (this.codexLogin) return this.codexAuthInfo();
    this.codexAuth = { status: "starting", message: "Starting ChatGPT sign-in..." };
    let markReady = () => {
    };
    const ready = new Promise((resolve5) => {
      markReady = resolve5;
    });
    this.codexLogin = loginOpenAICodex({
      originator: "cline-for-web",
      onAuth: ({ url, instructions }) => {
        this.codexAuth = { status: "waiting", url, message: instructions ?? "Complete sign-in in the opened browser window." };
        markReady();
      },
      onProgress: (message) => {
        this.codexAuth = { ...this.codexAuth, message };
      },
      onPrompt: async (prompt) => {
        throw new Error(`Manual OAuth input is not supported: ${prompt.message}`);
      }
    }).then((credentials) => {
      this.codexCredentials = credentials;
      this.codexAuth = { status: "authenticated", message: "Signed in with ChatGPT.", email: credentials.email };
    }).catch((error) => {
      this.codexAuth = { status: "error", message: errorMessage2(error) };
    }).finally(() => {
      this.codexLogin = void 0;
    });
    await Promise.race([ready, this.codexLogin]);
    return this.codexAuthInfo();
  }
  async start(prompt, userImages) {
    try {
      const config = await this.config();
      if (!this.connection) throw new Error("AI provider is not configured");
      const images = validateUserImages(userImages, this.connection.imagesEnabled === true);
      const result = await this.cline.start({
        prompt,
        userImages: images.length ? images : void 0,
        interactive: true,
        config,
        toolPolicies: config.toolPolicies,
        sessionMetadata: this.sessionMetadata(void 0, config.systemPrompt)
      });
      this.sessionSettingsGeneration.set(result.sessionId, this.settingsGeneration);
      return result.sessionId;
    } catch (error) {
      this.emit({ type: "cline_error", sessionId: "unknown", data: errorMessage2(error) });
      throw error;
    }
  }
  async send(sessionId, prompt, userImages) {
    if (!this.runningSessions.has(sessionId)) sessionId = await this.refreshSessionSettings(sessionId);
    if (!this.connection) throw new Error("AI provider is not configured");
    const images = validateUserImages(userImages, this.connection.imagesEnabled === true);
    const queue = this.promptQueues.get(sessionId) ?? [];
    queue.push({ id: `queue-${Date.now()}-${Math.random().toString(36).slice(2)}`, prompt, images, createdAt: Date.now() });
    this.promptQueues.set(sessionId, queue);
    this.emitQueue(sessionId);
    void this.drainPromptQueue(sessionId);
    return sessionId;
  }
  async abort(sessionId) {
    await this.cline.abort(sessionId, "Stopped from web UI");
  }
  async dispose() {
    await this.cline.dispose("Server shutting down");
  }
  pendingApprovals() {
    return [...this.approvals.values()].map(({ approval }) => approval);
  }
  approve(id, approved) {
    const waiter = this.approvals.get(id);
    if (!waiter) return false;
    this.approvals.delete(id);
    waiter.resolve({ approved });
    return true;
  }
  currentApprovalDecision(toolName) {
    const permissionKey = {
      ssh_read_files: "read_files",
      ssh_search_files: "search_codebase",
      ssh_run_commands: "run_commands",
      ssh_write_file: "editor"
    }[toolName] ?? toolName;
    const permissions = this.agentSettings.effectivePermissions();
    const permission = permissions[permissionKey];
    if (permission === "allow") return true;
    if (permission === "disabled") return false;
    if (toolName === "ssh_run_sudo_commands") {
      const workspace = this.profileStore.activeWorkspace();
      if (workspace?.type !== "ssh" || workspace.sudoPermission === "disabled") return false;
      if (workspace.sudoPermission === "allow") return true;
    }
    const mcpServerName = mcpServerNameForTool(toolName);
    if (mcpServerName) {
      const server = this.agentSettings.get().mcpServers.find((item) => item.name === mcpServerName && item.enabled);
      if (server?.autoApprove) return true;
    }
    return void 0;
  }
  addApproval(waiter) {
    this.approvals.set(waiter.approval.id, waiter);
    this.emit({ type: "approval", sessionId: waiter.approval.sessionId, data: waiter.approval });
  }
  emitQueue(sessionId) {
    this.emit({ type: "queue", sessionId, data: { prompts: this.pendingPrompts(sessionId) } });
  }
  clearPromptQueue(sessionId) {
    this.promptQueues.delete(sessionId);
    this.emitQueue(sessionId);
  }
  async drainPromptQueue(sessionId) {
    if (this.runningSessions.has(sessionId) || this.queueWorkers.has(sessionId)) return;
    this.queueWorkers.add(sessionId);
    try {
      while (!this.runningSessions.has(sessionId)) {
        const queue = this.promptQueues.get(sessionId);
        if (!queue?.length) {
          this.promptQueues.delete(sessionId);
          this.emitQueue(sessionId);
          break;
        }
        const replacement = await this.refreshSessionSettings(sessionId);
        if (replacement !== sessionId) {
          this.promptQueues.delete(sessionId);
          this.promptQueues.set(replacement, [...this.promptQueues.get(replacement) ?? [], ...queue]);
          this.emitQueue(sessionId);
          this.emitQueue(replacement);
          void this.drainPromptQueue(replacement);
          return;
        }
        const next = queue.shift();
        if (!next) continue;
        this.emitQueue(sessionId);
        this.runningSessions.add(sessionId);
        this.emit({ type: "prompt_started", sessionId, data: { ...next, imageCount: next.images.length } });
        try {
          await this.cline.send({ sessionId, prompt: next.prompt, userImages: next.images.length ? next.images : void 0 });
        } catch (error) {
          this.emit({ type: "cline_error", sessionId, data: errorMessage2(error) });
        } finally {
          this.runningSessions.delete(sessionId);
        }
      }
    } finally {
      this.queueWorkers.delete(sessionId);
      if (!this.runningSessions.has(sessionId) && (this.promptQueues.get(sessionId)?.length ?? 0) > 0) void this.drainPromptQueue(sessionId);
    }
  }
  async refreshSessionSettings(sessionId) {
    const knownToCurrentRuntime = this.sessionSettingsGeneration.has(sessionId);
    const applied = this.sessionSettingsGeneration.get(sessionId) ?? 0;
    const previous = await this.cline.get(sessionId);
    if (!previous) throw new Error(`Session not found: ${sessionId}`);
    const active = previous.status === "running" || previous.status === "idle" || previous.status === "pending";
    if (knownToCurrentRuntime && applied === this.settingsGeneration && active) return sessionId;
    const messages = await this.cline.readMessages(sessionId);
    const config = await this.config();
    if (!this.connection) throw new Error("AI provider is not configured");
    const result = await this.cline.start({
      interactive: true,
      config,
      toolPolicies: config.toolPolicies,
      initialMessages: messages,
      sessionMetadata: this.sessionMetadata(sessionId, config.systemPrompt)
    });
    this.sessionSettingsGeneration.set(result.sessionId, this.settingsGeneration);
    this.runningSessions.delete(result.sessionId);
    const title = previous.metadata?.title ?? previous.title;
    if (typeof title === "string" && title) await this.cline.update(result.sessionId, { title }).catch(() => {
    });
    await this.compactionStore.copy(sessionId, result.sessionId);
    this.emit({ type: "session_replaced", sessionId, data: { sessionId: result.sessionId } });
    return result.sessionId;
  }
  /** Keeps cline_mcp_settings.json in step with the saved MCP server list right
   * before every session start/send — see the note atop mcp-extension.ts for
   * why this file, not AgentPlugin.registerMcpServer(), is what actually wires
   * MCP tools into the model. Failure here degrades to "no MCP tools this
   * turn" rather than blocking the turn outright. */
  async syncMcpSettingsFile(servers) {
    try {
      await updateMcpSettingsFile(this.mcpSettingsPath, (raw) => {
        const current = isRecord8(raw.mcpServers) ? raw.mcpServers : {};
        raw.mcpServers = buildMcpSettingsServers(servers, current);
        return raw;
      });
    } catch (error) {
      console.error(`Failed to sync MCP settings file: ${errorMessage2(error)}`);
    }
  }
  /** MCP tool names not present in `toolPolicies` bypass approval entirely by
   * default (verified: a real tool call went through with no approval event,
   * even with autoApprove off) — ClineCore's approval gate only ever engages
   * for tools it has an explicit policy for. Since the exact `<server>__<tool>`
   * names aren't known until a server is actually connected, this discovers
   * them the same way the "test connection" button does and caches the result
   * per server config, so a normal turn only pays the connect cost once. */
  async resolveMcpToolPolicies(servers) {
    const policies = {};
    const seen = /* @__PURE__ */ new Set();
    for (const server of servers) {
      if (!server.enabled) continue;
      seen.add(server.id);
      const signature = JSON.stringify({ transport: server.transport, command: server.command, args: server.args, url: server.url });
      let cached = this.mcpToolCache.get(server.id);
      if (!cached || cached.signature !== signature) {
        const result = await testMcpConnection({ transport: server.transport, command: server.command, args: server.args, url: server.url }, 8e3);
        cached = { signature, toolNames: result.ok ? result.tools.map((tool) => tool.name) : [] };
        this.mcpToolCache.set(server.id, cached);
      }
      for (const toolName of cached.toolNames) policies[`${server.name}__${toolName}`] = { enabled: !server.disabledTools.includes(toolName), autoApprove: server.autoApprove };
    }
    for (const id of [...this.mcpToolCache.keys()]) if (!seen.has(id)) this.mcpToolCache.delete(id);
    return policies;
  }
  async config() {
    if (!this.connection) throw new Error("AI provider is not configured");
    if (this.connection.provider === "codex") {
      const credentials = await getValidOpenAICodexCredentials(this.codexCredentials ?? null);
      if (!credentials) {
        this.codexCredentials = void 0;
        this.connection = void 0;
        this.codexAuth = { status: "idle", message: "ChatGPT sign-in expired. Sign in again." };
        throw new Error("ChatGPT sign-in expired. Sign in again.");
      }
      this.codexCredentials = credentials;
      this.connection = { ...this.connection, apiKey: credentials.access, codexCredentials: credentials };
    }
    const codexCredentials = this.connection.codexCredentials;
    const settings = this.agentSettings.get();
    const effectivePermissions = this.agentSettings.effectivePermissions();
    const activeWorkspace = this.profileStore.activeWorkspace();
    const sshWorkspace = activeWorkspace?.type === "ssh" ? await this.profileStore.resolvedActiveSshWorkspace() : void 0;
    const toolPolicies = this.agentSettings.policies();
    if (sshWorkspace) {
      for (const tool of ["read_files", "search_codebase", "run_commands", "editor", "apply_patch"]) {
        toolPolicies[tool] = { enabled: false, autoApprove: false };
      }
      toolPolicies.ssh_read_files = permissionPolicy(effectivePermissions.read_files);
      toolPolicies.ssh_search_files = permissionPolicy(effectivePermissions.search_codebase);
      toolPolicies.ssh_run_commands = permissionPolicy(effectivePermissions.run_commands);
      toolPolicies.ssh_write_file = permissionPolicy(effectivePermissions.editor);
      toolPolicies.ssh_run_sudo_commands = permissionPolicy(sshWorkspace.sudoPermission);
    }
    if (settings.mcpEnabled) Object.assign(toolPolicies, await this.resolveMcpToolPolicies(settings.mcpServers));
    const modelInfo = this.effectiveModelInfo();
    const sshPrompt = sshWorkspace ? [
      "",
      "The active workspace is a remote Linux workspace over SSH.",
      `Target: ${sshWorkspace.username}@${sshWorkspace.host}:${sshWorkspace.port}`,
      `Configured remote OS: ${sshWorkspace.operatingSystem}`,
      `Remote workspace root: ${sshWorkspace.remoteDirectory}`,
      "Use the available ssh_* tools instead of local file or command tools for workspace operations.",
      sshWorkspace.operatingSystem === "linux" && sshWorkspace.sudoPermission !== "disabled" ? "For commands requiring sudo, use ssh_run_sudo_commands without adding a sudo prefix. Never try sudo through ssh_run_commands." : "Do not use sudo or other privilege escalation commands.",
      "Never use local file or command tools for this task. Keep all paths inside the remote workspace root."
    ].join("\n") : "";
    const promptVariables = sshWorkspace ? {
      user: sshWorkspace.username,
      workspace: sshWorkspace.remoteDirectory,
      workspaceName: sshWorkspace.name,
      workspaceType: "ssh",
      os: sshWorkspace.operatingSystem,
      host: sshWorkspace.host
    } : localPromptVariables(settings.workspacePath, activeWorkspace?.name);
    const guardedWorkspace = sshWorkspace?.remoteDirectory ?? settings.workspacePath;
    const systemPrompt = buildWorkspaceSystemPrompt(`${this.agentSettings.effectiveSystemPrompt()}${shellIdlePrompt(settings)}${sshPrompt}`, promptVariables);
    await this.syncMcpSettingsFile(settings.mcpServers);
    return {
      providerId: this.connection.providerId,
      modelId: this.connection.modelId,
      apiKey: this.connection.apiKey,
      baseUrl: this.connection.baseUrl,
      providerConfig: codexCredentials || this.connection.timeoutMs ? {
        providerId: this.connection.providerId,
        modelId: this.connection.modelId,
        baseUrl: this.connection.baseUrl,
        apiKey: this.connection.apiKey,
        timeoutMs: this.connection.timeoutMs,
        ...codexCredentials ? {
          accessToken: codexCredentials.access,
          refreshToken: codexCredentials.refresh,
          accountId: codexCredentials.accountId
        } : {}
      } : void 0,
      knownModels: { [this.connection.modelId]: modelInfo },
      cwd: settings.workspacePath,
      workspaceRoot: settings.workspacePath,
      systemPrompt,
      maxIterations: settings.maxIterations,
      thinking: true,
      enableTools: true,
      enableSpawnAgent: false,
      enableAgentTeams: false,
      toolPolicies,
      extraTools: sshWorkspace ? createSshTools(sshWorkspace) : void 0,
      hooks: createWorkspaceGuardHooks(guardedWorkspace, sshWorkspace ? "posix" : void 0),
      disableMcpSettingsTools: !settings.mcpEnabled,
      compaction: {
        enabled: settings.compactionEnabled,
        strategy: settings.compactionStrategy,
        preserveRecentTokens: this.effectivePreserveRecentTokens()
      }
    };
  }
  workspaceDisplay() {
    const workspace = this.profileStore.activeWorkspace();
    if (!workspace) return this.agentSettings.get().workspacePath;
    return workspace.type === "local" ? workspace.path : `${workspace.username}@${workspace.host}:${workspace.remoteDirectory}`;
  }
  sessionMetadata(continuedFrom, effectiveSystemPrompt) {
    if (!this.connection) throw new Error("AI provider is not configured");
    const settings = this.agentSettings.get();
    const profiles = this.profileStore.list();
    const modelProfile = profiles.models.find((profile) => profile.id === profiles.activeModelProfileId);
    const workspaceProfile = this.profileStore.activeWorkspace();
    const activeTemplate = this.agentSettings.effectiveTemplate();
    const modePermissions = activeTemplate.permissions;
    const modePermissionPreset = activeTemplate.permissionPreset;
    const effectivePermissions = { ...modePermissions };
    if (workspaceProfile?.type === "ssh") {
      effectivePermissions.read_files = "disabled";
      effectivePermissions.search_codebase = "disabled";
      effectivePermissions.run_commands = "disabled";
      effectivePermissions.editor = "disabled";
      effectivePermissions.apply_patch = "disabled";
      effectivePermissions.ssh_read_files = modePermissions.read_files;
      effectivePermissions.ssh_search_files = modePermissions.search_codebase;
      effectivePermissions.ssh_run_commands = modePermissions.run_commands;
      effectivePermissions.ssh_write_file = modePermissions.editor;
      effectivePermissions.ssh_run_sudo_commands = workspaceProfile.sudoPermission;
    }
    return {
      appProvider: this.connection.provider,
      appModelId: this.connection.modelId,
      modelProfileId: profiles.activeModelProfileId ?? "",
      workspaceProfileId: profiles.activeWorkspaceProfileId ?? "",
      workspace: this.workspaceDisplay(),
      ...continuedFrom ? { continuedFrom } : {},
      environmentSnapshot: {
        version: 1,
        capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
        model: {
          profileId: profiles.activeModelProfileId ?? null,
          profileName: modelProfile?.name ?? this.connection.modelId,
          provider: this.connection.provider,
          modelId: this.connection.modelId
        },
        workspace: workspaceProfile ? { ...workspaceProfile, display: this.workspaceDisplay() } : {
          profileId: null,
          name: "Workspace",
          type: "local",
          path: settings.workspacePath,
          display: settings.workspacePath
        },
        agent: {
          systemPrompt: effectiveSystemPrompt ?? activeTemplate.prompt,
          systemPromptTemplate: activeTemplate.prompt,
          templateId: activeTemplate.id,
          templateName: activeTemplate.name,
          permissionPreset: modePermissionPreset,
          permissions: { ...modePermissions },
          effectivePermissions,
          maxIterations: settings.maxIterations,
          compactionEnabled: settings.compactionEnabled,
          compactionStrategy: settings.compactionStrategy,
          preserveRecentTokens: settings.preserveRecentTokens,
          contextWindowOverride: settings.contextWindowOverride,
          requestTimeoutMs: this.connection.timeoutMs ?? null,
          imagesEnabled: this.connection.imagesEnabled === true,
          imageSupport: this.connection.modelInfo?.imageSupport ?? "unknown",
          shellIdleTimeoutSeconds: settings.shellIdleTimeoutSeconds,
          shellIdleAction: settings.shellIdleAction,
          shellIdleCarryContext: settings.shellIdleCarryContext,
          mcpEnabled: settings.mcpEnabled,
          mcpServers: settings.mcpServers.map(({ name, enabled, transport }) => ({ name, enabled, transport }))
        }
      }
    };
  }
  effectiveModelInfo() {
    if (!this.connection) throw new Error("AI provider is not configured");
    const detected = this.connection.modelInfo ?? { id: this.connection.modelId, name: this.connection.modelId };
    const capabilities = new Set(Array.isArray(detected.capabilities) ? detected.capabilities : []);
    if (this.connection.imagesEnabled) capabilities.add("images");
    else capabilities.delete("images");
    const effective = { ...detected, capabilities: [...capabilities] };
    const override = this.agentSettings.get().contextWindowOverride;
    return override ? { ...effective, contextWindow: override, maxInputTokens: Math.floor(override * 0.9) } : effective;
  }
  contextUsage(inputTokens) {
    const settings = this.agentSettings.get();
    const detected = this.connection?.modelInfo;
    const override = settings.contextWindowOverride;
    const contextWindow = override ?? detected?.contextWindow ?? null;
    const maxInputTokens = override ? Math.floor(override * 0.9) : detected?.maxInputTokens ?? (contextWindow ? Math.floor(contextWindow * 0.9) : 128e3);
    return {
      inputTokens: inputTokens ?? null,
      contextWindow,
      maxInputTokens,
      utilizationPercent: inputTokens === void 0 ? null : Math.round(inputTokens / maxInputTokens * 1e4) / 100,
      compactionEnabled: settings.compactionEnabled,
      compactionTriggerPercent: 90,
      compactionTriggerTokens: Math.floor(maxInputTokens * 0.9),
      compactionStrategy: settings.compactionStrategy,
      preserveRecentTokens: this.effectivePreserveRecentTokens(maxInputTokens),
      source: override ? "override" : detected?.contextWindow || detected?.maxInputTokens ? "provider" : "sdk-default"
    };
  }
  effectivePreserveRecentTokens(maxInputTokens) {
    const configured = this.agentSettings.get().preserveRecentTokens;
    if (maxInputTokens === void 0) {
      const model = this.effectiveModelInfo();
      maxInputTokens = model.maxInputTokens ?? (model.contextWindow ? Math.floor(model.contextWindow * 0.9) : 128e3);
    }
    return Math.min(configured, Math.max(1e3, Math.floor(maxInputTokens * 0.5)));
  }
  handleEvent(event) {
    if (event.type === "agent_event") {
      const { sessionId, event: agentEvent } = event.payload;
      if (agentEvent.type === "content_start" && agentEvent.contentType === "text") this.emit({ type: "text", sessionId, data: agentEvent.text ?? "" });
      if (agentEvent.type === "content_start" && agentEvent.contentType === "reasoning") this.emit({ type: "reasoning", sessionId, data: { text: agentEvent.reasoning ?? "", redacted: Boolean(agentEvent.redacted) } });
      if (agentEvent.type === "content_start" && agentEvent.contentType === "tool") this.emit({ type: "tool", sessionId, data: { toolCallId: agentEvent.toolCallId, toolName: agentEvent.toolName, input: agentEvent.input } });
      if (agentEvent.type === "content_end" && agentEvent.contentType === "tool") this.emit({ type: "tool_result", sessionId, data: { toolCallId: agentEvent.toolCallId, toolName: agentEvent.toolName, output: agentEvent.output, error: agentEvent.error, durationMs: agentEvent.durationMs } });
      if (agentEvent.type === "iteration_start") this.emit({ type: "iteration", sessionId, data: agentEvent.iteration });
      if (agentEvent.type === "usage") {
        this.latestInputTokens.set(sessionId, agentEvent.inputTokens);
        this.emit({ type: "usage", sessionId, data: { ...this.contextUsage(agentEvent.inputTokens), outputTokens: agentEvent.outputTokens, totalInputTokens: agentEvent.totalInputTokens, totalOutputTokens: agentEvent.totalOutputTokens } });
      }
      if (agentEvent.type === "done") {
        this.markSessionIdle(sessionId);
        this.emit({ type: "turn_finished", sessionId, data: agentEvent });
      }
      if (agentEvent.type === "notice") {
        if (agentEvent.reason === "auto_compaction") {
          void this.compactionStore.record(sessionId, agentEvent.message).then((record) => {
            this.emit({ type: "status", sessionId, data: { reason: agentEvent.reason, ...record, count: this.compactionStore.list(sessionId).length } });
          }).catch((error) => {
            console.warn(`Compaction event could not be saved: ${errorMessage2(error)}`);
            this.emit({ type: "status", sessionId, data: { message: agentEvent.message, reason: agentEvent.reason, at: (/* @__PURE__ */ new Date()).toISOString() } });
          });
        } else this.emit({ type: "status", sessionId, data: { message: agentEvent.message, reason: agentEvent.reason } });
      }
      if (agentEvent.type === "error") this.emit({ type: "cline_error", sessionId, data: errorMessage2(agentEvent.error) });
    } else if (event.type === "status") {
      const { sessionId, status } = event.payload;
      if (status === "running") this.runningSessions.add(sessionId);
      if (status === "idle") this.markSessionIdle(sessionId);
      this.emit({ type: "status", sessionId, data: status });
    } else if (event.type === "ended") {
      this.markSessionIdle(event.payload.sessionId);
      this.emit({ type: "ended", sessionId: event.payload.sessionId, data: event.payload.reason });
    }
  }
  markSessionIdle(sessionId) {
    this.runningSessions.delete(sessionId);
    void this.drainPromptQueue(sessionId);
  }
  emit(event) {
    for (const listener of this.listeners) listener(event);
  }
};
function errorMessage2(error) {
  return error instanceof Error ? error.message : String(error);
}
function permissionPolicy(permission) {
  return permission === "disabled" ? { enabled: false, autoApprove: false } : { enabled: true, autoApprove: permission === "allow" };
}
function shellIdlePrompt(settings) {
  const action = {
    ask: "stop and ask the user which action is safe",
    enter: "send a single Enter key only when the prompt is clearly safe and non-destructive; otherwise ask the user",
    wait: "wait once for more output, then ask the user instead of waiting indefinitely",
    close: "stop/cancel the command and explain why",
    auto: "decide for yourself without asking the user: read the recent shell output, judge whether it is safe, and choose to wait longer, send a single safe key (e.g. Enter), or cancel the command"
  }[settings.shellIdleAction];
  const autoCarryNote = settings.shellIdleAction !== "auto" ? "" : settings.shellIdleCarryContext ? " After deciding, you may keep referring to that shell output normally in your reasoning and response." : " After deciding, do not quote or restate the shell output in your response or later reasoning \u2014 report only the action you took in one short line, and treat the incident as resolved.";
  return [
    "",
    `Shell inactivity policy: if a command appears to wait for input or produces no progress for about ${settings.shellIdleTimeoutSeconds} seconds, do not leave it unattended. ${action}.${autoCarryNote}`,
    "Before using any interactive response, inspect the command and never confirm a destructive, credential, license, or privilege-escalation prompt automatically."
  ].join("\n");
}
function isRecord8(value) {
  return typeof value === "object" && value !== null;
}
function findLatestRequestInputTokens(messages) {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (!message || typeof message !== "object") continue;
    const metrics = "metrics" in message && message.metrics && typeof message.metrics === "object" ? message.metrics : void 0;
    if (metrics && "inputTokens" in metrics && typeof metrics.inputTokens === "number") return metrics.inputTokens;
  }
  return void 0;
}
var allowedImageTypes = /* @__PURE__ */ new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
var maxImageBytes = 5 * 1024 * 1024;
var maxImagesPerMessage = 4;
function validateUserImages(value, enabled) {
  if (value === void 0 || value === null) return [];
  if (!Array.isArray(value)) throw new Error("Images must be an array");
  if (value.length === 0) return [];
  if (!enabled) throw new Error("Image input is disabled for the active model profile");
  if (value.length > maxImagesPerMessage) throw new Error(`Attach no more than ${maxImagesPerMessage} images per message`);
  return value.map((item) => {
    if (typeof item !== "string") throw new Error("Invalid image attachment");
    const match = item.match(/^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/i);
    if (!match?.[1] || !match[2] || !allowedImageTypes.has(match[1].toLowerCase())) throw new Error("Images must be PNG, JPEG, WebP, or GIF data");
    if (Buffer.byteLength(match[2], "base64") > maxImageBytes) throw new Error("Each image must be 5 MB or smaller");
    return item;
  });
}

// src/server.ts
try {
  process.loadEnvFile();
} catch {
}
var packageRoot = resolve4(dirname5(fileURLToPath(import.meta.url)), "..");
var thisFile = await realpath2(fileURLToPath(import.meta.url));
var isMainModule = process.argv[1] !== void 0 && thisFile === await realpath2(resolve4(process.argv[1])).catch(() => null);
var cli = isMainModule ? parseArgs(process.argv.slice(2)) : { flags: /* @__PURE__ */ new Map(), positional: [] };
if (isMainModule) {
  if (cli.flags.has("add-user")) {
    const [username, password] = cli.positional;
    if (!username || !password) {
      console.error("Usage: clinehub-for-web --add-user <username> <password>");
      process.exit(1);
    }
    await addUser(username, password);
    console.log(`Saved CLINEHUB_USER/CLINEHUB_PASSWORD to .env. Restart the server for login to take effect.`);
    process.exit(0);
  }
  if (cli.flags.has("remove-user")) {
    await removeUser();
    console.log("Removed CLINEHUB_USER/CLINEHUB_PASSWORD from .env. Restart the server for the login gate to turn off.");
    process.exit(0);
  }
}
process.env.CLINE_DATA_DIR ??= resolve4(process.cwd(), ".cline-data");
var app = new Hono();
var SESSION_COOKIE = "clinehub_session";
var initialWorkspace = await realpath2(resolve4(process.env.CLINE_WORKSPACE_ROOT ?? process.cwd()));
var allowedRoot = process.env.CLINE_ALLOWED_ROOT ? await realpath2(resolve4(process.env.CLINE_ALLOWED_ROOT)) : "";
var runtime = await ClineRuntime.create(initialWorkspace, allowedRoot);
var clients = /* @__PURE__ */ new Set();
runtime.subscribe((event) => {
  for (const send of clients) send(event);
});
app.onError((error, c) => {
  if (error instanceof SessionNotFoundError) return c.json({ error: error.message }, 404);
  console.error("HTTP API error", error);
  return c.json({ error: error instanceof Error ? error.message : String(error) }, 500);
});
app.get("/api/auth/status", (c) => c.json({ required: authRequired(), authenticated: !authRequired() || isValidSession(getCookie(c, SESSION_COOKIE)) }));
app.post("/api/auth/login", async (c) => {
  if (!authRequired()) return c.json({ ok: true });
  const body = await c.req.json().catch(() => ({}));
  if (typeof body.username !== "string" || typeof body.password !== "string" || !verifyCredentials(body.username, body.password)) {
    return c.json({ error: "Invalid username or password" }, 401);
  }
  setCookie(c, SESSION_COOKIE, createSession(), { httpOnly: true, sameSite: "Lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return c.json({ ok: true });
});
app.post("/api/auth/logout", (c) => {
  destroySession(getCookie(c, SESSION_COOKIE));
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});
app.use("/api/*", async (c, next) => {
  if (!authRequired() || c.req.path.startsWith("/api/auth/") || c.req.path === "/api/languages") return next();
  if (!isValidSession(getCookie(c, SESSION_COOKIE))) return c.json({ error: "Authentication required" }, 401);
  return next();
});
app.get("/api/languages", async (c) => {
  const files = await readdir(resolve4(packageRoot, "setting", "language")).catch(() => []);
  return c.json({ locales: files.filter((file) => file.endsWith(".json")).map((file) => file.slice(0, -5)) });
});
app.use("/setting/language/*", serveStatic({ root: packageRoot }));
app.get("/api/sessions", async (c) => c.json(await runtime.list()));
app.delete("/api/sessions", async (c) => c.json(await runtime.deleteAll()));
app.get("/api/agent-settings", (c) => c.json(runtime.agentSettingsInfo()));
app.patch("/api/agent-settings", async (c) => c.json(await runtime.updateAgentSettings(await c.req.json())));
app.get("/api/browse-directory", async (c) => {
  const requested = c.req.query("path");
  const target = requested && requested.trim() ? resolve4(requested.trim()) : initialWorkspace;
  const real = await realpath2(target).catch(() => null);
  if (!real) return c.json({ error: "Path not found" }, 404);
  if (!isWithin(allowedRoot, real)) return c.json({ error: `Must be inside: ${allowedRoot}` }, 400);
  const entries = await readdir(real, { withFileTypes: true }).catch(() => null);
  if (!entries) return c.json({ error: "Cannot read this directory" }, 400);
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort((a, b) => a.localeCompare(b));
  const parentPath = dirname5(real);
  const parent = parentPath !== real && isWithin(allowedRoot, parentPath) ? parentPath : null;
  return c.json({ path: real, parent, directories });
});
app.post("/api/agent-settings/preview", async (c) => {
  const body = await c.req.json();
  return c.json(await runtime.previewSystemPrompt(body.template));
});
app.post("/api/agent-settings/mcp/test", async (c) => c.json(await runtime.testMcpServer(await c.req.json(), c.req.raw.signal)));
app.post("/api/agent-settings/templates", async (c) => c.json(await runtime.createPromptTemplate(await c.req.json())));
app.patch("/api/agent-settings/templates/:id", async (c) => c.json(await runtime.updatePromptTemplate(c.req.param("id"), await c.req.json())));
app.delete("/api/agent-settings/templates/:id", async (c) => {
  await runtime.deletePromptTemplate(c.req.param("id"));
  return c.json({ ok: true });
});
app.post("/api/agent-settings/templates/:id/reset", async (c) => c.json(await runtime.resetPromptTemplate(c.req.param("id"))));
app.get("/api/config", (c) => c.json(runtime.connectionInfo()));
app.get("/api/profiles", (c) => c.json(runtime.profilesInfo()));
app.post("/api/profiles/models/:id/activate", async (c) => c.json(await runtime.activateModelProfile(c.req.param("id"))));
app.patch("/api/profiles/models/:id", async (c) => c.json(await runtime.updateModelProfile(c.req.param("id"), await c.req.json())));
app.delete("/api/profiles/models/:id", async (c) => {
  await runtime.deleteModelProfile(c.req.param("id"));
  return c.json({ ok: true, profiles: runtime.profilesInfo() });
});
app.post("/api/profiles/workspaces", async (c) => c.json(await runtime.saveWorkspaceProfile(await c.req.json())));
app.post("/api/profiles/workspaces/:id/activate", async (c) => c.json(await runtime.activateWorkspaceProfile(c.req.param("id"))));
app.post("/api/profiles/workspaces/:id/test", async (c) => c.json(await runtime.testWorkspaceProfile(c.req.param("id"))));
app.delete("/api/profiles/workspaces/:id", async (c) => {
  await runtime.deleteWorkspaceProfile(c.req.param("id"));
  return c.json({ ok: true, profiles: runtime.profilesInfo() });
});
app.get("/api/context", (c) => c.json(runtime.contextInfo()));
app.get("/api/codex/status", (c) => c.json(runtime.codexAuthInfo()));
app.post("/api/codex/login", async (c) => c.json(await runtime.beginCodexLogin()));
app.get("/api/claude-code/status", async (c) => c.json(await runtime.claudeCodeAuthInfo()));
app.post("/api/models/discover", async (c) => c.json(await runtime.discover(await c.req.json())));
app.post("/api/config", async (c) => {
  const body = await c.req.json();
  if (body.provider === "codex" && runtime.codexAuthInfo().status !== "authenticated") {
    return c.json({ error: "Sign in with ChatGPT before connecting" }, 409);
  }
  if (body.provider === "claude-code") {
    const auth = await runtime.claudeCodeAuthInfo();
    if (auth.status !== "authenticated") return c.json({ error: auth.message }, 409);
  }
  return c.json(await runtime.configure(body));
});
app.get("/api/sessions/:id", async (c) => c.json(await runtime.session(c.req.param("id"))));
app.get("/api/sessions/:id/messages", async (c) => c.json(await runtime.messages(c.req.param("id"))));
app.get("/api/sessions/:id/queue", async (c) => c.json(await runtime.pendingPrompts(c.req.param("id"))));
app.patch("/api/sessions/:id/queue/:promptId", async (c) => {
  const body = await c.req.json();
  const prompt = runtime.updatePendingPrompt(c.req.param("id"), c.req.param("promptId"), body.prompt);
  return prompt ? c.json(prompt) : c.json({ error: "Queued message not found or already started" }, 404);
});
app.delete("/api/sessions/:id/queue/:promptId", (c) => runtime.deletePendingPrompt(c.req.param("id"), c.req.param("promptId")) ? c.json({ ok: true }) : c.json({ error: "Queued message not found or already started" }, 404));
app.patch("/api/sessions/:id", async (c) => {
  const body = await c.req.json();
  await runtime.rename(c.req.param("id"), body.title);
  return c.json({ ok: true });
});
app.delete("/api/sessions/:id", async (c) => {
  await runtime.delete(c.req.param("id"));
  return c.json({ ok: true });
});
app.post("/api/sessions", async (c) => {
  if (!runtime.connectionInfo().configured) return c.json({ error: "AI provider is not configured" }, 409);
  const body = await c.req.json();
  if (typeof body.prompt !== "string" || body.prompt.trim().length === 0) return c.json({ error: "prompt is required" }, 400);
  let images;
  try {
    images = validateUserImages(body.images, runtime.connectionInfo().imagesEnabled === true);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
  }
  void runtime.start(body.prompt.trim(), images).catch((error) => console.error("ClineCore session failed", error));
  return c.json({ started: true }, 202);
});
app.post("/api/sessions/:id/messages", async (c) => {
  const body = await c.req.json();
  if (typeof body.prompt !== "string" || body.prompt.trim().length === 0) return c.json({ error: "prompt is required" }, 400);
  let images;
  try {
    images = validateUserImages(body.images, runtime.connectionInfo().imagesEnabled === true);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
  }
  const sessionId = c.req.param("id");
  const activeSessionId = await runtime.send(sessionId, body.prompt.trim(), images);
  return c.json({ started: true, sessionId: activeSessionId }, 202);
});
app.post("/api/sessions/:id/abort", async (c) => {
  await runtime.abort(c.req.param("id"));
  return c.json({ ok: true });
});
app.get("/api/approvals", (c) => c.json(runtime.pendingApprovals()));
app.post("/api/approvals/:id", async (c) => {
  const body = await c.req.json();
  return c.json({ ok: runtime.approve(c.req.param("id"), body.approved) });
});
app.get("/api/events", (c) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (event) => controller.enqueue(encoder.encode(`event: ${event.type}
data: ${JSON.stringify(event)}

`));
      clients.add(send);
      controller.enqueue(encoder.encode(": connected\n\n"));
      c.req.raw.signal.addEventListener("abort", () => {
        clients.delete(send);
        try {
          controller.close();
        } catch {
        }
      });
    }
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
});
app.use("/*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  await next();
});
app.use("/*", serveStatic({ root: resolve4(packageRoot, "dist") }));
if (isMainModule) {
  const port = Number(flagString(cli.flags, "port") ?? process.env.PORT ?? 3e3);
  const hostname2 = flagString(cli.flags, "ip") ?? process.env.HOST ?? "127.0.0.1";
  serve({ fetch: app.fetch, port, hostname: hostname2 }, (info) => {
    console.log(`ClineHub-for-web listening on http://${hostname2}:${info.port}`);
    if (hostname2 === "0.0.0.0" || hostname2 === "::") {
      for (const addresses of Object.values(networkInterfaces())) {
        for (const address of addresses ?? []) {
          if (address.family === "IPv4" && !address.internal) console.log(`  also reachable at http://${address.address}:${info.port}`);
        }
      }
    }
  });
  const shutdown = async () => {
    await runtime.dispose();
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
var server_default = app;
export {
  server_default as default
};
