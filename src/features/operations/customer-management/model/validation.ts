/**
 * Customer Form Validation
 * 고객사 폼 유효성 검증
 */

import type { CustomerFormData } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: Partial<Record<keyof CustomerFormData, string>>
}

export function validateCustomerForm(data: CustomerFormData): ValidationResult {
  const errors: Partial<Record<keyof CustomerFormData, string>> = {}

  if (!data.customerCode.trim()) {
    errors.customerCode = '고객사 코드는 필수입니다.'
  }

  if (!data.customerName.trim()) {
    errors.customerName = '고객사명은 필수입니다.'
  }

  const isValid = Object.keys(errors).length === 0

  return { isValid, errors }
}
