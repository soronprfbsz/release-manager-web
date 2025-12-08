import { apiClient } from '@/shared/api/client'

import type {
  DashboardRecentData,
  TopCustomersResponse,
  MonthlyPatchesResponse,
  StatisticsParams,
  RecentDataParams
} from '../model/types'

const ENDPOINTS = {
  recent: (projectId: string) => `/api/projects/${projectId}/dashboard/recent`,
  topCustomers: (projectId: string) => `/api/projects/${projectId}/analytics/patches/top-customers`,
  monthlyPatches: (projectId: string) => `/api/projects/${projectId}/analytics/patches/monthly`,
} as const

export const dashboardApi = {
  /** 최근 데이터 조회 (최신 설치본, 최근 버전, 최근 패치) */
  getRecent: async (projectId: string, params?: RecentDataParams): Promise<DashboardRecentData> => {
    const response = await apiClient.get<DashboardRecentData>(ENDPOINTS.recent(projectId), {
      params: { versionLimit: params?.versionLimit, patchLimit: params?.patchLimit },
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
