/**
 * Account Entity Types
 * 계정 도메인 타입 정의
 */

export interface Account {
  rowNumber: number
  accountId: number
  email: string
  accountName: string
  phone: string | null
  position: string | null
  positionName: string | null
  departmentId: number | null
  departmentName: string | null
  avatarStyle?: string
  avatarSeed?: string
  role: string
  status: string
  lastLoginAt: string | null
  createdAt: string
}

/** 계정 수정 요청 (ADMIN 전용) */
export interface AccountUpdateRequest {
  accountName?: string
  phone?: string
  position?: string
  departmentId?: number | null
  /** true 전송 시 부서 배치 해제 */
  unassignDepartment?: boolean
  role?: string
  status?: string
}

/** 내 정보 응답 */
export interface MyAccount {
  accountId: number
  email: string
  accountName: string
  position: string | null
  positionName: string | null
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
  position?: string
  avatarStyle?: string
  avatarSeed?: string
}
