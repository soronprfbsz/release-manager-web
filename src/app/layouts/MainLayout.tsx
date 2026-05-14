import { ReactNode } from 'react'

import { ProjectSelector } from '@/widgets/_shared/project-selector'
import { Sidebar } from '@/widgets/_shared/sidebar'
import { ThemeToggle } from '@/widgets/_shared/theme-toggle'

interface MainLayoutProps {
  children: ReactNode
}

/**
 * Backstage redesign — sidebar shell layout.
 *  ┌────────────┬──────────────────────────────────────┐
 *  │  Sidebar   │  Topbar (project / theme)            │
 *  │            ├──────────────────────────────────────┤
 *  │            │  Main content                        │
 *  └────────────┴──────────────────────────────────────┘
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="flex items-center gap-3 px-6 h-14 border-b border-border bg-background flex-none">
          <div className="flex-1" />
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
