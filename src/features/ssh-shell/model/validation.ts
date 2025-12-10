/**
 * SSH Shell Form Validation
 * SSH Shell 폼 유효성 검증
 */

import type { SshConnectionFormData } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * SSH 연결 폼 유효성 검증
 */
export function validateSshConnectionForm(data: SshConnectionFormData): ValidationResult {
  const errors: Record<string, string> = {}

  // 호스트 검증
  if (!data.host.trim()) {
    errors.host = '호스트를 입력해주세요.'
  }

  // 포트 검증
  if (data.port <= 0 || data.port > 65535) {
    errors.port = '유효한 포트 번호를 입력해주세요. (1-65535)'
  }

  // 사용자명 검증
  if (!data.username.trim()) {
    errors.username = '사용자명을 입력해주세요.'
  }

  // 비밀번호 검증
  if (!data.password) {
    errors.password = '비밀번호를 입력해주세요.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
