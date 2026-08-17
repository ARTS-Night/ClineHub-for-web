import { useRef, useState, type MutableRefObject } from "react"

// Plain useState, plus a ref that's always current. Needed only for state
// read inside the SSE event listeners set up once on mount (a stale closure
// there would otherwise see the value from the first render forever).
export function useSyncedState<T>(initial: T): [T, (updater: T | ((prev: T) => T)) => void, MutableRefObject<T>] {
  const [state, setState] = useState<T>(initial)
  const ref = useRef<T>(initial)
  const set = (updater: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater
      ref.current = next
      return next
    })
  }
  return [state, set, ref]
}
