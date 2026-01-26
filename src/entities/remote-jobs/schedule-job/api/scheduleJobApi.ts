/**
 * Schedule Job API
 * 스케줄 Job API 함수
 */

import { apiClient } from '@/shared/api'
import type { PageResponse } from '@/shared/api/types'

import type {
  ScheduleJob,
  ScheduleJobHistory,
  CreateScheduleJobRequest,
  UpdateScheduleJobRequest,
  ScheduleJobHistoryParams,
} from '../model/types'

const BASE_URL = '/api/schedules/jobs'

/**
 * Schedule Job API
 */
export const scheduleJobApi = {
  /**
   * Job 목록 조회
   */
  getJobs: async (jobGroup?: string): Promise<ScheduleJob[]> => {
    const params = jobGroup ? { jobGroup } : undefined
    const response = await apiClient.get<ScheduleJob[]>(BASE_URL, { params })
    return response
  },

  /**
   * Job 상세 조회
   */
  getJob: async (jobId: number): Promise<ScheduleJob> => {
    const response = await apiClient.get<ScheduleJob>(`${BASE_URL}/${jobId}`)
    return response
  },

  /**
   * Job 생성
   */
  createJob: async (request: CreateScheduleJobRequest): Promise<ScheduleJob> => {
    const response = await apiClient.post<ScheduleJob>(BASE_URL, request)
    return response
  },

  /**
   * Job 수정
   */
  updateJob: async (jobId: number, request: UpdateScheduleJobRequest): Promise<ScheduleJob> => {
    const response = await apiClient.put<ScheduleJob>(`${BASE_URL}/${jobId}`, request)
    return response
  },

  /**
   * Job 삭제
   */
  deleteJob: async (jobId: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${jobId}`)
  },

  /**
   * 활성화/비활성화 토글
   */
  toggleJob: async (jobId: number): Promise<ScheduleJob> => {
    const response = await apiClient.patch<ScheduleJob>(`${BASE_URL}/${jobId}/toggle`)
    return response
  },

  /**
   * 즉시 실행
   */
  executeJob: async (jobId: number): Promise<void> => {
    await apiClient.post(`${BASE_URL}/${jobId}/execute`)
  },

  /**
   * 전체 스케줄 갱신
   */
  refreshJobs: async (): Promise<void> => {
    await apiClient.post(`${BASE_URL}/refresh`)
  },

  /**
   * 실행 이력 조회
   */
  getJobHistories: async (
    jobId: number,
    params?: ScheduleJobHistoryParams
  ): Promise<PageResponse<ScheduleJobHistory>> => {
    const response = await apiClient.get<PageResponse<ScheduleJobHistory>>(
      `${BASE_URL}/${jobId}/histories`,
      { params }
    )
    return response
  },
}
