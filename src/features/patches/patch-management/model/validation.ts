/**
 * Patch Management Feature Validation
 * 패치 관리 폼 유효성 검사
 */

import type { PatchCreateFormData } from './types'

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validatePatchForm(data: PatchCreateFormData): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.fromVersion) {
    errors.fromVersion = '시작 버전을 선택해주세요.'
  }

  if (!data.toVersion) {
    errors.toVersion = '종료 버전을 선택해주세요.'
  }

  if (data.fromVersion && data.toVersion && data.fromVersion >= data.toVersion) {
    errors.toVersion = '종료 버전은 시작 버전보다 높아야 합니다.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
