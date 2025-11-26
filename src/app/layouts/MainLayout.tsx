import { ReactNode } from 'react'
import { NavigationBar } from '@/widgets/navigation/ui/NavigationBar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="px-14 py-6">
        {children}
      </main>
    </div>
  )
}
