import { apiClient } from '@/shared/api/client'
import type {
  DashboardRecentData,
  TopCustomersResponse,
  MonthlyPatchesResponse,
  StatisticsParams
} from '../model/types'

const ENDPOINTS = {
  recent: '/api/dashboard/recent',
  topCustomers: '/api/statistics/patches/top-customers',
  monthlyPatches: '/api/statistics/patches/monthly',
} as const

export const dashboardApi = {
  /** 최근 데이터 조회 (최신 설치본, 최근 버전, 최근 패치) */
  getRecent: async (): Promise<DashboardRecentData> => {
    const response = await apiClient.get<DashboardRecentData>(ENDPOINTS.recent)
    return response
  },

  /** 고객사별 패치 통계 (Top N) */
  getTopCustomers: async (params?: StatisticsParams): Promise<TopCustomersResponse> => {
    const response = await apiClient.get<TopCustomersResponse>(ENDPOINTS.topCustomers, {
      params: { months: params?.months, topN: params?.topN },
    })
    return response
  },

  /** 월별 패치 통계 */
  getMonthlyPatches: async (months?: number): Promise<MonthlyPatchesResponse> => {
    const response = await apiClient.get<MonthlyPatchesResponse>(ENDPOINTS.monthlyPatches, {
      params: { months },
    })
    return response
  },
}
