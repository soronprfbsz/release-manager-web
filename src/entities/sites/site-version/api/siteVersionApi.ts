/**
 * Site Site Version API
 * 사이트 사이트 컴포넌트별 현재 버전 조회 API
 */

import { apiClient } from '@/shared/api/client'

import type { NextPatchRangeResponse, SiteVersionResponse } from '../model/types'

const ENDPOINTS = {
  /** GET /api/sites/{siteId}/projects/{projectId}/site-versions */
  siteVersions: (siteId: number, projectId: string) =>
    `/api/sites/${siteId}/projects/${projectId}/site-versions`,
  /** GET /api/sites/{siteId}/projects/{projectId}/next-patch-range */
  nextPatchRange: (siteId: number, projectId: string) =>
    `/api/sites/${siteId}/projects/${projectId}/next-patch-range`,
} as const

export const siteVersionApi = {
  /** 사이트·프로젝트 기준 컴포넌트별 현재 버전 목록 조회 */
  getBySiteAndProject: async (
    siteId: number,
    projectId: string
  ): Promise<SiteVersionResponse[]> => {
    return await apiClient.get<SiteVersionResponse[]>(
      ENDPOINTS.siteVersions(siteId, projectId)
    )
  },

  /** 사이트·프로젝트 기준 다음 패치 추천 범위 조회 */
  getNextPatchRange: async (
    siteId: number,
    projectId: string
  ): Promise<NextPatchRangeResponse> => {
    return await apiClient.get<NextPatchRangeResponse>(
      ENDPOINTS.nextPatchRange(siteId, projectId)
    )
  },
}
