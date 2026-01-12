/**
 * Department Entity Types
 * 부서 도메인 타입 정의
 */

/** 부서 기본 응답 */
export interface Department {
  departmentId: number
  departmentName: string
  description: string | null
  sortOrder: number
}

/** 부서 상세 응답 (부모/자식 정보 포함) */
export interface DepartmentDetail {
  departmentId: number
  departmentName: string
  description: string | null
  parentDepartmentId: number | null
  parentDepartmentName: string | null
  depth: number
  sortOrder: number
  childCount: number
  accountCount: number
}

/** 부서 트리 응답 (계층 구조) */
export interface DepartmentTree {
  departmentId: number
  departmentName: string
  description: string | null
  depth: number
  sortOrder: number
  accountCount: number
  children: DepartmentTree[]
}

/** 부서 생성 요청 */
export interface DepartmentCreateRequest {
  departmentName: string
  description?: string
  parentDepartmentId?: number | null
  sortOrder?: number
}

/** 부서 수정 요청 */
export interface DepartmentUpdateRequest {
  departmentName?: string
  description?: string
  sortOrder?: number
}

/** 부서 이동 요청 */
export interface DepartmentMoveRequest {
  newParentId: number | null
  sortOrder?: number
}
