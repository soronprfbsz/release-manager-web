/**
 * Site Entity Types
 * 사이트 도메인 타입 정의
 */

/** 사이트에 연결된 프로젝트 정보 */
export interface SiteProject {
  projectId: string
  projectName: string
  lastPatchedVersion: string | null
  lastPatchedAt: string | null
}

export interface Site {
  rowNumber: number
  siteId: number
  siteCode: string
  siteName: string
  description: string | null
  isActive: boolean
  hasCustomVersion: boolean
  /** 카드 글리프 텍스트 (1~3자) */
  glyphText: string | null
  /** 글리프 배경 색상 키 */
  glyphBackgroundColor: string | null
  project: SiteProject | null
  createdByEmail?: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  updatedByEmail?: string
  updatedByAvatarStyle?: string
  updatedByAvatarSeed?: string
  createdAt: string
  updatedAt: string
}

export interface SiteCreateRequest {
  siteCode: string
  siteName: string
  description?: string
  isActive?: boolean
  projectId?: string
  glyphText?: string
  glyphBackgroundColor?: string
}

export interface SiteUpdateRequest {
  siteName?: string
  description?: string
  isActive?: boolean
  /** 빈 문자열("") 전송 시 NULL 처리 */
  glyphText?: string
  /** 빈 문자열("") 전송 시 NULL 처리 */
  glyphBackgroundColor?: string
}

/**
 * 사이트 패치 상태 초기화 응답 DTO
 * POST /api/sites/{siteId}/reset-patch-state
 */
export interface ResetPatchStateResponse {
  /** site_site_version 삭제 건수 */
  deletedSiteVersionCount: number
  /** site_project.last_patched_* NULL 처리된 row 수 */
  resetSiteProjectCount: number
  /** patch_history 삭제 건수 */
  deletedPatchHistoryCount: number
}
