import { apiClient } from '@/shared/api/client'

import type {
  RecentStandardResponse,
  RecentBuildResponse,
  RecentPatchResponse,
  TopSitesResponse,
  MonthlyPatchesResponse,
  StatisticsParams,
  VersionSiteDistributionResponse,
} from '../model/types'

/** 요청 파라미터 */
export interface RecentVersionParams {
  limit?: number
}

export interface RecentPatchParams {
  limit?: number
}

const ENDPOINTS = {
  recentStandard: (id: string) => `/api/projects/${id}/dashboard/recent/standard`,
  recentBuild: (id: string) => `/api/projects/${id}/dashboard/recent/build`,
  recentPatch: (id: string) => `/api/projects/${id}/dashboard/recent/patch`,
  topSites: (id: string) => `/api/projects/${id}/analytics/patches/top-sites`,
  monthlyPatches: (id: string) => `/api/projects/${id}/analytics/patches/monthly`,
  versionSites: (id: string) => `/api/projects/${id}/analytics/patches/version-sites`,
} as const

export const dashboardApi = {
  /** 표준본 최신 릴리즈 버전 조회 */
  getRecentStandard: async (projectId: string, params?: RecentVersionParams): Promise<RecentStandardResponse> => {
    const response = await apiClient.get<RecentStandardResponse>(ENDPOINTS.recentStandard(projectId), {
      params: { limit: params?.limit },
    })
    return response
  },

  /** 최신 빌드 버전 조회 (표준 + 커스텀 통합) */
  getRecentBuild: async (projectId: string, params?: RecentVersionParams): Promise<RecentBuildResponse> => {
    const response = await apiClient.get<RecentBuildResponse>(ENDPOINTS.recentBuild(projectId), {
      params: { limit: params?.limit },
    })
    return response
  },

  /** 최근 생성 패치 조회 (표준 + 커스텀) */
  getRecentPatch: async (projectId: string, params?: RecentPatchParams): Promise<RecentPatchResponse> => {
    const response = await apiClient.get<RecentPatchResponse>(ENDPOINTS.recentPatch(projectId), {
      params: { limit: params?.limit },
    })
    return response
  },

  /** 사이트별 패치 통계 (Top N) */
  getTopSites: async (projectId: string, params?: StatisticsParams): Promise<TopSitesResponse> => {
    const response = await apiClient.get<TopSitesResponse>(ENDPOINTS.topSites(projectId), {
      params: { months: params?.months, topN: params?.topN },
    })
    return response
  },

  /** 월별 패치 통계 */
  getMonthlyPatches: async (projectId: string, months?: number): Promise<MonthlyPatchesResponse> => {
    const response = await apiClient.get<MonthlyPatchesResponse>(ENDPOINTS.monthlyPatches(projectId), {
      params: { months },
    })
    return response
  },

  /** 버전별 사이트 분포 — 각 사이트의 최신 완료 patch_history.to_version 기준 */
  getVersionSites: async (projectId: string): Promise<VersionSiteDistributionResponse> => {
    const response = await apiClient.get<VersionSiteDistributionResponse>(ENDPOINTS.versionSites(projectId))
    return response
  },
}
