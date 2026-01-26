/**
 * Scheduler Form Validation
 * 스케줄러 폼 유효성 검증
 */

import type { SchedulerFormData } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: Partial<Record<keyof SchedulerFormData, string>>
}

/**
 * Cron 표현식 유효성 검증
 */
function isValidCronExpression(cron: string): boolean {
  // 기본적인 Cron 형식 검증 (5-6 필드)
  const parts = cron.trim().split(/\s+/)
  if (parts.length < 5 || parts.length > 6) {
    return false
  }
  return true
}

/**
 * JSON 문자열 유효성 검증
 */
function isValidJson(str: string): boolean {
  if (!str.trim()) return true
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * URL 유효성 검증
 */
function isValidUrl(url: string): boolean {
  // 상대 경로 허용 (/api/...)
  if (url.startsWith('/')) return true

  // 절대 URL 검증
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 스케줄러 폼 유효성 검증
 */
export function validateSchedulerForm(data: SchedulerFormData): ValidationResult {
  const errors: Partial<Record<keyof SchedulerFormData, string>> = {}

  // Job 이름 검증
  if (!data.jobName.trim()) {
    errors.jobName = 'Job 이름은 필수입니다.'
  } else if (data.jobName.length > 100) {
    errors.jobName = 'Job 이름은 100자 이내여야 합니다.'
  }

  // API URL 검증
  if (!data.apiUrl.trim()) {
    errors.apiUrl = 'API URL은 필수입니다.'
  } else if (!isValidUrl(data.apiUrl)) {
    errors.apiUrl = '유효한 URL 형식이 아닙니다.'
  }

  // Cron 표현식 검증
  if (!data.cronExpression.trim()) {
    errors.cronExpression = 'Cron 표현식은 필수입니다.'
  } else if (!isValidCronExpression(data.cronExpression)) {
    errors.cronExpression = '유효한 Cron 표현식이 아닙니다. (예: 0 0 * * * 또는 0 0 0 * * ?)'
  }

  // Request Body JSON 검증
  if (data.requestBody && !isValidJson(data.requestBody)) {
    errors.requestBody = '유효한 JSON 형식이 아닙니다.'
  }

  // Request Headers JSON 검증
  if (data.requestHeaders && !isValidJson(data.requestHeaders)) {
    errors.requestHeaders = '유효한 JSON 형식이 아닙니다.'
  }

  // Timeout 검증
  if (data.timeoutSeconds < 1 || data.timeoutSeconds > 3600) {
    errors.timeoutSeconds = '타임아웃은 1초 ~ 3600초 사이여야 합니다.'
  }

  // Retry Count 검증
  if (data.retryCount < 0 || data.retryCount > 10) {
    errors.retryCount = '재시도 횟수는 0 ~ 10 사이여야 합니다.'
  }

  // Retry Delay 검증
  if (data.retryDelaySeconds < 1 || data.retryDelaySeconds > 300) {
    errors.retryDelaySeconds = '재시도 간격은 1초 ~ 300초 사이여야 합니다.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
