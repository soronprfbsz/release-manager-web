import { ReactNode } from 'react'

import { ThemeToggle } from '@/widgets/_shared/theme-toggle'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  // halftone — 사이드바 슬랩과 같은 dot-matrix 질감.
  // 로그인 화면은 사이드바가 없어 배경이 밋밋해지므로 여기에 준다.
  // 점 색은 --halftone-dot 토큰이라 라이트/다크에서 자동 반전된다.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background halftone relative">
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
