/**
 * Permission Hook
 * 역할 기반 권한 관리 훅
 */

import { useAuthStore } from '@/shared/store'

// ============================================================================
// Types
// ============================================================================

export type Role = 'ADMIN' | 'USER' | 'GUEST'

// ============================================================================
// Permission Definitions
// ============================================================================

/**
 * 권한별 숨김 처리할 Role 정의
 * - 배열에 포함된 Role은 해당 기능이 숨겨짐
 * - 빈 배열 = 모든 Role에서 보임
 */
const HIDDEN_ROLES = {
  // 버전 관리
  version: {
    add: ['GUEST'] as Role[],              // 추가: ADMIN, USER 가능
    delete: ['GUEST', 'USER'] as Role[],   // 삭제: ADMIN만 가능
    approve: ['GUEST'] as Role[],          // 승인: ADMIN, USER 가능
  },
  // 패치 관리
  patch: {
    add: ['GUEST'] as Role[],              // 추가: ADMIN, USER 가능
    delete: ['GUEST', 'USER'] as Role[],   // 삭제: ADMIN만 가능
  },
} as const

// ============================================================================
// Hook
// ============================================================================

export function usePermission() {
  const user = useAuthStore((state) => state.user)
  const role = (user?.role as Role) || 'GUEST'

  /**
   * 특정 기능이 현재 Role에서 보이는지 확인
   * @param hiddenRoles - 숨겨야 할 Role 배열
   * @returns true = 보임, false = 숨김
   */
  const canAccess = (hiddenRoles: readonly Role[]): boolean => {
    return !hiddenRoles.includes(role)
  }

  return {
    // 현재 역할
    role,

    // 역할 체크
    isAdmin: role === 'ADMIN',
    isUser: role === 'USER',
    isGuest: role === 'GUEST',

    // 버전 관리 권한
    canAddVersion: canAccess(HIDDEN_ROLES.version.add),
    canDeleteVersion: canAccess(HIDDEN_ROLES.version.delete),
    canApproveVersion: canAccess(HIDDEN_ROLES.version.approve),

    // 패치 관리 권한
    canAddPatch: canAccess(HIDDEN_ROLES.patch.add),
    canDeletePatch: canAccess(HIDDEN_ROLES.patch.delete),

    // 유틸리티
    canAccess,
  }
}
