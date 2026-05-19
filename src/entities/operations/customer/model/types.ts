/**
 * Customer Entity Types
 * 고객사 도메인 타입 정의
 */

/** 고객사에 연결된 프로젝트 정보 */
export interface CustomerProject {
  projectId: string
  projectName: string
  lastPatchedVersion: string | null
  lastPatchedAt: string | null
}

export interface Customer {
  rowNumber: number
  customerId: number
  customerCode: string
  customerName: string
  description: string | null
  isActive: boolean
  hasCustomVersion: boolean
  /** 카드 글리프 텍스트 (1~3자) */
  glyphText: string | null
  /** 글리프 배경 색상 키 */
  glyphBackgroundColor: string | null
  project: CustomerProject | null
  createdByEmail?: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  updatedByEmail?: string
  updatedByAvatarStyle?: string
  updatedByAvatarSeed?: string
  createdAt: string
  updatedAt: string
}

export interface CustomerCreateRequest {
  customerCode: string
  customerName: string
  description?: string
  isActive?: boolean
  projectId?: string
  glyphText?: string
  glyphBackgroundColor?: string
}

export interface CustomerUpdateRequest {
  customerName?: string
  description?: string
  isActive?: boolean
  /** 빈 문자열("") 전송 시 NULL 처리 */
  glyphText?: string
  /** 빈 문자열("") 전송 시 NULL 처리 */
  glyphBackgroundColor?: string
}

/**
 * 고객사 패치 상태 초기화 응답 DTO
 * POST /api/customers/{customerId}/reset-patch-state
 */
export interface ResetPatchStateResponse {
  /** customer_site_version 삭제 건수 */
  deletedSiteVersionCount: number
  /** customer_project.last_patched_* NULL 처리된 row 수 */
  resetCustomerProjectCount: number
  /** patch_history 삭제 건수 */
  deletedPatchHistoryCount: number
}
