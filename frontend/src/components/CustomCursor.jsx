import { useEffect } from 'react'

export default function CustomCursor() {
  useEffect(() => {
    const dot  = document.getElementById('cursor-dot')
    const ring = document.getElementById('cursor-ring')

    if (!dot || !ring) return

    const onMove = (e) => {
      dot.style.transform  = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      ring.style.transform = `translate(${e.clientX - 18}px, ${e.clientY - 18}px)`
    }

    const onOver = (e) => {
      const hovered = e.target.closest(
        'a, button, [role="button"], .cursor-pointer, .toggle-btn, .service-block-header, .project-card-inner'
      )
      document.body.classList.toggle('cursor-hover', !!hovered)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
    }
  }, [])

  return (
    <>
      <div id="cursor-dot"  aria-hidden="true" />
      <div id="cursor-ring" aria-hidden="true" />
    </>
  )
}
