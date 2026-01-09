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

/** 내 정보 응답 */
export interface MyAccount {
  accountId: number
  email: string
  accountName: string
  role: string
  status: string
  avatarStyle?: string
  avatarSeed?: string
  createdAt: string
  updatedAt: string
}

/** 내 정보 수정 요청 */
export interface MyAccountUpdateRequest {
  accountName?: string
  password?: string
  avatarStyle?: string
  avatarSeed?: string
}
