import { Navigate } from 'react-router-dom'

import { ROUTES } from '@/shared/config/constants'

import { useAuth } from './AuthProvider'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />
  }

  return <>{children}</>
}
