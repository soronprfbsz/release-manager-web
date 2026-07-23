/**
 * Permission Hook
 * 역할 기반 권한 관리 훅
 */

import {
  type Role,
  ACTION_PERMISSIONS,
  ROUTE_PERMISSIONS,
} from '@/shared/config/permissions'
import { useAuthStore } from '@/shared/store'

export type { Role } from '@/shared/config/permissions'

// ============================================================================
// Hook
// ============================================================================

export function usePermission() {
  const user = useAuthStore((state) => state.user)
  const role = (user?.role as Role) || 'GUEST'

  /**
   * 특정 기능의 허용 역할에 현재 역할이 포함되는지 확인
   */
  const hasPermission = (feature: keyof typeof ACTION_PERMISSIONS, action: string): boolean => {
    const featurePerms = ACTION_PERMISSIONS[feature] as Record<string, readonly Role[]>
    const allowedRoles = featurePerms?.[action]
    if (!allowedRoles) return false
    return allowedRoles.includes(role)
  }

  /**
   * 특정 라우트에 현재 역할이 접근 가능한지 확인
   */
  const hasRouteAccess = (route: string): boolean => {
    const allowedRoles = ROUTE_PERMISSIONS[route]
    if (!allowedRoles) return true // 미정의 라우트는 접근 허용
    return allowedRoles.includes(role)
  }

  return {
    // 현재 역할
    role,

    // 역할 체크
    isAdmin: role === 'ADMIN',
    isOperator: role === 'OPERATOR',
    isDeveloper: role === 'DEVELOPER',
    isUser: role === 'USER',
    isGuest: role === 'GUEST',

    // ========================================================================
    // 버전 관리 권한
    // ========================================================================
    canAddVersion: hasPermission('version', 'create'),
    canDeleteVersion: hasPermission('version', 'delete'),
    canApproveVersion: hasPermission('version', 'approve'),
    canDownloadVersion: hasPermission('version', 'download'),
    canCreateHotfix: hasPermission('version', 'createHotfix'),
    canEditComment: hasPermission('version', 'editComment'),

    // ========================================================================
    // 패치 관리 권한
    // ========================================================================
    canAddPatch: hasPermission('patch', 'create'),
    canDeletePatch: hasPermission('patch', 'delete'),
    canViewPatchContent: hasPermission('patch', 'viewContent'),
    canDownloadPatch: hasPermission('patch', 'download'),

    // ========================================================================
    // 프로젝트 관리 권한
    // ========================================================================
    canViewProject: hasPermission('project', 'view'),
    canCreateProject: hasPermission('project', 'create'),
    canEditProject: hasPermission('project', 'edit'),
    canDeleteProject: hasPermission('project', 'delete'),
    canManageProjectFiles: hasPermission('project', 'manageFiles'),
    canViewOnboarding: hasPermission('project', 'viewOnboarding'),
    canDownloadOnboarding: hasPermission('project', 'downloadOnboarding'),
    canViewInstall: hasPermission('project', 'viewInstall'),
    canDownloadInstall: hasPermission('project', 'downloadInstall'),

    // ========================================================================
    // 사이트 관리 권한
    // ========================================================================
    canViewSite: hasPermission('site', 'view'),
    canCreateSite: hasPermission('site', 'create'),
    canEditSite: hasPermission('site', 'edit'),
    canDeleteSite: hasPermission('site', 'delete'),
    canViewSiteNote: hasPermission('site', 'viewNote'),
    canCreateSiteNote: hasPermission('site', 'createNote'),
    canEditSiteNote: hasPermission('site', 'editNote'),
    canDeleteSiteNote: hasPermission('site', 'deleteNote'),
    canViewPatchHistory: hasPermission('site', 'viewPatchHistory'),
    canDeletePatchHistory: hasPermission('site', 'deletePatchHistory'),
    canResetSitePatchState: hasPermission('site', 'resetPatchState'),

    // ========================================================================
    // 부서 관리 권한
    // ========================================================================
    canViewDepartment: hasPermission('department', 'view'),
    canCreateDepartment: hasPermission('department', 'create'),
    canEditDepartment: hasPermission('department', 'edit'),
    canMoveDepartment: hasPermission('department', 'move'),
    canDeleteDepartment: hasPermission('department', 'delete'),
    canAssignAccount: hasPermission('department', 'assignAccount'),
    canMoveAccount: hasPermission('department', 'moveAccount'),

    // ========================================================================
    // 계정 관리 권한
    // ========================================================================
    canViewAccount: hasPermission('account', 'view'),
    canEditAccount: hasPermission('account', 'edit'),
    canDeleteAccount: hasPermission('account', 'delete'),
    canResetAccountPassword: hasPermission('account', 'resetPassword'),

    // ========================================================================
    // 리소스 관리 권한
    // ========================================================================
    canManageService: hasPermission('resource', 'manageService'),
    canManageLink: hasPermission('resource', 'manageLink'),
    canManageFile: hasPermission('resource', 'manageFile'),
    canViewPublishing: hasPermission('resource', 'viewPublishing'),
    canDownloadPublishing: hasPermission('resource', 'downloadPublishing'),
    canCreatePublishing: hasPermission('resource', 'createPublishing'),
    canEditPublishing: hasPermission('resource', 'editPublishing'),
    canDeletePublishing: hasPermission('resource', 'deletePublishing'),

    // ========================================================================
    // 유틸리티
    // ========================================================================
    hasPermission,
    hasRouteAccess,
  }
}
