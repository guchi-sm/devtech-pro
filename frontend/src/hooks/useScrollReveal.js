import { useEffect, useRef, useState } from 'react'

/**
 * Returns a [ref, isVisible] pair.
 * Attach `ref` to the element you want to observe.
 * `isVisible` flips to true once 10% of the element enters the viewport.
 */
export function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el) // fire once only
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}
