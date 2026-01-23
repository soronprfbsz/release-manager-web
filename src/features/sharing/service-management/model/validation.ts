/**
 * Service Management Validation
 * 서비스 관리 검증 함수
 */

import type { ServiceFormData, ComponentFormData } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * 서비스 폼 검증
 */
export function validateServiceForm(data: ServiceFormData): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.serviceName.trim()) {
    errors.serviceName = '서비스명은 필수입니다.'
  }

  if (!data.serviceType) {
    errors.serviceType = '서비스 타입은 필수입니다.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * 컴포넌트 폼 검증 (타입별 필수 필드)
 */
export function validateComponentForm(data: ComponentFormData): ValidationResult {
  const errors: Record<string, string> = {}

  // 공통 필수 필드
  if (!data.componentType) {
    errors.componentType = '컴포넌트 타입은 필수입니다.'
  }

  if (!data.componentName.trim()) {
    errors.componentName = '컴포넌트명은 필수입니다.'
  }

  // Host와 Port는 모든 타입에서 필수 (ETC 제외)
  if (data.componentType && data.componentType !== 'ETC') {
    if (!data.host.trim()) {
      errors.host = 'Host는 필수입니다.'
    }
    if (!data.port.trim()) {
      errors.port = 'Port는 필수입니다.'
    } else if (isNaN(Number(data.port)) || Number(data.port) <= 0) {
      errors.port = 'Port는 유효한 숫자여야 합니다.'
    }
  }

  // SSH 필드 검증 (입력된 경우)
  if (data.sshPort.trim() && (isNaN(Number(data.sshPort)) || Number(data.sshPort) <= 0)) {
    errors.sshPort = 'SSH Port는 유효한 숫자여야 합니다.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
