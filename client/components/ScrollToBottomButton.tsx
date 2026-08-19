import type { TFunction } from "../lib/i18n.js"
import { Icon } from "./Icon.js"

type Props = { t: TFunction; atBottom: boolean; locked: boolean; onJump: () => void; onToggleLock: () => void }

// Floats over the bottom-right of the message viewport. Not at the bottom →
// a plain jump-to-bottom arrow. At the bottom → the same spot becomes a lock
// toggle: unlocked keeps following new content until the user scrolls away,
// locked pins the view and ignores scroll attempts entirely.
export function ScrollToBottomButton({ t, atBottom, locked, onJump, onToggleLock }: Props) {
  if (!atBottom) {
    return <button type="button" className="scroll-bottom-button" title={t("scrollToBottom")} aria-label={t("scrollToBottom")} onClick={onJump}><Icon name="arrowDownward" /></button>
  }
  return (
    <button type="button" className={`scroll-bottom-button${locked ? " locked" : ""}`}
      title={t(locked ? "unlockAutoScroll" : "lockAutoScroll")} aria-label={t(locked ? "unlockAutoScroll" : "lockAutoScroll")} onClick={onToggleLock}>
      <Icon name={locked ? "lock" : "lockOpen"} />
    </button>
  )
}
