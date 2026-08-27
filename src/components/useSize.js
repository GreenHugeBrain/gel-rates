import { useEffect, useRef, useState } from 'react'

/**
 * Measures a container so charts can be drawn at real pixel sizes.
 *
 * Scaling one SVG with a viewBox would scale the 2px strokes and 8px markers with
 * it, so the marks would come out a different weight on every screen. Measuring and
 * re-rendering keeps them at spec.
 */
export default function useSize(initialWidth = 720) {
  const ref = useRef(null)
  const [width, setWidth] = useState(initialWidth)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    if (typeof ResizeObserver === 'undefined') {
      setWidth(node.clientWidth || initialWidth)
      return undefined
    }
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect?.width
      if (next) setWidth(Math.round(next))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [initialWidth])

  return [ref, width]
}
