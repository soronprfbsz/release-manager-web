/**
 * Account Entity Types
 * 계정 도메인 타입 정의
 */

export interface Account {
  rowNumber: number
  accountId: number
  email: string
  accountName: string
  role: string
  status: string
  lastLoginAt: string | null
  createdAt: string
}

export interface AccountUpdateRequest {
  accountName?: string
  role?: string
  status?: string
}
