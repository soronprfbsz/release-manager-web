import { Navigate, useLocation } from 'react-router-dom'

import { ROUTES } from '@/shared/config/constants'
import { useAuthStore } from '@/shared/store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  const isLoading = useAuthStore((state) => state.isLoading)
  const location = useLocation()

  // 인증 상태 확인 중일 때는 로딩 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // 현재 경로를 state로 전달하여 로그인 후 돌아올 수 있도록 함
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
