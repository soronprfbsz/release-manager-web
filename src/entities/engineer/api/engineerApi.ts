import { apiClient } from '@/shared/api/client'
import type { PageResponse, PaginationParams } from '@/shared/api/types'
import type { Engineer, EngineerCreateRequest, EngineerUpdateRequest } from '../model/types'

const ENDPOINTS = {
  base: '/api/engineers',
  byId: (id: number) => `/api/engineers/${id}`,
} as const

export const engineerApi = {
  /** 엔지니어 목록 조회 (페이징) */
  getList: async (params?: PaginationParams & { department?: string; keyword?: string }): Promise<PageResponse<Engineer>> => {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append('page', String(params.page))
    if (params?.size !== undefined) queryParams.append('size', String(params.size))
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.department) queryParams.append('department', params.department)
    if (params?.keyword) queryParams.append('keyword', params.keyword)

    const queryString = queryParams.toString()
    const url = queryString ? `${ENDPOINTS.base}?${queryString}` : ENDPOINTS.base

    const response = await apiClient.get<PageResponse<Engineer>>(url)
    return response
  },

  /** 엔지니어 상세 조회 */
  getById: async (id: number): Promise<Engineer> => {
    const response = await apiClient.get<Engineer>(ENDPOINTS.byId(id))
    return response
  },

  /** 엔지니어 생성 */
  create: async (request: EngineerCreateRequest): Promise<Engineer> => {
    const response = await apiClient.post<Engineer>(ENDPOINTS.base, request)
    return response
  },

  /** 엔지니어 수정 */
  update: async (id: number, request: EngineerUpdateRequest): Promise<Engineer> => {
    const response = await apiClient.put<Engineer>(ENDPOINTS.byId(id), request)
    return response
  },

  /** 엔지니어 삭제 */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(id))
  },
}
