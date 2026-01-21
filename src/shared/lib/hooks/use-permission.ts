/**
 * Permission Hook
 * 역할 기반 권한 관리 훅
 */

import { useAuthStore } from '@/shared/store'

// ============================================================================
// Types
// ============================================================================

/** 권한 계층: ADMIN(1) > DEVELOPER(2) > USER(3) > GUEST(4) */
export type Role = 'ADMIN' | 'DEVELOPER' | 'USER' | 'GUEST'

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
    add: ['GUEST', 'USER'] as Role[],                  // 추가/수정: ADMIN, DEVELOPER 가능
    delete: ['GUEST', 'USER'] as Role[],               // 삭제: ADMIN, DEVELOPER 가능
    approve: ['GUEST', 'USER'] as Role[],              // 승인: ADMIN, DEVELOPER 가능
    download: ['GUEST', 'USER'] as Role[],             // 다운로드: ADMIN, DEVELOPER 가능
  },
  // 패치 관리
  patch: {
    add: ['GUEST'] as Role[],              // 추가: ADMIN, DEVELOPER, USER 가능
    delete: ['GUEST'] as Role[],           // 삭제: ADMIN, DEVELOPER, USER 가능
  },
  // 프로젝트 관리
  project: {
    delete: ['GUEST', 'USER'] as Role[],              // 삭제: ADMIN, DEVELOPER 가능
    manageFiles: ['GUEST', 'USER'] as Role[],         // 파일 추가/폴더 추가/삭제: ADMIN, DEVELOPER 가능
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
    isDeveloper: role === 'DEVELOPER',
    isUser: role === 'USER',
    isGuest: role === 'GUEST',

    // 버전 관리 권한
    canAddVersion: canAccess(HIDDEN_ROLES.version.add),
    canDeleteVersion: canAccess(HIDDEN_ROLES.version.delete),
    canApproveVersion: canAccess(HIDDEN_ROLES.version.approve),
    canDownloadVersion: canAccess(HIDDEN_ROLES.version.download),

    // 패치 관리 권한
    canAddPatch: canAccess(HIDDEN_ROLES.patch.add),
    canDeletePatch: canAccess(HIDDEN_ROLES.patch.delete),

    // 프로젝트 관리 권한
    canDeleteProject: canAccess(HIDDEN_ROLES.project.delete),
    canManageProjectFiles: canAccess(HIDDEN_ROLES.project.manageFiles),

    // 유틸리티
    canAccess,
  }
}
