/**
 * Dashboard Query Keys and Hooks
 * 대시보드 관련 React Query 키 팩토리 및 훅
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { dashboardApi } from '../api/dashboardApi'
import type {
  DashboardRecentData,
  TopCustomersResponse,
  MonthlyPatchesResponse,
  StatisticsParams,
  RecentDataParams,
} from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const dashboardKeys = {
  all: ['dashboard'] as const,
  recent: (projectId: string, params?: RecentDataParams) =>
    [...dashboardKeys.all, 'recent', projectId, params] as const,
  topCustomers: (projectId: string, params?: StatisticsParams) =>
    [...dashboardKeys.all, 'top-customers', projectId, params] as const,
  monthlyPatches: (projectId: string, months?: number) =>
    [...dashboardKeys.all, 'monthly-patches', projectId, months] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 최근 데이터 조회 훅 (최신 설치본, 최근 버전, 최근 패치)
 */
export function useDashboardRecent(
  projectId: string,
  params?: RecentDataParams,
  options?: Omit<UseQueryOptions<DashboardRecentData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.recent(projectId, params),
    queryFn: () => dashboardApi.getRecent(projectId, params),
    enabled: !!projectId,
    ...options,
  })
}

/**
 * 고객사별 패치 통계 조회 훅 (Top N)
 */
export function useDashboardTopCustomers(
  projectId: string,
  params?: StatisticsParams,
  options?: Omit<UseQueryOptions<TopCustomersResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.topCustomers(projectId, params),
    queryFn: () => dashboardApi.getTopCustomers(projectId, params),
    enabled: !!projectId,
    ...options,
  })
}

/**
 * 월별 패치 통계 조회 훅
 */
export function useDashboardMonthlyPatches(
  projectId: string,
  months?: number,
  options?: Omit<UseQueryOptions<MonthlyPatchesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.monthlyPatches(projectId, months),
    queryFn: () => dashboardApi.getMonthlyPatches(projectId, months),
    enabled: !!projectId,
    ...options,
  })
}
