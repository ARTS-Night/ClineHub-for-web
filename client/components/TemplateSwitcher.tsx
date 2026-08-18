import { useState } from "react"
import type { TFunction } from "../lib/i18n.js"
import type { PromptTemplate } from "../lib/types.js"
import { useDismissiblePopover } from "../hooks/useDismissiblePopover.js"

type Props = { t: TFunction; templates: PromptTemplate[]; activeTemplateId?: string; disabled: boolean; onSelect: (id: string) => void }

export function TemplateSwitcher({ t, templates, activeTemplateId, disabled, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { panelRef, toggleRef } = useDismissiblePopover(open, close)
  if (templates.length === 0) return null
  const activeName = templates.find((template) => template.id === activeTemplateId)?.name ?? "Mode"
  const choices = (compact = false) => templates.map((template) => (
    <button key={template.id} type="button" className={activeTemplateId === template.id ? "active" : ""} disabled={disabled || activeTemplateId === template.id} onClick={() => { onSelect(template.id); if (compact) close() }}>{template.name}</button>
  ))
  return <div className="template-switcher-wrap">
    <div className="plan-act-toggle template-options" role="group" aria-label={t("template")}>{choices()}</div>
    <button ref={toggleRef} className="secondary mobile-mode-toggle" type="button" aria-expanded={open} aria-controls="mobile-mode-panel" disabled={disabled} onClick={(event) => { event.stopPropagation(); setOpen((current) => !current) }}>◐ {activeName}</button>
    {open && <section ref={panelRef} id="mobile-mode-panel" className="mobile-mode-panel" onClick={(event) => event.stopPropagation()}>{choices(true)}</section>}
  </div>
}
