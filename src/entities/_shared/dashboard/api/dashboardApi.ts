import { apiClient } from '@/shared/api/client'

import type {
  RecentStandardResponse,
  RecentCustomResponse,
  RecentPatchResponse,
  TopCustomersResponse,
  MonthlyPatchesResponse,
  StatisticsParams,
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
  recentCustom: (id: string) => `/api/projects/${id}/dashboard/recent/custom`,
  recentPatch: (id: string) => `/api/projects/${id}/dashboard/recent/patch`,
  topCustomers: (id: string) => `/api/projects/${id}/analytics/patches/top-customers`,
  monthlyPatches: (id: string) => `/api/projects/${id}/analytics/patches/monthly`,
} as const

export const dashboardApi = {
  /** 표준본 최신 릴리즈 버전 조회 */
  getRecentStandard: async (projectId: string, params?: RecentVersionParams): Promise<RecentStandardResponse> => {
    const response = await apiClient.get<RecentStandardResponse>(ENDPOINTS.recentStandard(projectId), {
      params: { limit: params?.limit },
    })
    return response
  },

  /** 커스텀본 최신 릴리즈 버전 조회 */
  getRecentCustom: async (projectId: string, params?: RecentVersionParams): Promise<RecentCustomResponse> => {
    const response = await apiClient.get<RecentCustomResponse>(ENDPOINTS.recentCustom(projectId), {
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

  /** 고객사별 패치 통계 (Top N) */
  getTopCustomers: async (projectId: string, params?: StatisticsParams): Promise<TopCustomersResponse> => {
    const response = await apiClient.get<TopCustomersResponse>(ENDPOINTS.topCustomers(projectId), {
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
}
