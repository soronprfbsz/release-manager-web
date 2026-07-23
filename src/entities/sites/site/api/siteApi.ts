import { apiClient } from '@/shared/api/client'
import type { PageResponse, PaginationParams } from '@/shared/api/types'

import type { Site, SiteCreateRequest, SiteUpdateRequest, ResetPatchStateResponse } from '../model/types'

const ENDPOINTS = {
  base: '/api/sites',
  byId: (id: number) => `/api/sites/${id}`,
  status: (id: number) => `/api/sites/${id}/status`,
  resetPatchState: (id: number) => `/api/sites/${id}/reset-patch-state`,
} as const

export const siteApi = {
  /** 사이트 목록 조회 (페이징) */
  getList: async (params?: PaginationParams & { isActive?: boolean; keyword?: string; projectId?: string }): Promise<PageResponse<Site>> => {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append('page', String(params.page))
    if (params?.size !== undefined) queryParams.append('size', String(params.size))
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))
    if (params?.keyword) queryParams.append('keyword', params.keyword)
    if (params?.projectId) queryParams.append('projectId', params.projectId)

    const queryString = queryParams.toString()
    const url = queryString ? `${ENDPOINTS.base}?${queryString}` : ENDPOINTS.base

    const response = await apiClient.get<PageResponse<Site>>(url)
    return response
  },

  /** 사이트 상세 조회 */
  getById: async (id: number): Promise<Site> => {
    const response = await apiClient.get<Site>(ENDPOINTS.byId(id))
    return response
  },

  /** 사이트 생성 */
  create: async (request: SiteCreateRequest): Promise<Site> => {
    const response = await apiClient.post<Site>(ENDPOINTS.base, request)
    return response
  },

  /** 사이트 수정 */
  update: async (id: number, request: SiteUpdateRequest): Promise<Site> => {
    const response = await apiClient.put<Site>(ENDPOINTS.byId(id), request)
    return response
  },

  /** 사이트 삭제 */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(id))
  },

  /** 사이트 활성화 상태 변경 */
  updateStatus: async (id: number, isActive: boolean): Promise<void> => {
    await apiClient.patch(`${ENDPOINTS.status(id)}?isActive=${isActive}`)
  },

  /** 사이트 패치 적용 이력 전체 초기화 (ADMIN 전용) */
  resetPatchState: async (id: number): Promise<ResetPatchStateResponse> => {
    return await apiClient.post<ResetPatchStateResponse>(ENDPOINTS.resetPatchState(id), null)
  },
}
