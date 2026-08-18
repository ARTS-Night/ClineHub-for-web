import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react"
import type { TFunction } from "../lib/i18n.js"
import type { AgentSettings, ManagedTool, PendingImage, ToolPermission } from "../lib/types.js"
import { useDismissiblePopover } from "../hooks/useDismissiblePopover.js"
import { QuickPermissions } from "./QuickPermissions.js"
import { TemplateSwitcher } from "./TemplateSwitcher.js"

type Props = {
  t: TFunction
  prompt: string
  onPromptChange: (value: string) => void
  onSubmit: () => void
  onAbort: () => void
  running: boolean
  stalled: boolean
  pendingImages: PendingImage[]
  onAddImages: (files: FileList) => void
  onRemoveImage: (index: number) => void
  imagesEnabled: boolean
  agentSettings: AgentSettings | null
  effectivePermissions: Record<ManagedTool, ToolPermission> | null
  onCyclePermission: (tool: ManagedTool) => Promise<void>
  mcpEnabled: boolean | null
  onToggleMcp: () => Promise<void>
  onSelectTemplate: (id: string) => void
  templateBusy: boolean
}

export function Composer(props: Props) {
  const { t, prompt, onPromptChange, onSubmit, onAbort, running, stalled, pendingImages, onAddImages, onRemoveImage, imagesEnabled, agentSettings, effectivePermissions, onCyclePermission, mcpEnabled, onToggleMcp, onSelectTemplate, templateBusy } = props
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false)
  const closeImagePreview = () => setImagePreviewOpen(false)
  const { panelRef: imagePreviewRef, toggleRef: imagePreviewToggleRef } = useDismissiblePopover(imagePreviewOpen, closeImagePreview)
  // Each fresh batch of attachments starts minimized again — a leftover
  // "open" flag from the last batch shouldn't carry over after it was cleared.
  useEffect(() => { if (pendingImages.length === 0) setImagePreviewOpen(false) }, [pendingImages.length])

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
      <div className="composer-toolbar">
        <TemplateSwitcher t={t} templates={agentSettings?.templates ?? []} activeTemplateId={agentSettings?.activeTemplateId} disabled={!agentSettings || templateBusy} onSelect={onSelectTemplate} />
        <QuickPermissions t={t} permissions={effectivePermissions} onCycle={onCyclePermission} mcpEnabled={mcpEnabled} onToggleMcp={onToggleMcp} />
      </div>
      <div className="composer-input-wrap">
        {pendingImages.length > 0 && (
          <div className="image-preview-wrap">
            <button ref={imagePreviewToggleRef} type="button" className="secondary image-preview-toggle" aria-expanded={imagePreviewOpen} aria-controls="image-preview-panel" title={t("attachImages")} onClick={() => setImagePreviewOpen((current) => !current)}>▧ {pendingImages.length}</button>
            {imagePreviewOpen && (
              <section ref={imagePreviewRef} id="image-preview-panel" className="image-preview-panel" onClick={(event) => event.stopPropagation()}>
                {pendingImages.map((item, index) => (
                  <div className="image-attachment" key={`${item.name}-${index}`}>
                    <img src={item.dataUrl} alt={item.name} />
                    <button type="button" className="image-remove" title={t("queueCancel")} onClick={() => onRemoveImage(index)}>×</button>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}
        <textarea id="prompt" placeholder={t("messagePlaceholder")} rows={3} value={prompt} onChange={(event) => onPromptChange(event.target.value)} onKeyDown={onKeyDown} />
      </div>
      <div className="composer-actions">
        {imagesEnabled && <><input id="image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={onFileChange} />
          <button id="attach-image" className="secondary attach-image" type="button" title={t("attachImages")} aria-label={t("attachImages")} onClick={() => document.getElementById("image-input")?.click()}>▧</button></>}
        <button id="abort" type="button" onClick={onAbort}>{t("stop")}</button>
        <button type="submit" className={running ? "is-running" : ""}>{stalled ? t("forceSend") : t("send")}</button>
      </div>
    </form>
  )
}
