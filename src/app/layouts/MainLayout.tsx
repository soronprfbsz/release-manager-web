import { ReactNode } from 'react'

import { ProjectSelector } from '@/widgets/_shared/project-selector'
import { Sidebar, SidebarTrigger } from '@/widgets/_shared/sidebar'
import { useSidebarShortcut } from '@/widgets/_shared/sidebar/ui/useSidebarShortcut'
import { ThemeToggle } from '@/widgets/_shared/theme-toggle'

import { DynamicBreadcrumb } from '@/shared/ui/dynamic-breadcrumb'

interface MainLayoutProps {
  children: ReactNode
}

/**
 * Backstage redesign — sidebar shell layout.
 *  ┌────────────┬──────────────────────────────────────┐
 *  │  Sidebar   │  Topbar  [trigger][breadcrumb] […]   │
 *  │ (or Sheet) ├──────────────────────────────────────┤
 *  │  on mobile │  <main> flex-1 min-h-0 overflow-auto │
 *  └────────────┴──────────────────────────────────────┘
 *
 *  ⟡ Flex chain: html/body/#root → h-full / AppShell → h-screen flex /
 *    right-column → flex-1 flex flex-col min-h-0 / main → flex-1 min-h-0 overflow-auto.
 *  ⟡ <main> 가 유일한 스크롤 컨테이너. 페이지 내부에서 calc(100vh-Nrem) 같은
 *    뷰포트 매직 넘버를 쓰지 말고 부모로부터 h-full 을 받아 사용한다.
 *  ⟡ 페이지 좌우 패딩은 PageLayout 이 책임 (px-10) — main 은 chrome 만 담당.
 */
export function MainLayout({ children }: MainLayoutProps) {
  useSidebarShortcut()

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="flex items-center gap-3 px-6 h-16 border-b border-border bg-background flex-none">
          <SidebarTrigger />
          <div className="flex-1 min-w-0 overflow-hidden">
            <DynamicBreadcrumb />
          </div>
          <ProjectSelector />
          <div className="h-5 w-px bg-border mx-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
