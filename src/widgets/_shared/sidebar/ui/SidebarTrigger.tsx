/**
 * SidebarTrigger — topbar 에 노출되는 사이드바 토글 버튼.
 *
 * 데스크탑 (>=768px): PanelLeftClose / PanelLeftOpen 아이콘, desktopCollapsed 토글.
 * 모바일  (<768px) : Menu (hamburger) 아이콘, mobileOpen 토글.
 */

import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { useSidebarStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'

export function SidebarTrigger() {
  const isMobile = useIsMobile()
  const desktopCollapsed = useSidebarStore((s) => s.desktopCollapsed)
  const toggleDesktop = useSidebarStore((s) => s.toggleDesktop)
  const toggleMobile = useSidebarStore((s) => s.toggleMobile)

  if (isMobile) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="사이드바 열기"
        onClick={toggleMobile}
      >
        <Menu className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={desktopCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
      onClick={toggleDesktop}
    >
      {desktopCollapsed ? (
        <PanelLeftOpen className="h-5 w-5" />
      ) : (
        <PanelLeftClose className="h-5 w-5" />
      )}
    </Button>
  )
}
