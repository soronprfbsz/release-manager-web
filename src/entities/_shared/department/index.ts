/**
 * Department Entity
 * 부서 도메인 (API, 타입, 쿼리 훅)
 */

// API
export { departmentApi } from './api/departmentApi'

// Types
export type {
  Department,
  DepartmentDetail,
  DepartmentTree,
  DepartmentCreateRequest,
  DepartmentUpdateRequest,
  DepartmentMoveRequest,
} from './model/types'

// Queries & Mutations
export {
  departmentKeys,
  useDepartments,
  useDepartmentTree,
  useDepartmentDetail,
  useCreateDepartment,
  useUpdateDepartment,
  useMoveDepartment,
  useDeleteDepartment,
} from './queries/departmentQueries'
