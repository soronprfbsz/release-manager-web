/**
 * API Log Queries
 * API 로그 React Query 훅
 */

import { useQuery } from '@tanstack/react-query'

import { apiLogApi } from '../api/apiLogApi'
import type { ApiLogSearchParams } from '../model/types'

/** Query Keys */
export const apiLogKeys = {
  all: ['api-logs'] as const,
  lists: () => [...apiLogKeys.all, 'list'] as const,
  list: (params: ApiLogSearchParams) => [...apiLogKeys.lists(), params] as const,
  details: () => [...apiLogKeys.all, 'detail'] as const,
  detail: (id: number) => [...apiLogKeys.details(), id] as const,
}

/**
 * API 로그 목록 조회 훅
 */
export function useApiLogs(params: ApiLogSearchParams = {}) {
  return useQuery({
    queryKey: apiLogKeys.list(params),
    queryFn: () => apiLogApi.getList(params),
  })
}

/**
 * API 로그 상세 조회 훅
 */
export function useApiLog(logId: number, enabled = true) {
  return useQuery({
    queryKey: apiLogKeys.detail(logId),
    queryFn: () => apiLogApi.getById(logId),
    enabled: enabled && logId > 0,
  })
}
