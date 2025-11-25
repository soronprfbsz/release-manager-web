import { apiClient } from './client'
import type {
  Customer,
  CustomerCreateRequest,
  CustomerUpdateRequest,
  CustomerListResponse,
  ApiResponse
} from './types'

export const customerApi = {
  // 고객사 목록 조회
  getCustomers: async (isActive?: boolean, keyword?: string): Promise<Customer[]> => {
    const params = new URLSearchParams()
    if (isActive !== undefined) params.append('isActive', String(isActive))
    if (keyword) params.append('keyword', keyword)

    const queryString = params.toString()
    const url = queryString ? `/api/v1/customers?${queryString}` : '/api/v1/customers'

    const response = await apiClient.get<CustomerListResponse>(url)
    return response.data.data
  },

  // 고객사 상세 조회
  getCustomerById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<ApiResponse<Customer>>(`/api/v1/customers/${id}`)
    return response.data.data
  },

  // 고객사 생성
  createCustomer: async (request: CustomerCreateRequest): Promise<Customer> => {
    const response = await apiClient.post<ApiResponse<Customer>>('/api/v1/customers', request)
    return response.data.data
  },

  // 고객사 수정
  updateCustomer: async (id: number, request: CustomerUpdateRequest): Promise<Customer> => {
    const response = await apiClient.put<ApiResponse<Customer>>(`/api/v1/customers/${id}`, request)
    return response.data.data
  },

  // 고객사 삭제
  deleteCustomer: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/customers/${id}`)
  },

  // 고객사 활성화 상태 변경
  updateCustomerStatus: async (id: number, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/api/v1/customers/${id}/status?isActive=${isActive}`)
  },
}
