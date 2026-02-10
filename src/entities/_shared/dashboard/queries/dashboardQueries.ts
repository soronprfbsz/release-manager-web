/**
 * Dashboard Query Keys and Hooks
 * 대시보드 관련 React Query 키 팩토리 및 훅
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { dashboardApi, type RecentVersionParams, type RecentPatchParams } from '../api/dashboardApi'

import type {
  RecentStandardResponse,
  RecentCustomResponse,
  RecentPatchResponse,
  TopCustomersResponse,
  MonthlyPatchesResponse,
  StatisticsParams,
} from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const dashboardKeys = {
  all: ['dashboard'] as const,
  recentStandard: (projectId: string, params?: RecentVersionParams) =>
    [...dashboardKeys.all, 'recent-standard', projectId, params] as const,
  recentCustom: (projectId: string, params?: RecentVersionParams) =>
    [...dashboardKeys.all, 'recent-custom', projectId, params] as const,
  recentPatch: (projectId: string, params?: RecentPatchParams) =>
    [...dashboardKeys.all, 'recent-patch', projectId, params] as const,
  topCustomers: (projectId: string, params?: StatisticsParams) =>
    [...dashboardKeys.all, 'top-customers', projectId, params] as const,
  monthlyPatches: (projectId: string, months?: number) =>
    [...dashboardKeys.all, 'monthly-patches', projectId, months] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 표준본 최신 릴리즈 버전 조회 훅
 */
export function useDashboardRecentStandard(
  projectId: string,
  params?: RecentVersionParams,
  options?: Omit<UseQueryOptions<RecentStandardResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.recentStandard(projectId, params),
    queryFn: () => dashboardApi.getRecentStandard(projectId, params),
    enabled: !!projectId,
    ...options,
  })
}

/**
 * 커스텀본 최신 릴리즈 버전 조회 훅
 */
export function useDashboardRecentCustom(
  projectId: string,
  params?: RecentVersionParams,
  options?: Omit<UseQueryOptions<RecentCustomResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.recentCustom(projectId, params),
    queryFn: () => dashboardApi.getRecentCustom(projectId, params),
    enabled: !!projectId,
    ...options,
  })
}

/**
 * 최근 생성 패치 조회 훅 (표준 + 커스텀)
 */
export function useDashboardRecentPatch(
  projectId: string,
  params?: RecentPatchParams,
  options?: Omit<UseQueryOptions<RecentPatchResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardKeys.recentPatch(projectId, params),
    queryFn: () => dashboardApi.getRecentPatch(projectId, params),
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
