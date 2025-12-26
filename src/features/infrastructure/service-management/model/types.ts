/**
 * Service Management Feature Types
 * 서비스 관리 기능 타입 정의
 */

import type { ServiceType, ComponentType } from '@/entities/infrastructure/service'

/**
 * Service Form Data
 * 서비스 폼 데이터 (UI에서 사용)
 */
export interface ServiceFormData {
  serviceName: string
  serviceType: ServiceType | ''
  description: string
  isActive: boolean
}

/**
 * Component Form Data
 * 컴포넌트 폼 데이터 (UI에서 사용)
 */
export interface ComponentFormData {
  componentType: ComponentType | ''
  componentName: string
  host: string
  port: string // String for form, convert to number for API
  url: string
  sshPort: string // String for form
  description: string
  isActive: boolean
}

/**
 * Service Filters State
 * 서비스 필터 상태
 */
export interface ServiceFiltersState {
  serviceType: ServiceType | 'all'
  keyword: string
}

/**
 * Service Form Mode
 * 서비스 폼 모드
 */
export type ServiceFormMode = 'create' | 'edit' | null

/**
 * Component Form Mode
 * 컴포넌트 폼 모드
 */
export type ComponentFormMode = 'create' | 'edit' | null

/**
 * Delete Target
 * 삭제 대상
 */
export interface DeleteTarget {
  type: 'service' | 'component'
  id: number
  serviceId?: number // For component deletion
  name: string // For display in dialog
}
