/**
 * Service API Client
 * 서비스 관리 API 클라이언트
 */

import { apiClient } from '@/shared/api/client'
import type {
  Service,
  ServiceCreateRequest,
  ServiceUpdateRequest,
  ComponentRequest,
  ServiceComponent,
} from '../model/types'

const ENDPOINTS = {
  base: '/api/services',
  byId: (id: number) => `/api/services/${id}`,
  components: (serviceId: number) => `/api/services/${serviceId}/components`,
  componentById: (serviceId: number, componentId: number) =>
    `/api/services/${serviceId}/components/${componentId}`,
} as const

export const serviceApi = {
  /**
   * 서비스 목록 조회
   * @param params 필터 파라미터 (serviceType, serviceName, isActive)
   * @returns 서비스 목록 (컴포넌트 포함)
   */
  getList: async (params?: {
    serviceType?: string
    serviceName?: string
    isActive?: boolean
  }): Promise<Service[]> => {
    const queryParams = new URLSearchParams()

    if (params?.serviceType) queryParams.append('serviceType', params.serviceType)
    if (params?.serviceName) queryParams.append('serviceName', params.serviceName)
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))

    const queryString = queryParams.toString()
    const url = queryString ? `${ENDPOINTS.base}?${queryString}` : ENDPOINTS.base

    return await apiClient.get<Service[]>(url)
  },

  /**
   * 서비스 상세 조회
   * @param id 서비스 ID
   * @returns 서비스 상세 정보 (컴포넌트 포함)
   */
  getById: async (id: number): Promise<Service> => {
    return await apiClient.get<Service>(ENDPOINTS.byId(id))
  },

  /**
   * 서비스 생성
   * @param request 서비스 생성 요청
   * @returns 생성된 서비스
   */
  create: async (request: ServiceCreateRequest): Promise<Service> => {
    return await apiClient.post<Service>(ENDPOINTS.base, request)
  },

  /**
   * 서비스 수정
   * @param id 서비스 ID
   * @param request 서비스 수정 요청
   * @returns 수정된 서비스
   */
  update: async (id: number, request: ServiceUpdateRequest): Promise<Service> => {
    return await apiClient.patch<Service>(ENDPOINTS.byId(id), request)
  },

  /**
   * 서비스 삭제
   * @param id 서비스 ID
   * @description CASCADE 삭제 - 연결된 모든 컴포넌트도 함께 삭제됨
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(id))
  },

  /**
   * 컴포넌트 추가
   * @param serviceId 서비스 ID
   * @param request 컴포넌트 생성 요청
   * @returns 생성된 컴포넌트
   */
  addComponent: async (
    serviceId: number,
    request: ComponentRequest
  ): Promise<ServiceComponent> => {
    return await apiClient.post<ServiceComponent>(ENDPOINTS.components(serviceId), request)
  },

  /**
   * 컴포넌트 수정
   * @param serviceId 서비스 ID
   * @param componentId 컴포넌트 ID
   * @param request 컴포넌트 수정 요청
   * @returns 수정된 컴포넌트
   */
  updateComponent: async (
    serviceId: number,
    componentId: number,
    request: Partial<ComponentRequest>
  ): Promise<ServiceComponent> => {
    return await apiClient.patch<ServiceComponent>(
      ENDPOINTS.componentById(serviceId, componentId),
      request
    )
  },

  /**
   * 컴포넌트 삭제
   * @param serviceId 서비스 ID
   * @param componentId 컴포넌트 ID
   */
  deleteComponent: async (serviceId: number, componentId: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.componentById(serviceId, componentId))
  },
}
