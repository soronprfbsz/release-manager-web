/**
 * RoleGuard Component
 * 역할 기반 라우트 접근 제어 컴포넌트
 */

import { ForbiddenPage } from '@/pages/error/ForbiddenPage'

import type { Role } from '@/shared/config/permissions'
import { useAuthStore } from '@/shared/store'

interface RoleGuardProps {
  allowedRoles: readonly Role[]
  children: React.ReactNode
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user)
  const role = (user?.role as Role) || 'GUEST'

  if (!allowedRoles.includes(role)) {
    return <ForbiddenPage />
  }

  return <>{children}</>
}
