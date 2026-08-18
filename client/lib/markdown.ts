// Markdown (+ Mermaid diagram) rendering for assistant/user message bubbles.
// Kept out of messageLog.ts's hot streaming path as a separate module so the
// heavy mermaid renderer only loads lazily, the first time a ```mermaid
// fence actually shows up.
import { marked } from "marked"
import DOMPurify from "dompurify"

marked.setOptions({ gfm: true, breaks: true })

export function renderMarkdown(raw: string): string {
  const html = marked.parse(raw, { async: false }) as string
  return DOMPurify.sanitize(html, { ADD_ATTR: ["target"] })
}

let mermaidPromise: Promise<typeof import("mermaid")["default"]> | null = null
let mermaidCounter = 0

async function loadMermaid() {
  mermaidPromise ??= import("mermaid").then((module) => module.default)
  const mermaid = await mermaidPromise
  // Cheap to call repeatedly, so re-applied on every render to track live theme toggles.
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: document.documentElement.dataset.theme === "light" ? "default" : "dark" })
  return mermaid
}

/** Finds fenced ```mermaid code blocks already rendered as HTML inside
 * `container` and replaces each with its rendered SVG diagram in place.
 * Call only on finalized text (not mid-stream) — a half-streamed diagram
 * source is normally invalid Mermaid syntax and would just error every frame. */
export async function renderMermaidBlocks(container: HTMLElement): Promise<void> {
  const blocks = container.querySelectorAll<HTMLElement>("pre > code.language-mermaid")
  if (blocks.length === 0) return
  const mermaid = await loadMermaid()
  for (const block of Array.from(blocks)) {
    const pre = block.parentElement
    const source = block.textContent ?? ""
    if (!pre || !source.trim()) continue
    try {
      const { svg } = await mermaid.render(`mermaid-${Date.now()}-${mermaidCounter++}`, source)
      const wrapper = document.createElement("div")
      wrapper.className = "mermaid-diagram"
      wrapper.innerHTML = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } })
      pre.replaceWith(wrapper)
    } catch (error) {
      pre.classList.add("mermaid-error")
      const note = document.createElement("div")
      note.className = "mermaid-error-note"
      note.textContent = error instanceof Error ? error.message : String(error)
      pre.before(note)
    }
  }
}
