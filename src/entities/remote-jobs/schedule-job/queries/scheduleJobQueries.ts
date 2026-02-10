/**
 * Schedule Job React Query Hooks
 * 스케줄 Job React Query 훅
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { scheduleJobApi } from '../api/scheduleJobApi'

import type {
  CreateScheduleJobRequest,
  UpdateScheduleJobRequest,
  ScheduleJobHistoryParams,
} from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const scheduleJobKeys = {
  all: ['scheduleJobs'] as const,
  lists: () => [...scheduleJobKeys.all, 'list'] as const,
  list: (jobGroup?: string) => [...scheduleJobKeys.lists(), { jobGroup }] as const,
  details: () => [...scheduleJobKeys.all, 'detail'] as const,
  detail: (jobId: number) => [...scheduleJobKeys.details(), jobId] as const,
  histories: () => [...scheduleJobKeys.all, 'histories'] as const,
  history: (jobId: number, params?: ScheduleJobHistoryParams) =>
    [...scheduleJobKeys.histories(), jobId, params] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Job 목록 조회 Query
 */
export function useScheduleJobs(jobGroup?: string) {
  return useQuery({
    queryKey: scheduleJobKeys.list(jobGroup),
    queryFn: () => scheduleJobApi.getJobs(jobGroup),
  })
}

/**
 * Job 상세 조회 Query
 */
export function useScheduleJob(jobId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: scheduleJobKeys.detail(jobId),
    queryFn: () => scheduleJobApi.getJob(jobId),
    enabled: enabled && jobId > 0,
  })
}

/**
 * Job 실행 이력 조회 Query
 */
export function useScheduleJobHistories(
  jobId: number,
  params?: ScheduleJobHistoryParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: scheduleJobKeys.history(jobId, params),
    queryFn: () => scheduleJobApi.getJobHistories(jobId, params),
    enabled: enabled && jobId > 0,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Job 생성 Mutation
 */
export function useCreateScheduleJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateScheduleJobRequest) => scheduleJobApi.createJob(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleJobKeys.lists() })
    },
  })
}

/**
 * Job 수정 Mutation
 */
export function useUpdateScheduleJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, request }: { jobId: number; request: UpdateScheduleJobRequest }) =>
      scheduleJobApi.updateJob(jobId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scheduleJobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleJobKeys.detail(variables.jobId) })
    },
  })
}

/**
 * Job 삭제 Mutation
 */
export function useDeleteScheduleJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: number) => scheduleJobApi.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleJobKeys.lists() })
    },
  })
}

/**
 * Job 토글 Mutation
 */
export function useToggleScheduleJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: number) => scheduleJobApi.toggleJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: scheduleJobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleJobKeys.detail(jobId) })
    },
  })
}

/**
 * Job 즉시 실행 Mutation
 */
export function useExecuteScheduleJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: number) => scheduleJobApi.executeJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: scheduleJobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: scheduleJobKeys.history(jobId) })
    },
  })
}

/**
 * 전체 스케줄 갱신 Mutation
 */
export function useRefreshScheduleJobs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => scheduleJobApi.refreshJobs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleJobKeys.all })
    },
  })
}
