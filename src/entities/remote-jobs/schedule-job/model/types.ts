/**
 * Schedule Job Entity Types
 * 스케줄 Job 도메인 타입 정의
 */

/**
 * Job 실행 상태
 */
export type JobExecutionStatus = 'RUNNING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT'

/**
 * HTTP Method
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * 스케줄 Job
 */
export interface ScheduleJob {
  jobId: number
  jobName: string
  jobGroup: string
  description: string
  apiUrl: string
  httpMethod: HttpMethod
  requestBody?: string
  requestHeaders?: string
  cronExpression: string
  timezone: string
  isEnabled: boolean
  timeoutSeconds: number
  retryCount: number
  retryDelaySeconds: number
  lastExecutedAt?: string
  nextExecutionAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * 스케줄 Job 실행 이력
 */
export interface ScheduleJobHistory {
  historyId: number
  jobId: number
  jobName: string
  startedAt: string
  finishedAt?: string
  executionTimeMs: number
  status: JobExecutionStatus
  responseCode?: number
  responseBody?: string
  errorMessage?: string
  attemptNumber: number
}

/**
 * Job 생성 요청
 */
export interface CreateScheduleJobRequest {
  jobName: string
  jobGroup?: string
  description?: string
  apiUrl: string
  httpMethod?: HttpMethod
  requestBody?: string
  requestHeaders?: string
  cronExpression: string
  timezone?: string
  isEnabled?: boolean
  timeoutSeconds?: number
  retryCount?: number
  retryDelaySeconds?: number
}

/**
 * Job 수정 요청
 */
export interface UpdateScheduleJobRequest {
  jobName?: string
  jobGroup?: string
  description?: string
  apiUrl?: string
  httpMethod?: HttpMethod
  requestBody?: string
  requestHeaders?: string
  cronExpression?: string
  timezone?: string
  isEnabled?: boolean
  timeoutSeconds?: number
  retryCount?: number
  retryDelaySeconds?: number
}

/**
 * 이력 조회 파라미터
 */
export interface ScheduleJobHistoryParams {
  page?: number
  size?: number
}
