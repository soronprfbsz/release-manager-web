/**
 * useSidebarShortcut — Ctrl+B / Cmd+B 로 사이드바 토글.
 * 데스크탑이면 desktopCollapsed 토글, 모바일이면 mobileOpen 토글.
 *
 * IME composition 중에는 무시. input/textarea 포커스 중에도 동작 (VS Code 표준).
 */

import { useEffect } from 'react'

import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { useSidebarStore } from '@/shared/store'

export function useSidebarShortcut() {
  const isMobile = useIsMobile()
  const toggleDesktop = useSidebarStore((s) => s.toggleDesktop)
  const toggleMobile = useSidebarStore((s) => s.toggleMobile)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.isComposing) return
      const isMod = e.metaKey || e.ctrlKey
      if (!isMod) return
      if (e.key.toLowerCase() !== 'b') return
      // 브라우저의 북마크 사이드바 단축키 (Ctrl+B) 가 있는 환경도 있음 — 우리가 잡는다.
      e.preventDefault()
      if (isMobile) toggleMobile()
      else toggleDesktop()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isMobile, toggleDesktop, toggleMobile])
}
