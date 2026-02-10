/**
 * Link API
 * 링크 관련 API
 */

import { apiClient } from '@/shared/api/client'

import type { Link, LinkCreateRequest } from '../model/types'

const ENDPOINTS = {
  list: '/api/resources/links',
  detail: (id: number) => `/api/resources/links/${id}`,
  reorder: '/api/resources/links/order',
} as const

export const linkApi = {
  /** 링크 목록 조회 */
  getList: async (params?: { linkCategory?: string; keyword?: string }): Promise<Link[]> => {
    const queryParams = new URLSearchParams()
    if (params?.linkCategory) queryParams.append('linkCategory', params.linkCategory)
    if (params?.keyword) queryParams.append('keyword', params.keyword)

    const queryString = queryParams.toString()
    const url = queryString ? `${ENDPOINTS.list}?${queryString}` : ENDPOINTS.list

    const response = await apiClient.get<Link[]>(url)
    return response
  },

  /** 링크 생성 */
  create: async (data: LinkCreateRequest): Promise<Link> => {
    const response = await apiClient.post<Link>(ENDPOINTS.list, data)
    return response
  },

  /** 링크 상세 조회 */
  getDetail: async (id: number): Promise<Link> => {
    const response = await apiClient.get<Link>(ENDPOINTS.detail(id))
    return response
  },

  /** 링크 수정 */
  update: async (id: number, data: LinkCreateRequest): Promise<Link> => {
    const response = await apiClient.put<Link>(ENDPOINTS.detail(id), data)
    return response
  },

  /** 링크 삭제 */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.detail(id))
  },

  /** 링크 순서 변경 */
  reorder: async (linkCategory: string, resourceLinkIds: number[]): Promise<void> => {
    await apiClient.patch(ENDPOINTS.reorder, { linkCategory, resourceLinkIds })
  },
}

