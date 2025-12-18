import { ReactNode } from 'react'

import { ThemeToggle } from '@/widgets/theme-toggle/ui/ThemeToggle'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative">
      {/* 테마 토글 - 우측 상단 */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  )
}
