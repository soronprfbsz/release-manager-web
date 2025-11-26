import { apiClient } from '@/shared/api/client'
import type { PageResponse, PaginationParams } from '@/shared/api/types'
import type { Customer, CustomerCreateRequest, CustomerUpdateRequest } from '../model/types'

export const customerApi = {
  /** 고객사 목록 조회 (페이징) */
  getList: async (params?: PaginationParams & { isActive?: boolean; keyword?: string }): Promise<PageResponse<Customer>> => {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append('page', String(params.page))
    if (params?.size !== undefined) queryParams.append('size', String(params.size))
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))
    if (params?.keyword) queryParams.append('keyword', params.keyword)

    const queryString = queryParams.toString()
    const url = queryString ? `/api/customers?${queryString}` : '/api/customers'

    const response = await apiClient.get<PageResponse<Customer>>(url)
    return response
  },

  /** 고객사 상세 조회 */
  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/api/customers/${id}`)
    return response
  },

  /** 고객사 생성 */
  create: async (request: CustomerCreateRequest): Promise<Customer> => {
    const response = await apiClient.post<Customer>('/api/customers', request)
    return response
  },

  /** 고객사 수정 */
  update: async (id: number, request: CustomerUpdateRequest): Promise<Customer> => {
    const response = await apiClient.put<Customer>(`/api/customers/${id}`, request)
    return response
  },

  /** 고객사 삭제 */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/customers/${id}`)
  },

  /** 고객사 활성화 상태 변경 */
  updateStatus: async (id: number, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/api/customers/${id}/status?isActive=${isActive}`)
  },
}
