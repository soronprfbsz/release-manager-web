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
}

export interface CustomerUpdateRequest {
  customerName?: string
  description?: string
  isActive?: boolean
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
