import { useEffect, useRef } from 'react'

export function useCountUp(target, duration = 1800, started = false) {
  const ref = useRef(null)
  const ran = useRef(false)

  useEffect(() => {
    if (!started || ran.current) return
    const el = ref.current
    if (!el) return
    ran.current = true

    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      el.textContent = Math.round(eased * target)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration])

  return ref
}