/**
 * Scheduler Management Feature Types
 * 스케줄러 관리 기능 타입 정의
 */

import type { HttpMethod } from '@/entities/remote-jobs'

/**
 * 스케줄러 폼 모드
 */
export type SchedulerFormMode = 'create' | 'edit' | null

/**
 * 스케줄러 폼 데이터
 */
export interface SchedulerFormData {
  jobName: string
  jobGroup: string
  description: string
  apiUrl: string
  httpMethod: HttpMethod
  requestBody: string
  requestHeaders: string
  cronExpression: string
  timezone: string
  isEnabled: boolean
  timeoutSeconds: number
  retryCount: number
  retryDelaySeconds: number
}

/**
 * 폼 데이터 초기값
 */
export const INITIAL_FORM_DATA: SchedulerFormData = {
  jobName: '',
  jobGroup: 'DEFAULT',
  description: '',
  apiUrl: '',
  httpMethod: 'POST',
  requestBody: '',
  requestHeaders: '',
  cronExpression: '',
  timezone: 'Asia/Seoul',
  isEnabled: true,
  timeoutSeconds: 30,
  retryCount: 0,
  retryDelaySeconds: 5,
}

/**
 * HTTP Method 옵션
 */
export const HTTP_METHOD_OPTIONS: { value: HttpMethod; label: string }[] = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
]

/**
 * Timezone 옵션
 */
export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Seoul', label: 'Asia/Seoul (KST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
]
