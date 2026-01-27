/**
 * API Log API
 * API 로그 API 클라이언트
 */

import { apiClient } from '@/shared/api/client'

import type { ApiLog, ApiLogListItem, ApiLogSearchParams, PageResponse } from '../model/types'

const BASE_URL = '/api/api-logs'

export const apiLogApi = {
  /**
   * API 로그 목록 조회 (페이징)
   */
  getList: async (params: ApiLogSearchParams = {}): Promise<PageResponse<ApiLogListItem>> => {
    const searchParams = new URLSearchParams()

    if (params.httpMethod) searchParams.append('httpMethod', params.httpMethod)
    if (params.requestUri) searchParams.append('requestUri', params.requestUri)
    if (params.responseStatus != null) searchParams.append('responseStatus', String(params.responseStatus))
    if (params.accountEmail) searchParams.append('accountEmail', params.accountEmail)
    if (params.clientIp) searchParams.append('clientIp', params.clientIp)
    if (params.startDate) searchParams.append('startDate', params.startDate)
    if (params.endDate) searchParams.append('endDate', params.endDate)
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.page != null) searchParams.append('page', String(params.page))
    if (params.size != null) searchParams.append('size', String(params.size))
    if (params.sort) searchParams.append('sort', params.sort)

    const query = searchParams.toString()
    const url = query ? `${BASE_URL}?${query}` : BASE_URL

    const response = await apiClient.get<PageResponse<ApiLogListItem>>(url)

    // Add rowNumber for display
    const startIndex = (params.page || 0) * (params.size || 20)
    return {
      ...response,
      content: response.content.map((item, index) => ({
        ...item,
        rowNumber: startIndex + index + 1,
      })),
    }
  },

  /**
   * API 로그 상세 조회
   */
  getById: async (logId: number): Promise<ApiLog> => {
    return apiClient.get<ApiLog>(`${BASE_URL}/${logId}`)
  },
}
