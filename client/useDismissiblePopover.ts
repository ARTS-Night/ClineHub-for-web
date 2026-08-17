import { useEffect, useRef, type RefObject } from "react"

// Closes an open popover on an outside click or Escape, and returns focus to
// the toggle button. Mirrors the original bindDismissiblePopover helper,
// shared by the session-environment and quick-permissions popovers.
export function useDismissiblePopover(open: boolean, close: () => void): { panelRef: RefObject<HTMLElement | null>; toggleRef: RefObject<HTMLButtonElement | null> } {
  const panelRef = useRef<HTMLElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return
      close()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      close()
      toggleRef.current?.focus()
    }
    document.addEventListener("click", onClick)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("click", onClick)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, close])

  return { panelRef, toggleRef }
}
