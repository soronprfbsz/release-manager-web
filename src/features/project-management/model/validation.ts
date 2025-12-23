/**
 * Project Management Validation
 * 프로젝트 관리 유효성 검증
 */

import type { ProjectFormData, ValidationResult } from './types'

export function validateProjectForm(data: ProjectFormData, mode: 'create' | 'edit'): ValidationResult {
  const errors: Record<string, string> = {}

  // 프로젝트 ID 검증 (생성 시에만)
  if (mode === 'create') {
    if (!data.projectId.trim()) {
      errors.projectId = '프로젝트 ID는 필수입니다.'
    } else if (!/^[a-z0-9_]+$/.test(data.projectId)) {
      errors.projectId = '프로젝트 ID는 영문 소문자, 숫자, 언더스코어만 사용 가능합니다.'
    }
  }

  // 프로젝트명 검증
  if (!data.projectName.trim()) {
    errors.projectName = '프로젝트명은 필수입니다.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
