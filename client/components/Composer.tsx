import type { ChangeEvent, KeyboardEvent } from "react"
import type { TFunction } from "../i18n.js"
import type { AgentSettings, ManagedTool, PendingImage, ToolPermission } from "../types.js"
import { QuickPermissions } from "./QuickPermissions.js"
import { TemplateSwitcher } from "./TemplateSwitcher.js"

type Props = {
  t: TFunction
  prompt: string
  onPromptChange: (value: string) => void
  onSubmit: () => void
  onAbort: () => void
  running: boolean
  pendingImages: PendingImage[]
  onAddImages: (files: FileList) => void
  onRemoveImage: (index: number) => void
  imagesEnabled: boolean
  agentSettings: AgentSettings | null
  effectivePermissions: Record<ManagedTool, ToolPermission> | null
  onCyclePermission: (tool: ManagedTool) => Promise<void>
  onSelectTemplate: (id: string) => void
  templateBusy: boolean
}

export function Composer(props: Props) {
  const { t, prompt, onPromptChange, onSubmit, onAbort, running, pendingImages, onAddImages, onRemoveImage, imagesEnabled, agentSettings, effectivePermissions, onCyclePermission, onSelectTemplate, templateBusy } = props

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || (!event.ctrlKey && !event.metaKey) || event.nativeEvent.isComposing) return
    event.preventDefault()
    onSubmit()
  }
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) onAddImages(event.target.files)
    event.target.value = ""
  }

  return (
    <form id="composer" onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
      <QuickPermissions t={t} permissions={effectivePermissions} onCycle={onCyclePermission} />
      <TemplateSwitcher templates={agentSettings?.templates ?? []} activeTemplateId={agentSettings?.activeTemplateId} disabled={!agentSettings || templateBusy} onSelect={onSelectTemplate} />
      <div className="composer-input-wrap">
        <textarea id="prompt" placeholder={t("messagePlaceholder")} rows={3} value={prompt} onChange={(event) => onPromptChange(event.target.value)} onKeyDown={onKeyDown} />
        <div id="image-attachments" className="image-attachments" hidden={pendingImages.length === 0}>
          {pendingImages.map((item, index) => (
            <div className="image-attachment" key={`${item.name}-${index}`}>
              <img src={item.dataUrl} alt={item.name} />
              <button type="button" className="image-remove" title={t("queueCancel")} onClick={() => onRemoveImage(index)}>×</button>
            </div>
          ))}
        </div>
      </div>
      <div className="composer-actions">
        <input id="image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={onFileChange} />
        <button id="attach-image" className="secondary attach-image" type="button" title={t(imagesEnabled ? "attachImages" : "imageCapabilityUnsupported")} aria-label={t("attachImages")} disabled={!imagesEnabled} onClick={() => document.getElementById("image-input")?.click()}>▧</button>
        <button id="abort" type="button" onClick={onAbort}>{t("stop")}</button>
        <button type="submit">{running ? t("queueSend") : t("send")}</button>
      </div>
    </form>
  )
}
