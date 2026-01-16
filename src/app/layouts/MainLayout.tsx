import { ReactNode } from 'react'

import { NavigationBar } from '@/widgets/_shared/navigation'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="px-12 py-6">
        {children}
      </main>
    </div>
  )
}
