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
  /** 강제 비밀번호 변경 필요 여부 */
  mustChangePassword: boolean
}

/** 내 정보 수정 요청 */
export interface MyAccountUpdateRequest {
  accountName?: string
  position?: string
  avatarStyle?: string
  avatarSeed?: string
}

/** 비밀번호 변경 요청 (자가 변경 / 강제 변경 공용) */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

/** 비밀번호 초기화 응답 (임시비번 1회 노출) */
export interface ResetPasswordResponse {
  temporaryPassword: string
}
