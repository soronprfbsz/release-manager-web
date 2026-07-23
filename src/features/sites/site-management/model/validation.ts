/**
 * Site Form Validation
 * 사이트 폼 유효성 검증
 */

import type { SiteFormData } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: Partial<Record<keyof SiteFormData, string>>
}

export function validateSiteForm(data: SiteFormData): ValidationResult {
  const errors: Partial<Record<keyof SiteFormData, string>> = {}

  if (!data.siteCode.trim()) {
    errors.siteCode = '사이트 코드는 필수입니다.'
  }

  if (!data.siteName.trim()) {
    errors.siteName = '사이트명은 필수입니다.'
  }

  if (data.glyphText && data.glyphText.length > 3) {
    errors.glyphText = '글리프 텍스트는 최대 3자까지 입력 가능합니다.'
  }

  if (data.glyphBackgroundColor && data.glyphBackgroundColor.length > 30) {
    errors.glyphBackgroundColor = '글리프 배경색 값이 너무 깁니다.'
  }

  const isValid = Object.keys(errors).length === 0

  return { isValid, errors }
}
