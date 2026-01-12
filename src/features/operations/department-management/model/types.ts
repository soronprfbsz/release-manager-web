/**
 * Department Management Feature Types
 * 부서 관리 기능 타입 정의
 */

/** 부서 폼 데이터 */
export interface DepartmentFormData {
  departmentName: string
  description: string
  parentDepartmentId: number | null
}

/** 폼 모드 */
export type DepartmentFormMode = 'create' | 'edit'

/** 폼 초기값 */
export const INITIAL_DEPARTMENT_FORM_DATA: DepartmentFormData = {
  departmentName: '',
  description: '',
  parentDepartmentId: null,
}
