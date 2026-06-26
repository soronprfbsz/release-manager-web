import { apiClient } from '@/shared/api/client'
import type { PageResponse, PaginationParams } from '@/shared/api/types'

import type {
  Account,
  AccountUpdateRequest,
  ChangePasswordRequest,
  MyAccount,
  MyAccountUpdateRequest,
  ResetPasswordResponse,
} from '../model/types'

const ENDPOINTS = {
  base: '/api/accounts',
  byId: (id: number) => `/api/accounts/${id}`,
  me: '/api/accounts/me',
  myPassword: '/api/accounts/me/password',
  resetPassword: (id: number) => `/api/accounts/${id}/reset-password`,
  batchTransfer: '/api/accounts/batch-transfer-department',
} as const

export interface AccountListParams extends PaginationParams {
  keyword?: string
  departmentId?: number | null  // null = 미배치 계정
  includeSubDepartments?: boolean  // true = 하위 부서 포함
  departmentType?: string  // 부서 타입 필터 (e.g. 'ENGINEER')
}

/** 일괄 부서 이동 요청 */
export interface BatchTransferDepartmentRequest {
  accountIds: number[]
  targetDepartmentId: number | null // null = 미배치
}

/** 일괄 부서 이동 응답 */
export interface BatchTransferDepartmentResponse {
  transferredCount: number
  targetDepartmentId: number | null
  targetDepartmentName: string
  message: string
}

export const accountApi = {
  /** 계정 목록 조회 (페이징) */
  getList: async (params?: AccountListParams): Promise<PageResponse<Account>> => {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append('page', String(params.page))
    if (params?.size !== undefined) queryParams.append('size', String(params.size))
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.keyword) queryParams.append('keyword', params.keyword)
    if (params?.departmentId !== undefined) {
      queryParams.append('departmentId', String(params.departmentId))
    }
    if (params?.includeSubDepartments !== undefined) {
      queryParams.append('includeSubDepartments', String(params.includeSubDepartments))
    }
    if (params?.departmentType) {
      queryParams.append('departmentType', params.departmentType)
    }

    const queryString = queryParams.toString()
    const url = queryString ? `${ENDPOINTS.base}?${queryString}` : ENDPOINTS.base

    const response = await apiClient.get<PageResponse<Account>>(url)
    return response
  },

  /** 계정 수정 */
  update: async (id: number, request: AccountUpdateRequest): Promise<Account> => {
    const response = await apiClient.put<Account>(ENDPOINTS.byId(id), request)
    return response
  },

  /** 계정 삭제 */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(id))
  },

  /** 내 정보 조회 */
  getMe: async (): Promise<MyAccount> => {
    const response = await apiClient.get<MyAccount>(ENDPOINTS.me)
    return response
  },

  /** 내 정보 수정 */
  updateMe: async (request: MyAccountUpdateRequest): Promise<MyAccount> => {
    const response = await apiClient.patch<MyAccount>(ENDPOINTS.me, request)
    return response
  },

  /** 내 비밀번호 변경 (현재 비번 검증 후 변경) */
  changeMyPassword: async (request: ChangePasswordRequest): Promise<void> => {
    await apiClient.post<null>(ENDPOINTS.myPassword, request)
  },

  /** 비밀번호 초기화 (관리자) — 임시비번 1회 반환 */
  resetPassword: async (accountId: number): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>(
      ENDPOINTS.resetPassword(accountId)
    )
    return response
  },

  /** 일괄 부서 이동 */
  batchTransferDepartment: async (
    request: BatchTransferDepartmentRequest
  ): Promise<BatchTransferDepartmentResponse> => {
    const response = await apiClient.patch<BatchTransferDepartmentResponse>(
      ENDPOINTS.batchTransfer,
      request
    )
    return response
  },
}
