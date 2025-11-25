import { apiClient } from '@/shared/api/client'
import type { Customer, CustomerCreateRequest, CustomerUpdateRequest } from '../model/types'

export const customerApi = {
  /** 고객사 목록 조회 */
  getList: async (isActive?: boolean, keyword?: string): Promise<Customer[]> => {
    const params = new URLSearchParams()
    if (isActive !== undefined) params.append('isActive', String(isActive))
    if (keyword) params.append('keyword', keyword)

    const queryString = params.toString()
    const url = queryString ? `/api/v1/customers?${queryString}` : '/api/v1/customers'

    const response = await apiClient.get<Customer[]>(url)
    return response.data
  },

  /** 고객사 상세 조회 */
  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/api/v1/customers/${id}`)
    return response.data
  },

  /** 고객사 생성 */
  create: async (request: CustomerCreateRequest): Promise<Customer> => {
    const response = await apiClient.post<Customer>('/api/v1/customers', request)
    return response.data
  },

  /** 고객사 수정 */
  update: async (id: number, request: CustomerUpdateRequest): Promise<Customer> => {
    const response = await apiClient.put<Customer>(`/api/v1/customers/${id}`, request)
    return response.data
  },

  /** 고객사 삭제 */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/customers/${id}`)
  },

  /** 고객사 활성화 상태 변경 */
  updateStatus: async (id: number, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/api/v1/customers/${id}/status?isActive=${isActive}`)
  },
}
