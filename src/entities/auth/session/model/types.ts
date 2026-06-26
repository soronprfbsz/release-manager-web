/**
 * Session Entity Types
 * 인증/세션 도메인 타입 정의
 */

export interface AccountInfo {
  accountId: number
  email: string
  accountName: string
  position: string | null
  positionName: string | null
  departmentId: number | null
  departmentName: string | null
  role: string
  avatarStyle?: string
  avatarSeed?: string
  /** 강제 비밀번호 변경 필요 여부 (임시비번 초기화 시 true) */
  mustChangePassword?: boolean
}

export interface SignUpRequest {
  email: string
  password: string
  accountName: string
  position?: string
}

export interface SignUpResponse {
  accountId: number
  email: string
  accountName: string
  role: string
  createdAt: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface AccessTokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  accountInfo: AccountInfo
}

/** 비밀번호 재설정 안내용 관리자 연락처 */
export interface AdminContact {
  departmentName: string
  accountName: string
  email: string
  role: 'ADMIN' | 'OPERATOR'
}
