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

  // 글리프 텍스트 검증 (선택, 최대 3자)
  if (data.glyphText && data.glyphText.length > 3) {
    errors.glyphText = '글리프 텍스트는 최대 3자까지 입력 가능합니다.'
  }

  // 글리프 배경색 검증 (선택, 최대 30자)
  if (data.glyphBackgroundColor && data.glyphBackgroundColor.length > 30) {
    errors.glyphBackgroundColor = '글리프 배경색 값이 너무 깁니다.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
