/**
 * Customer Site Version API
 * 고객사 사이트 컴포넌트별 현재 버전 조회 API
 */

import { apiClient } from '@/shared/api/client'

import type { SiteVersionResponse } from '../model/types'

const ENDPOINTS = {
  /** GET /api/customers/{customerId}/projects/{projectId}/site-versions */
  siteVersions: (customerId: number, projectId: string) =>
    `/api/customers/${customerId}/projects/${projectId}/site-versions`,
} as const

export const customerSiteVersionApi = {
  /** 고객사·프로젝트 기준 컴포넌트별 현재 버전 목록 조회 */
  getByCustomerAndProject: async (
    customerId: number,
    projectId: string
  ): Promise<SiteVersionResponse[]> => {
    const response = await apiClient.get<SiteVersionResponse[]>(
      ENDPOINTS.siteVersions(customerId, projectId)
    )
    return response
  },
}
