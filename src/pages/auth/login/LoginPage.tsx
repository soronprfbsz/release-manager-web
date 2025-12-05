import { Navigate } from 'react-router-dom'

import { AuthLayout } from '@/app/layouts/AuthLayout'
import { useAuth } from '@/app/providers/AuthProvider'

import { LoginForm } from '@/features/auth/login'

import { ROUTES } from '@/shared/config/constants'

export function LoginPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
