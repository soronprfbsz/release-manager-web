/**
 * CustomerNote Entity Types
 * 고객사 특이사항 도메인 타입 정의
 */

export interface CustomerNote {
  noteId: number
  customerId: number
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

export interface CustomerNoteCreateRequest {
  title: string
  content: string
}

export interface CustomerNoteUpdateRequest {
  title: string
  content: string
}
