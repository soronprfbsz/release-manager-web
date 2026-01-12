/**
 * Department API
 * 부서 관련 API 함수
 */

import { apiClient } from '@/shared/api/client'

import type {
  Department,
  DepartmentDetail,
  DepartmentTree,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentMoveRequest,
} from '../model/types'

const ENDPOINTS = {
  base: '/api/departments',
  detail: (id: number) => `/api/departments/${id}`,
  tree: '/api/departments/tree',
  children: (id: number) => `/api/departments/${id}/children`,
  descendants: (id: number) => `/api/departments/${id}/descendants`,
  move: (id: number) => `/api/departments/${id}/move`,
} as const

export const departmentApi = {
  /** 부서 목록 조회 */
  getList: async (): Promise<Department[]> => {
    return apiClient.get<Department[]>(ENDPOINTS.base)
  },

  /** 부서 트리 조회 */
  getTree: async (): Promise<DepartmentTree[]> => {
    return apiClient.get<DepartmentTree[]>(ENDPOINTS.tree)
  },

  /** 부서 상세 조회 */
  getDetail: async (id: number): Promise<DepartmentDetail> => {
    return apiClient.get<DepartmentDetail>(ENDPOINTS.detail(id))
  },

  /** 직계 하위 부서 조회 */
  getChildren: async (id: number): Promise<Department[]> => {
    return apiClient.get<Department[]>(ENDPOINTS.children(id))
  },

  /** 모든 하위 부서 조회 */
  getDescendants: async (id: number): Promise<Department[]> => {
    return apiClient.get<Department[]>(ENDPOINTS.descendants(id))
  },

  /** 부서 생성 */
  create: async (request: DepartmentCreateRequest): Promise<Department> => {
    return apiClient.post<Department>(ENDPOINTS.base, request)
  },

  /** 부서 수정 */
  update: async (id: number, request: DepartmentUpdateRequest): Promise<Department> => {
    return apiClient.put<Department>(ENDPOINTS.detail(id), request)
  },

  /** 부서 이동 */
  move: async (id: number, request: DepartmentMoveRequest): Promise<Department> => {
    return apiClient.put<Department>(ENDPOINTS.move(id), request)
  },

  /** 부서 삭제 */
  delete: async (id: number): Promise<void> => {
    return apiClient.delete(ENDPOINTS.detail(id))
  },
}
