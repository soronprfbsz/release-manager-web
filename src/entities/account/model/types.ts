/**
 * Account Entity Types
 * 계정 도메인 타입 정의
 */

export interface Account {
  rowNumber: number
  accountId: number
  username: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AccountUpdateRequest {
  email?: string
  role?: string
  isActive?: boolean
}
