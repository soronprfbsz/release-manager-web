/**
 * Customer Site Version Queries
 * TanStack Query 훅 — 고객사 사이트 컴포넌트별 현재 버전
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { customerSiteVersionApi } from '../api/customerSiteVersionApi'
import type { NextPatchRangeResponse, SiteVersionResponse } from '../model/types'

// Query Keys Factory
export const customerSiteVersionKeys = {
  all: ['customer-site-versions'] as const,
  byCustomerAndProject: (customerId: number, projectId: string) =>
    [...customerSiteVersionKeys.all, customerId, projectId] as const,
  nextPatchRange: (customerId: number, projectId: string) =>
    [...customerSiteVersionKeys.all, 'next-patch-range', customerId, projectId] as const,
}

/**
 * 고객사·프로젝트 기준 사이트 버전 목록 조회
 * - customerId, projectId 둘 다 truthy 일 때만 fetch
 */
export const useCustomerSiteVersions = (
  customerId: number,
  projectId: string | undefined,
  options?: Omit<UseQueryOptions<SiteVersionResponse[]>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery({
    queryKey: customerSiteVersionKeys.byCustomerAndProject(customerId, projectId ?? ''),
    queryFn: () => customerSiteVersionApi.getByCustomerAndProject(customerId, projectId!),
    enabled: !!customerId && !!projectId,
    ...options,
  })

/**
 * 고객사·프로젝트 기준 다음 패치 추천 범위 조회
 * - customerId, projectId 둘 다 truthy 일 때만 fetch
 */
export const useNextPatchRange = (
  customerId: number | null | undefined,
  projectId: string | undefined,
  options?: Omit<UseQueryOptions<NextPatchRangeResponse>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery({
    queryKey: customerSiteVersionKeys.nextPatchRange(customerId ?? 0, projectId ?? ''),
    queryFn: () => customerSiteVersionApi.getNextPatchRange(customerId!, projectId!),
    enabled: !!customerId && !!projectId,
    ...options,
  })
