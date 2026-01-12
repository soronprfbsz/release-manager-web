/**
 * Department Query Keys and Hooks
 * 부서 관련 React Query 키 팩토리 및 훅
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'

import { departmentApi } from '../api/departmentApi'
import type {
  Department,
  DepartmentDetail,
  DepartmentTree,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentMoveRequest,
} from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: () => [...departmentKeys.lists()] as const,
  tree: () => [...departmentKeys.all, 'tree'] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...departmentKeys.details(), id] as const,
  children: (id: number) => [...departmentKeys.all, 'children', id] as const,
  descendants: (id: number) => [...departmentKeys.all, 'descendants', id] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 부서 목록 조회 훅
 */
export function useDepartments(
  options?: Omit<UseQueryOptions<Department[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: departmentKeys.list(),
    queryFn: () => departmentApi.getList(),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * 부서 트리 조회 훅
 */
export function useDepartmentTree(
  options?: Omit<UseQueryOptions<DepartmentTree[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: departmentKeys.tree(),
    queryFn: () => departmentApi.getTree(),
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * 부서 상세 조회 훅
 */
export function useDepartmentDetail(
  id: number | null,
  options?: Omit<UseQueryOptions<DepartmentDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: departmentKeys.detail(id!),
    queryFn: () => departmentApi.getDetail(id!),
    enabled: id !== null,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 부서 생성 뮤테이션 훅
 */
export function useCreateDepartment(
  options?: Omit<UseMutationOptions<Department, Error, DepartmentCreateRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: DepartmentCreateRequest) => departmentApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
    ...options,
  })
}

/**
 * 부서 수정 뮤테이션 훅
 */
export function useUpdateDepartment(
  options?: Omit<
    UseMutationOptions<Department, Error, { id: number; request: DepartmentUpdateRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }) => departmentApi.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
    ...options,
  })
}

/**
 * 부서 이동 뮤테이션 훅
 */
export function useMoveDepartment(
  options?: Omit<
    UseMutationOptions<Department, Error, { id: number; request: DepartmentMoveRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }) => departmentApi.move(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
    ...options,
  })
}

/**
 * 부서 삭제 뮤테이션 훅
 */
export function useDeleteDepartment(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => departmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    },
    ...options,
  })
}
