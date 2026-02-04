/**
 * Permission Configuration
 * 역할 기반 권한 설정 - 라우트 접근 및 기능별 액션 권한 정의
 */

import { ROUTES } from './constants'

// ============================================================================
// Types
// ============================================================================

/** 시스템 역할 */
export type Role = 'ADMIN' | 'OPERATOR' | 'DEVELOPER' | 'USER' | 'GUEST'

/** 모든 역할 */
const ALL_ROLES: readonly Role[] = ['ADMIN', 'OPERATOR', 'DEVELOPER', 'USER', 'GUEST'] as const

/** GUEST 제외 */
const AUTHENTICATED_ROLES: readonly Role[] = ['ADMIN', 'OPERATOR', 'DEVELOPER', 'USER'] as const

// ============================================================================
// Route Permissions (라우트별 접근 가능 역할)
// ============================================================================

export const ROUTE_PERMISSIONS: Record<string, readonly Role[]> = {
  // 공개 페이지 (모든 역할)
  [ROUTES.HOME]: ALL_ROLES,
  [ROUTES.RELEASES]: ALL_ROLES,
  [ROUTES.PATCHES]: ALL_ROLES,

  // 운영관리 - 고객사/부서/계정/프로젝트
  [ROUTES.OPERATIONS.CUSTOMERS]: AUTHENTICATED_ROLES,
  [ROUTES.OPERATIONS.DEPARTMENTS]: AUTHENTICATED_ROLES,
  [ROUTES.OPERATIONS.ACCOUNTS]: AUTHENTICATED_ROLES,
  [ROUTES.OPERATIONS.PROJECTS]: AUTHENTICATED_ROLES,

  // 운영관리 - 파일동기화 (ADMIN only)
  [ROUTES.OPERATIONS.FILE_SYNC]: ['ADMIN'] as readonly Role[],

  // 운영관리 - 운영이력
  [ROUTES.OPERATIONS.HISTORY]: ['ADMIN', 'OPERATOR'] as readonly Role[],

  // 지원 - 원격작업
  [ROUTES.SUPPORT.REMOTE_JOBS.MARIADB]: AUTHENTICATED_ROLES,
  [ROUTES.SUPPORT.REMOTE_JOBS.TERMINAL]: AUTHENTICATED_ROLES,
  [ROUTES.SUPPORT.REMOTE_JOBS.SCHEDULER]: ['ADMIN', 'DEVELOPER'] as readonly Role[],

  // 지원 - 공유
  [ROUTES.SUPPORT.SHARING.RESOURCES]: AUTHENTICATED_ROLES,
  [ROUTES.SUPPORT.SHARING.COWORK]: AUTHENTICATED_ROLES,
} as const

// ============================================================================
// Action Permissions (기능/액션별 허용 역할)
// ============================================================================

export const ACTION_PERMISSIONS = {
  // 버전 관리
  version: {
    create: ['ADMIN', 'DEVELOPER'] as readonly Role[],
    delete: ['ADMIN'] as readonly Role[],
    approve: ['ADMIN', 'DEVELOPER'] as readonly Role[],
    download: ['ADMIN', 'DEVELOPER'] as readonly Role[],
    createHotfix: ['ADMIN', 'DEVELOPER'] as readonly Role[],
    editComment: ['ADMIN', 'DEVELOPER'] as readonly Role[],
  },

  // 패치 관리
  patch: {
    create: ['ADMIN', 'DEVELOPER', 'OPERATOR', 'USER'] as readonly Role[],
    delete: ['ADMIN', 'DEVELOPER', 'OPERATOR', 'USER'] as readonly Role[],
    viewContent: ['ADMIN', 'DEVELOPER', 'OPERATOR', 'USER'] as readonly Role[],
    download: ['ADMIN', 'DEVELOPER', 'OPERATOR', 'USER'] as readonly Role[],
  },

  // 프로젝트 관리
  project: {
    view: ['ADMIN', 'DEVELOPER', 'OPERATOR'] as readonly Role[],
    create: ['ADMIN', 'DEVELOPER', 'OPERATOR'] as readonly Role[],
    edit: ['ADMIN', 'DEVELOPER', 'OPERATOR'] as readonly Role[],
    delete: ['ADMIN', 'DEVELOPER', 'OPERATOR'] as readonly Role[],
    manageFiles: ['ADMIN', 'DEVELOPER', 'OPERATOR'] as readonly Role[],
    viewOnboarding: AUTHENTICATED_ROLES,
    downloadOnboarding: AUTHENTICATED_ROLES,
    viewInstall: AUTHENTICATED_ROLES,
    downloadInstall: AUTHENTICATED_ROLES,
  },

  // 고객사 관리
  customer: {
    view: AUTHENTICATED_ROLES,
    create: AUTHENTICATED_ROLES,
    edit: AUTHENTICATED_ROLES,
    delete: AUTHENTICATED_ROLES,
    viewNote: AUTHENTICATED_ROLES,
    createNote: AUTHENTICATED_ROLES,
    editNote: AUTHENTICATED_ROLES,
    deleteNote: AUTHENTICATED_ROLES,
    viewPatchHistory: AUTHENTICATED_ROLES,
    deletePatchHistory: ['ADMIN', 'OPERATOR'] as readonly Role[],
  },

  // 부서 관리
  department: {
    view: AUTHENTICATED_ROLES,
    create: ['ADMIN', 'OPERATOR'] as readonly Role[],
    edit: ['ADMIN', 'OPERATOR'] as readonly Role[],
    move: ['ADMIN', 'OPERATOR'] as readonly Role[],
    delete: ['ADMIN', 'OPERATOR'] as readonly Role[],
    assignAccount: ['ADMIN', 'OPERATOR'] as readonly Role[],
    moveAccount: ['ADMIN', 'OPERATOR'] as readonly Role[],
  },

  // 계정 관리
  account: {
    view: AUTHENTICATED_ROLES,
    edit: ['ADMIN', 'OPERATOR'] as readonly Role[],
    delete: ['ADMIN', 'OPERATOR'] as readonly Role[],
  },

  // 리소스 관리
  resource: {
    manageService: ['ADMIN', 'DEVELOPER', 'OPERATOR'] as readonly Role[],
    manageLink: AUTHENTICATED_ROLES,
    manageFile: AUTHENTICATED_ROLES,
    viewPublishing: AUTHENTICATED_ROLES,
    downloadPublishing: AUTHENTICATED_ROLES,
    createPublishing: ['ADMIN', 'DEVELOPER', 'OPERATOR'] as readonly Role[],
    editPublishing: ['ADMIN', 'DEVELOPER', 'OPERATOR'] as readonly Role[],
    deletePublishing: ['ADMIN', 'DEVELOPER', 'OPERATOR'] as readonly Role[],
  },
} as const
