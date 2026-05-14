/**
 * Sidebar — wrapper. 화면 폭에 따라 DesktopSidebar / MobileSidebar 분기.
 * 화면 폭이 변할 때 mobileOpen 잔존 상태를 정리한다.
 */

import { useEffect } from 'react'

import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { useSidebarStore } from '@/shared/store'

import { DesktopSidebar } from './DesktopSidebar'
import { MobileSidebar } from './MobileSidebar'

export function Sidebar() {
  const isMobile = useIsMobile()
  const closeMobile = useSidebarStore((s) => s.closeMobile)

  // 데스크탑 폭으로 전환되면 mobileOpen 잔존 상태 정리
  useEffect(() => {
    if (!isMobile) closeMobile()
  }, [isMobile, closeMobile])

  return isMobile ? <MobileSidebar /> : <DesktopSidebar />
}
