import { Navigate } from 'react-router-dom'

import { AuthLayout } from '@/app/layouts/AuthLayout'

import { SignUpForm } from '@/features/auth/signup'

import { ROUTES } from '@/shared/config/constants'
import { useAuthStore } from '@/shared/store'

export function SignUpPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  )
}
