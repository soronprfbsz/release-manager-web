import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { SignUpForm } from '@/features/auth/signup'
import { ROUTES } from '@/shared/config/constants'

export function SignUpPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  )
}
