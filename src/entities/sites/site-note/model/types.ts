/**
 * SiteNote Entity Types
 * 사이트 특이사항 도메인 타입 정의
 */

export interface SiteNote {
  noteId: number
  siteId: number
  title: string
  content: string
  createdAt: string
  updatedAt: string
  createdByEmail: string
  createdByName: string
  createdByAvatarStyle?: string
  createdByAvatarSeed?: string
  updatedByEmail?: string
  updatedByAccountName?: string
  updatedByAvatarStyle?: string
  updatedByAvatarSeed?: string
}

export interface SiteNoteCreateRequest {
  title: string
  content: string
}

export interface SiteNoteUpdateRequest {
  title: string
  content: string
}
