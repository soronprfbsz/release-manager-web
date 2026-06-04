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

  // from == to 는 허용 (빌드 전용 패치: 같은 base 안에서 빌드 산출물만 갱신).
  // from > to 만 거부.
  if (data.fromVersion && data.toVersion && data.fromVersion > data.toVersion) {
    errors.toVersion = '종료 버전은 시작 버전보다 낮을 수 없습니다.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
