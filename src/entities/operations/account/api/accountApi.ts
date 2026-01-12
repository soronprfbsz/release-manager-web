import { apiClient } from '@/shared/api/client'
import type { PageResponse, PaginationParams } from '@/shared/api/types'

import type { Account, AccountUpdateRequest, MyAccount, MyAccountUpdateRequest } from '../model/types'

const ENDPOINTS = {
  base: '/api/accounts',
  byId: (id: number) => `/api/accounts/${id}`,
  me: '/api/accounts/me',
} as const

export interface AccountListParams extends PaginationParams {
  keyword?: string
  departmentId?: number | null  // null = 미배치 계정
  includeSubDepartments?: boolean  // true = 하위 부서 포함
  departmentType?: string  // 부서 타입 필터 (e.g. 'ENGINEER')
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
}
