import { apiClient } from '@/shared/api/client'
import type { DashboardRecentData } from '../model/types'

const ENDPOINTS = {
  recent: '/api/dashboard/recent',
} as const

export const dashboardApi = {
  /** 최근 데이터 조회 (최신 설치본, 최근 버전, 최근 패치) */
  getRecent: async (): Promise<DashboardRecentData> => {
    const response = await apiClient.get<DashboardRecentData>(ENDPOINTS.recent)
    return response
  },
}
