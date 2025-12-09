import { Navigate } from 'react-router-dom'

import { AuthLayout } from '@/app/layouts/AuthLayout'

import { LoginForm } from '@/features/auth/login'

import { ROUTES } from '@/shared/config/constants'
import { useAuthStore } from '@/shared/store'

export function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
