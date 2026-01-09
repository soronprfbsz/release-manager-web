/**
 * Link Entity Types
 * 링크 도메인 타입 정의
 */

/** 링크 정보 */
export interface Link {
  resourceLinkId: number
  linkCategory: string
  subCategory: string | null
  linkName: string
  linkUrl: string
  description: string | null
  sortOrder: number
  createdByEmail?: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  createdAt: string
  updatedAt?: string
}

/** 링크 생성 요청 */
export interface LinkCreateRequest {
  linkCategory: string
  subCategory?: string
  linkName: string
  linkUrl: string
  description?: string
  createdBy?: string
}

/** 링크 수정 요청 */
export interface LinkUpdateRequest {
  linkCategory: string
  subCategory?: string
  linkName: string
  linkUrl: string
  description?: string
}

