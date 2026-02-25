import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(() => {
    if (typeof window === 'undefined') return undefined
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Use modern addEventListener/removeEventListener when available,
    // otherwise fall back to addListener/removeListener for older browsers.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange as EventListener)
    } else if (typeof (mql as any).addListener === 'function') {
      ; (mql as any).addListener(onChange)
    }

    // Initialize state from media query
    setIsMobile(mql.matches)

    return () => {
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', onChange as EventListener)
      } else if (typeof (mql as any).removeListener === 'function') {
        ; (mql as any).removeListener(onChange)
      }
    }
  }, [])

  return !!isMobile
}
