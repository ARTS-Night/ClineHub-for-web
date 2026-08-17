// Imperative message-timeline renderer, ported near-verbatim from the
// original public/app.js. The transcript is an append-only interleaved log
// (user/assistant/reasoning/tool bubbles plus a token-by-token streaming
// engine) that reads and updates a couple of "current" DOM nodes across many
// SSE events. Modeling that as declarative React state per token would cause
// far more re-renders than this manual rAF-batched approach, so it stays a
// small DOM-owning module driven from a single React ref container — React
// never renders children into that container, so there's no reconciliation
// conflict.
import { toBcp47, type Locale, type TFunction } from "./i18n.js"
import { renderMarkdown, renderMermaidBlocks } from "./markdown.js"

export function cleanDisplayText(value: unknown): string {
  return String(value ?? "")
    .replace(/<environment_details\b[^>]*>[\s\S]*?<\/environment_details>/gi, "")
    .replace(/<system_reminder\b[^>]*>[\s\S]*?<\/system_reminder>/gi, "")
    .replace(/<(?:environment_details|system_reminder)\b[^>]*>[\s\S]*$/gi, "")
    .replace(/<\/?(?:user_input|user_message|task|feedback)\b[^>]*>/gi, "")
    .replace(/<\/?(?:user_input|user_message|task|feedback)\b[^>]*$/gi, "")
    .replace(/^\s*(?:\[?waiting for tool results?\]?|ツールの結果を待っています)[.….]*\s*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
}

const visibleTools = new Set(["read_files", "search_codebase", "run_commands", "editor", "apply_patch", "fetch_web_content", "ssh_read_files", "ssh_search_files", "ssh_run_commands", "ssh_write_file", "ssh_run_sudo_commands"])
export function isVisibleTool(name: string): boolean { return visibleTools.has(name) }

function toolSummary(name: string, input: unknown): string {
  if (!input || typeof input !== "object") return ""
  const value = input as Record<string, unknown>
  if (name === "read_files" || name === "ssh_read_files") return (((value.files ?? value.paths) as unknown[]) ?? []).map((file) => typeof file === "string" ? file : (file as { path?: string })?.path).filter(Boolean).join("\n")
  if (name === "run_commands" || name === "ssh_run_commands" || name === "ssh_run_sudo_commands") {
    if (typeof value.command === "string") return value.command
    return (((value.commands as unknown[]) ?? [])).map((command) => typeof command === "string" ? command : (command as { command?: string })?.command).filter(Boolean).join("\n")
  }
  if (name === "search_codebase" || name === "ssh_search_files") return String(value.query ?? value.pattern ?? "")
  if (name === "editor" || name === "apply_patch" || name === "ssh_write_file") return String(value.path ?? value.filePath ?? value.file_path ?? "")
  if (name === "fetch_web_content") return String(value.url ?? "")
  return ""
}

function toolOutputText(value: unknown): string {
  if (value === undefined || value === null) return ""
  if (typeof value === "string") return value
  if (Array.isArray(value) && value.every((item) => item && typeof item === "object" && ("query" in item || "result" in item || "error" in item))) {
    return value.map((item) => {
      const heading = item.query ? `▶ ${item.query}` : ""
      const result = item.error ? `ERROR: ${item.error}` : String(item.result ?? "")
      return [heading, result].filter(Boolean).join("\n")
    }).join("\n\n")
  }
  return JSON.stringify(value, null, 2)
}

function streamSliceSize(length: number): number {
  if (length > 400) return 64
  if (length > 120) return 32
  return 12
}

export type ToolActivityData = { toolCallId?: string; toolName: string; input?: unknown }
export type ToolResultData = { toolCallId?: string; toolName: string; output?: unknown; error?: unknown; durationMs?: number }

export class MessageLog {
  t: TFunction
  showToolDetails: boolean
  locale: Locale
  // Only tags live/streaming messages — replayed history has no per-message
  // template metadata to classify retroactively, so it's left plain there.
  planStyle: boolean
  private container: HTMLElement
  private toolCards = new Map<string, HTMLElement>()
  // user/assistant bubbles render markdown into a nested content element so
  // the outer bubble stays free to carry classList/hidden state (streaming,
  // plan styling) without that fighting the innerHTML rewrites below.
  private contentNodes = new WeakMap<HTMLElement, HTMLElement>()
  private assistantStreamNode: HTMLElement | null = null
  private reasoningStreamNode: HTMLElement | null = null
  private assistantStreamRaw = ""
  private reasoningStreamRaw = ""
  private assistantStreamPending = ""
  private reasoningStreamPending = ""
  private streamAnimationFrame: number | null = null

  constructor(container: HTMLElement, t: TFunction, showToolDetails: boolean, locale: Locale, planStyle = false) {
    this.container = container
    this.t = t
    this.showToolDetails = showToolDetails
    this.locale = locale
    this.planStyle = planStyle
  }

  private scrollToBottom() { this.container.scrollTop = this.container.scrollHeight }

  clear() {
    this.resetStreamNodes()
    this.toolCards.clear()
    this.container.replaceChildren()
  }

  addMessage(kind: "user" | "assistant" | "tool", text: unknown, imageUrls: string[] = []): HTMLElement {
    const node = document.createElement("div")
    node.className = kind === "assistant" && this.planStyle ? `message ${kind} plan` : `message ${kind}`
    const displayText = kind === "tool" ? String(text ?? "") : cleanDisplayText(text)
    if (imageUrls.length) {
      const gallery = document.createElement("div")
      gallery.className = "message-images"
      for (const source of imageUrls) {
        const image = document.createElement("img")
        image.src = source
        image.alt = this.t("attachImages")
        image.loading = "lazy"
        gallery.append(image)
      }
      node.append(gallery)
    }
    if (kind === "tool") {
      if (displayText) node.append(document.createTextNode(displayText))
    } else {
      const content = document.createElement("div")
      content.className = "message-content"
      if (displayText) {
        content.innerHTML = renderMarkdown(displayText)
        void renderMermaidBlocks(content)
      }
      node.append(content)
      this.contentNodes.set(node, content)
    }
    node.hidden = kind !== "tool" && !displayText.trim() && imageUrls.length === 0
    this.container.append(node)
    this.scrollToBottom()
    return node
  }

  showError(error: unknown, prefix = "Error") {
    const text = error instanceof Error ? error.message : String(error)
    this.addMessage("tool", `${prefix}: ${text}`)
  }

  addReasoningMessage(text: string, redacted = false): HTMLElement {
    const details = document.createElement("details")
    details.className = "message reasoning"
    details.open = true
    const summary = document.createElement("summary")
    summary.dataset.reasoningLabel = redacted ? "redactedThinking" : "thinking"
    summary.textContent = this.t(summary.dataset.reasoningLabel)
    const body = document.createElement("div")
    body.className = "reasoning-content"
    body.textContent = cleanDisplayText(text || (redacted ? this.t("redactedThinking") : ""))
    details.append(summary, body)
    details.hidden = !body.textContent?.trim()
    this.container.append(details)
    this.scrollToBottom()
    return body
  }

  private toolDetails(label: string, value: unknown, open: boolean): HTMLDetailsElement {
    const details = document.createElement("details")
    details.className = "tool-details"
    details.open = open
    const summary = document.createElement("summary")
    summary.textContent = label
    const body = document.createElement("pre")
    body.textContent = toolOutputText(value)
    details.append(summary, body)
    return details
  }

  addToolActivity({ toolCallId, toolName, input }: ToolActivityData): HTMLElement | null {
    const visible = isVisibleTool(toolName)
    if (!visible && !this.showToolDetails) return null
    const card = document.createElement("section")
    card.className = `message tool-activity running${visible ? "" : " internal-tool"}`
    const header = document.createElement("div")
    header.className = "tool-activity-header"
    const title = document.createElement("strong")
    title.textContent = `${toolName.includes("run_commands") ? ">" : toolName.includes("read_files") ? "▤" : "◆"} ${this.t(toolName)}`
    const status = document.createElement("span")
    status.className = "tool-status"
    status.textContent = this.t("toolRunning")
    header.append(title, status)
    card.append(header)
    const summary = toolSummary(toolName, input)
    if (summary) {
      const code = document.createElement("code")
      code.className = "tool-summary"
      code.textContent = summary
      card.append(code)
    }
    if (this.showToolDetails) card.append(this.toolDetails(this.t("toolInput"), input, false))
    this.container.append(card)
    if (toolCallId) this.toolCards.set(toolCallId, card)
    this.scrollToBottom()
    return card
  }

  finishToolActivity({ toolCallId, toolName, output, error, durationMs }: ToolResultData) {
    let card = toolCallId ? this.toolCards.get(toolCallId) : null
    if (!card) card = this.addToolActivity({ toolCallId, toolName, input: null }) ?? undefined
    if (!card) return
    card.classList.remove("running")
    card.classList.toggle("failed", Boolean(error))
    card.classList.add(error ? "failed" : "completed")
    const status = card.querySelector(".tool-status")
    if (status) status.textContent = `${this.t(error ? "toolFailed" : "toolCompleted")}${durationMs ? ` · ${durationMs}ms` : ""}`
    card.append(this.toolDetails(this.t("toolOutput"), output ?? (error ? `ERROR: ${error}` : ""), Boolean(error)))
    this.scrollToBottom()
  }

  addCompactionEvent(record: { at: string; message?: string }) {
    const card = document.createElement("section")
    card.className = "message compaction-event"
    const heading = document.createElement("strong")
    heading.textContent = `↻ ${this.t("compactionEvent")}`
    const detail = document.createElement("span")
    detail.textContent = this.t("compactionDetail", { time: localDateTime(record.at, this.locale), message: record.message ?? "" })
    card.append(heading, detail)
    this.container.append(card)
    this.scrollToBottom()
  }

  // --- Streaming (text/reasoning) ---

  appendStream(kind: "text" | "reasoning", chunk: unknown, redacted = false) {
    if (typeof chunk !== "string" || chunk.length === 0) return
    const isReasoning = kind === "reasoning"
    let node = isReasoning ? this.reasoningStreamNode : this.assistantStreamNode
    if (!node) {
      node = isReasoning ? this.addReasoningMessage("", redacted) : this.addMessage("assistant", "")
      if (isReasoning) this.reasoningStreamNode = node
      else this.assistantStreamNode = node
    }
    if (isReasoning) node.parentElement?.classList.add("streaming")
    else node.classList.add("streaming")
    if (isReasoning) this.reasoningStreamPending += chunk
    else this.assistantStreamPending += chunk
    this.scheduleStreamFrame()
  }

  private scheduleStreamFrame() {
    if (this.streamAnimationFrame !== null) return
    this.streamAnimationFrame = requestAnimationFrame(() => {
      this.streamAnimationFrame = null
      this.flushStreamQueues(false)
      if (this.assistantStreamPending || this.reasoningStreamPending) this.scheduleStreamFrame()
    })
  }

  private flushStreamQueues(all: boolean) {
    if (this.reasoningStreamPending && this.reasoningStreamNode) {
      const count = all ? this.reasoningStreamPending.length : Math.min(this.reasoningStreamPending.length, streamSliceSize(this.reasoningStreamPending.length))
      this.reasoningStreamRaw += this.reasoningStreamPending.slice(0, count)
      this.reasoningStreamPending = this.reasoningStreamPending.slice(count)
      this.reasoningStreamNode.textContent = cleanDisplayText(this.reasoningStreamRaw)
      if (this.reasoningStreamNode.parentElement) this.reasoningStreamNode.parentElement.hidden = !this.reasoningStreamNode.textContent?.trim()
    }
    if (this.assistantStreamPending && this.assistantStreamNode) {
      const count = all ? this.assistantStreamPending.length : Math.min(this.assistantStreamPending.length, streamSliceSize(this.assistantStreamPending.length))
      this.assistantStreamRaw += this.assistantStreamPending.slice(0, count)
      this.assistantStreamPending = this.assistantStreamPending.slice(count)
      const cleaned = cleanDisplayText(this.assistantStreamRaw)
      const content = this.contentNodes.get(this.assistantStreamNode)
      if (content) content.innerHTML = renderMarkdown(cleaned)
      this.assistantStreamNode.hidden = !cleaned.trim()
    }
    this.scrollToBottom()
  }

  finishStreamNodes() {
    if (this.streamAnimationFrame !== null) cancelAnimationFrame(this.streamAnimationFrame)
    this.streamAnimationFrame = null
    this.flushStreamQueues(true)
    // A partially-streamed ```mermaid fence is normally invalid syntax, so
    // diagrams are only rendered once the text is done streaming.
    const assistantContent = this.assistantStreamNode && this.contentNodes.get(this.assistantStreamNode)
    if (assistantContent) void renderMermaidBlocks(assistantContent)
    this.assistantStreamNode?.classList.remove("streaming")
    this.reasoningStreamNode?.parentElement?.classList.remove("streaming")
    this.container.querySelectorAll(".streaming").forEach((node) => node.classList.remove("streaming"))
  }

  resetStreamNodes() {
    this.finishStreamNodes()
    if (this.streamAnimationFrame !== null) cancelAnimationFrame(this.streamAnimationFrame)
    this.streamAnimationFrame = null
    this.assistantStreamNode = null
    this.reasoningStreamNode = null
    this.assistantStreamRaw = ""
    this.reasoningStreamRaw = ""
    this.assistantStreamPending = ""
    this.reasoningStreamPending = ""
  }

  // --- History replay ---

  renderHistoryMessage(message: { role?: string; content?: unknown }) {
    const role = message?.role ?? "assistant"
    const content = message?.content
    if (role === "tool" && !this.showToolDetails) return
    if (typeof content === "string") {
      if (role === "tool") this.finishToolActivity({ toolName: "unknown", output: content })
      else this.addMessage(role === "user" ? "user" : "assistant", content)
      return
    }
    if (!Array.isArray(content)) {
      this.addMessage(role === "user" ? "user" : "assistant", contentText(content))
      return
    }
    for (const part of content) {
      if (typeof part === "string") {
        this.addMessage(role === "user" ? "user" : "assistant", part)
        continue
      }
      if (!part || typeof part !== "object") continue
      const value = part as Record<string, unknown>
      const type = String(value.type ?? "")
      if (type === "image" && typeof value.data === "string" && typeof value.mediaType === "string") {
        this.addMessage(role === "user" ? "user" : "assistant", "", [`data:${value.mediaType};base64,${value.data}`])
        continue
      }
      const isReasoning = type === "reasoning" || type === "thinking" || type === "redacted_thinking" || "thinking" in value || "reasoning" in value
      if (isReasoning) {
        this.addReasoningMessage(partText(value), Boolean(value.redacted || type === "redacted_thinking"))
        continue
      }
      if (type === "tool-call" || type === "tool_use") {
        const name = String(value.toolName ?? value.name ?? "unknown")
        const input = value.input ?? value.arguments ?? {}
        this.addToolActivity({ toolCallId: (value.toolCallId ?? value.id) as string | undefined, toolName: name, input })
        continue
      }
      if (type === "tool-result" || type === "tool_result" || role === "tool") {
        const name = String(value.toolName ?? value.name ?? "")
        const output = value.output ?? value.content ?? value.result ?? value
        const resultError = Array.isArray(output) ? output.find((item) => item?.error)?.error : value.error
        this.finishToolActivity({ toolCallId: (value.toolCallId ?? value.tool_use_id) as string | undefined, toolName: name, output, error: resultError })
        continue
      }
      const text = partText(value)
      if (text) this.addMessage(role === "user" ? "user" : "assistant", text)
      else if (this.showToolDetails) this.finishToolActivity({ toolName: type, output: value })
    }
  }
}

function contentText(content: unknown): string {
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return JSON.stringify(content, null, 2)
  return content
    .map((part) => {
      if (typeof part === "string") return part
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text
      if (part && typeof part === "object" && "thinking" in part && typeof part.thinking === "string") return part.thinking
      return JSON.stringify(part)
    })
    .join("\n")
}

function partText(part: Record<string, unknown>): string {
  if (typeof part.text === "string") return part.text
  if (typeof part.thinking === "string") return part.thinking
  if (typeof part.reasoning === "string") return part.reasoning
  return ""
}

export function localDateTime(value: string | undefined | null, locale: Locale): string {
  if (!value) return "—"
  return new Intl.DateTimeFormat(toBcp47(locale), { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value))
}
