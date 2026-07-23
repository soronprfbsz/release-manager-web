/**
 * Site Site Version Queries
 * TanStack Query 훅 — 사이트 사이트 컴포넌트별 현재 버전
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { siteVersionApi } from '../api/siteVersionApi'

import type { NextPatchRangeResponse, SiteVersionResponse } from '../model/types'

// Query Keys Factory
export const siteVersionKeys = {
  all: ['site-versions'] as const,
  bySiteAndProject: (siteId: number, projectId: string) =>
    [...siteVersionKeys.all, siteId, projectId] as const,
  nextPatchRange: (siteId: number, projectId: string) =>
    [...siteVersionKeys.all, 'next-patch-range', siteId, projectId] as const,
}

/**
 * 사이트·프로젝트 기준 사이트 버전 목록 조회
 * - siteId, projectId 둘 다 truthy 일 때만 fetch
 */
export const useSiteVersions = (
  siteId: number,
  projectId: string | undefined,
  options?: Omit<UseQueryOptions<SiteVersionResponse[]>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery({
    queryKey: siteVersionKeys.bySiteAndProject(siteId, projectId ?? ''),
    queryFn: () => siteVersionApi.getBySiteAndProject(siteId, projectId!),
    enabled: !!siteId && !!projectId,
    ...options,
  })

/**
 * 사이트·프로젝트 기준 다음 패치 추천 범위 조회
 * - siteId, projectId 둘 다 truthy 일 때만 fetch
 */
export const useNextPatchRange = (
  siteId: number | null | undefined,
  projectId: string | undefined,
  options?: Omit<UseQueryOptions<NextPatchRangeResponse>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery({
    queryKey: siteVersionKeys.nextPatchRange(siteId ?? 0, projectId ?? ''),
    queryFn: () => siteVersionApi.getNextPatchRange(siteId!, projectId!),
    enabled: !!siteId && !!projectId,
    ...options,
  })
