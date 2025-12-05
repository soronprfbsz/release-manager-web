/**
 * Engineer Form Validation
 * 엔지니어 폼 유효성 검증
 */

import type { EngineerFormData } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: Partial<Record<keyof EngineerFormData, string>>
}

export function validateEngineerForm(data: EngineerFormData): ValidationResult {
  const errors: Partial<Record<keyof EngineerFormData, string>> = {}

  if (!data.engineerName.trim()) {
    errors.engineerName = '이름은 필수입니다.'
  }

  if (!data.engineerEmail.trim()) {
    errors.engineerEmail = '이메일은 필수입니다.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.engineerEmail)) {
    errors.engineerEmail = '올바른 이메일 형식이 아닙니다.'
  }

  const isValid = Object.keys(errors).length === 0

  return { isValid, errors }
}
