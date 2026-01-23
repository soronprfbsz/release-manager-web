/**
 * Topic Queries
 * 토픽 관련 React Query hooks
 */

import { useQuery } from '@tanstack/react-query'

import { topicApi } from '../api/topicApi'

// Query Keys Factory
export const topicKeys = {
  all: ['board', 'topics'] as const,
  lists: () => [...topicKeys.all, 'list'] as const,
  details: () => [...topicKeys.all, 'detail'] as const,
  detail: (id: string) => [...topicKeys.details(), id] as const,
}

// Query Hooks
export const useTopics = () =>
  useQuery({
    queryKey: topicKeys.lists(),
    queryFn: () => topicApi.getList(),
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  })

export const useTopic = (id: string) =>
  useQuery({
    queryKey: topicKeys.detail(id),
    queryFn: () => topicApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
