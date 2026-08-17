import type { PromptTemplate } from "../types.js"

type Props = { templates: PromptTemplate[]; activeTemplateId?: string; disabled: boolean; onSelect: (id: string) => void }

export function TemplateSwitcher({ templates, activeTemplateId, disabled, onSelect }: Props) {
  if (templates.length === 0) return null
  return <div className="plan-act-toggle" role="group" aria-label="Template">
    {templates.map((template) => (
      <button key={template.id} type="button" className={activeTemplateId === template.id ? "active" : ""} disabled={disabled || activeTemplateId === template.id} onClick={() => onSelect(template.id)}>{template.name}</button>
    ))}
  </div>
}
