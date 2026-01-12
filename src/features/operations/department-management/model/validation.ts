/**
 * Department Form Validation
 * 부서 폼 유효성 검증
 */

import type { DepartmentFormData } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateDepartmentForm(data: DepartmentFormData): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.departmentName.trim()) {
    errors.departmentName = '부서명은 필수입니다.'
  } else if (data.departmentName.length > 100) {
    errors.departmentName = '부서명은 100자 이하여야 합니다.'
  }

  if (data.description && data.description.length > 500) {
    errors.description = '설명은 500자 이하여야 합니다.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
