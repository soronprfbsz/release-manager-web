import { ReactNode } from 'react'

import { ProjectSelector } from '@/widgets/_shared/project-selector'
import { Sidebar } from '@/widgets/_shared/sidebar'
import { ThemeToggle } from '@/widgets/_shared/theme-toggle'

import { DynamicBreadcrumb } from '@/shared/ui/dynamic-breadcrumb'

interface MainLayoutProps {
  children: ReactNode
}

/**
 * Backstage redesign — sidebar shell layout.
 *  ┌────────────┬──────────────────────────────────────┐
 *  │  Sidebar   │  Topbar  [breadcrumb] [project/theme]│
 *  │            ├──────────────────────────────────────┤
 *  │            │  Main content                        │
 *  └────────────┴──────────────────────────────────────┘
 *
 *  Breadcrumb 은 Topbar 좌측에 자동 렌더 (useMenuPath 기반).
 *  Project/Theme 토글은 Topbar 우측.
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="flex items-center gap-3 px-6 h-14 border-b border-border bg-background flex-none">
          <div className="flex-1 min-w-0 overflow-hidden">
            <DynamicBreadcrumb />
          </div>
          <ProjectSelector />
          <div className="h-5 w-px bg-border mx-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 min-h-0 overflow-auto px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
