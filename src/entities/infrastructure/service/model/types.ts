/**
 * Service Entity Types
 * 서비스 도메인 타입 정의
 */

// Enums
export type ServiceType = 'infraeye1' | 'infraeye2' | 'infra' | 'etc'
export type ComponentType = 'WEB' | 'DATABASE' | 'ENGINE' | 'ETC'

/**
 * Service Component (접속 정보)
 */
export interface ServiceComponent {
  componentId: number
  componentType: ComponentType
  componentTypeName: string
  componentName: string
  host: string | null
  port: number | null
  url: string | null
  sshPort: number | null
  description: string | null
  sortOrder: number
  isActive: boolean
}

/**
 * Service (서비스)
 */
export interface Service {
  serviceId: number
  serviceName: string
  serviceType: ServiceType
  serviceTypeName: string
  description: string | null
  isActive: boolean
  components: ServiceComponent[]
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string | null
}

/**
 * Component Request (컴포넌트 생성/수정 요청)
 */
export interface ComponentRequest {
  componentType: ComponentType
  componentName: string
  host?: string
  port?: number
  url?: string
  sshPort?: number
  description?: string
  sortOrder?: number
  isActive?: boolean
}

/**
 * Service Create Request
 */
export interface ServiceCreateRequest {
  serviceName: string
  serviceType: ServiceType
  description?: string
  components?: ComponentRequest[]
}

/**
 * Service Update Request
 */
export interface ServiceUpdateRequest {
  serviceName?: string
  serviceType?: ServiceType
  description?: string
  isActive?: boolean
}
