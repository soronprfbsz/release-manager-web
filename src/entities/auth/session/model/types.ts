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
  role: string
  avatarStyle?: string
  avatarSeed?: string
}

export interface SignUpRequest {
  email: string
  password: string
  accountName: string
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
