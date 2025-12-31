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
