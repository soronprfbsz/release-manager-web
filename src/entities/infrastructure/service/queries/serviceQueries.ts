/**
 * Service React Query Hooks
 * 서비스 관리 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { serviceApi } from '../api/serviceApi'

import type {
  ServiceCreateRequest,
  ServiceUpdateRequest,
  ComponentRequest,
} from '../model/types'

/**
 * Query Keys Factory
 * 계층적 구조로 캐시 무효화 제어
 */
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (params?: {
    serviceType?: string
    serviceName?: string
    keyword?: string
  }) => [...serviceKeys.lists(), params] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: number) => [...serviceKeys.details(), id] as const,
}

/**
 * 서비스 목록 조회 훅
 */
export const useServices = (params?: {
  serviceType?: string
  serviceName?: string
  keyword?: string
}) =>
  useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => serviceApi.getList(params),
  })

/**
 * 서비스 상세 조회 훅
 */
export const useService = (id: number) =>
  useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => serviceApi.getById(id),
    enabled: !!id,
  })

/**
 * 서비스 생성 뮤테이션 훅
 */
export const useCreateService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ServiceCreateRequest) => serviceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
    },
  })
}

/**
 * 서비스 수정 뮤테이션 훅
 */
export const useUpdateService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServiceUpdateRequest }) =>
      serviceApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
    },
  })
}

/**
 * 서비스 삭제 뮤테이션 훅
 * @description CASCADE 삭제 - 연결된 모든 컴포넌트도 함께 삭제됨
 */
export const useDeleteService = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => serviceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
    },
  })
}

/**
 * 컴포넌트 추가 뮤테이션 훅
 */
export const useAddComponent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: number; data: ComponentRequest }) =>
      serviceApi.addComponent(serviceId, data),
    onSuccess: (_, variables) => {
      // 해당 서비스 상세와 목록 모두 갱신
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(variables.serviceId) })
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
    },
  })
}

/**
 * 컴포넌트 수정 뮤테이션 훅
 */
export const useUpdateComponent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      serviceId,
      componentId,
      data,
    }: {
      serviceId: number
      componentId: number
      data: Partial<ComponentRequest>
    }) => serviceApi.updateComponent(serviceId, componentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(variables.serviceId) })
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
    },
  })
}

/**
 * 컴포넌트 삭제 뮤테이션 훅
 */
export const useDeleteComponent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ serviceId, componentId }: { serviceId: number; componentId: number }) =>
      serviceApi.deleteComponent(serviceId, componentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(variables.serviceId) })
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
    },
  })
}

/**
 * 서비스 순서 변경 뮤테이션 훅
 */
export const useReorderServices = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ serviceType, serviceIds }: { serviceType: string; serviceIds: number[] }) =>
      serviceApi.reorderServices(serviceType, serviceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
    },
  })
}

/**
 * 컴포넌트 순서 변경 뮤테이션 훅
 */
export const useReorderComponents = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ serviceId, componentIds }: { serviceId: number; componentIds: number[] }) =>
      serviceApi.reorderComponents(serviceId, componentIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(variables.serviceId) })
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
    },
  })
}
