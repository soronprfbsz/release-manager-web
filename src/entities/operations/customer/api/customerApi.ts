import { apiClient } from '@/shared/api/client'
import type { PageResponse, PaginationParams } from '@/shared/api/types'

import type { Customer, CustomerCreateRequest, CustomerUpdateRequest, ResetPatchStateResponse } from '../model/types'

const ENDPOINTS = {
  base: '/api/customers',
  byId: (id: number) => `/api/customers/${id}`,
  status: (id: number) => `/api/customers/${id}/status`,
  resetPatchState: (id: number) => `/api/customers/${id}/reset-patch-state`,
} as const

export const customerApi = {
  /** 고객사 목록 조회 (페이징) */
  getList: async (params?: PaginationParams & { isActive?: boolean; keyword?: string; projectId?: string }): Promise<PageResponse<Customer>> => {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append('page', String(params.page))
    if (params?.size !== undefined) queryParams.append('size', String(params.size))
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))
    if (params?.keyword) queryParams.append('keyword', params.keyword)
    if (params?.projectId) queryParams.append('projectId', params.projectId)

    const queryString = queryParams.toString()
    const url = queryString ? `${ENDPOINTS.base}?${queryString}` : ENDPOINTS.base

    const response = await apiClient.get<PageResponse<Customer>>(url)
    return response
  },

  /** 고객사 상세 조회 */
  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<Customer>(ENDPOINTS.byId(id))
    return response
  },

  /** 고객사 생성 */
  create: async (request: CustomerCreateRequest): Promise<Customer> => {
    const response = await apiClient.post<Customer>(ENDPOINTS.base, request)
    return response
  },

  /** 고객사 수정 */
  update: async (id: number, request: CustomerUpdateRequest): Promise<Customer> => {
    const response = await apiClient.put<Customer>(ENDPOINTS.byId(id), request)
    return response
  },

  /** 고객사 삭제 */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(id))
  },

  /** 고객사 활성화 상태 변경 */
  updateStatus: async (id: number, isActive: boolean): Promise<void> => {
    await apiClient.patch(`${ENDPOINTS.status(id)}?isActive=${isActive}`)
  },

  /** 고객사 패치 적용 이력 전체 초기화 (ADMIN 전용) */
  resetPatchState: async (id: number): Promise<ResetPatchStateResponse> => {
    return await apiClient.post<ResetPatchStateResponse>(ENDPOINTS.resetPatchState(id), null)
  },
}
