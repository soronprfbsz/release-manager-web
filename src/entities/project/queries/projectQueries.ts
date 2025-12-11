/**
 * Project Query Keys and Hooks
 * 프로젝트 관련 React Query 키 팩토리 및 훅
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { projectApi } from '../api/projectApi'
import type { Project } from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 프로젝트 목록 조회 훅
 */
export function useProjects(
  options?: Omit<UseQueryOptions<Project[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: () => projectApi.getList(),
    staleTime: 10 * 60 * 1000, // 10분간 캐시
    ...options,
  })
}

/**
 * 프로젝트 상세 조회 훅
 */
export function useProject(
  id: string,
  options?: Omit<UseQueryOptions<Project, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectApi.getById(id),
    enabled: !!id,
    ...options,
  })
}
