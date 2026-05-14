/**
 * useIsMobile — 화면이 모바일 폭 (< 768px, Tailwind `md` 미만) 인지 반응형으로 감지.
 *
 * Vite SPA 클라이언트 only — SSR 고려 불필요.
 * 마운트 시 matchMedia 구독, change 시 자동 리렌더.
 */

import { useEffect, useState } from 'react'

const MOBILE_MEDIA = '(max-width: 767px)'

function getInitialIsMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_MEDIA).matches
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(getInitialIsMobile)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_MEDIA)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    // Safari < 14 는 addEventListener 미지원 — fallback
    if (mql.addEventListener) {
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    } else {
      mql.addListener(handler)
      return () => mql.removeListener(handler)
    }
  }, [])

  return isMobile
}
