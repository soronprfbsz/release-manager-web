/**
 * Department Management Feature
 * 부서 관리 기능
 */

// UI Components - Department
export { DepartmentTree, type DropPosition, type DropInfo } from './ui/DepartmentTree'
export { DepartmentForm } from './ui/DepartmentForm'
export { DepartmentDetail } from './ui/DepartmentDetail'
export { DepartmentDeleteDialog } from './ui/DepartmentDeleteDialog'
export { DepartmentMoveDialog } from './ui/DepartmentMoveDialog'

// UI Components - Account
export { AccountListPanel } from './ui/AccountListPanel'
export { AccountMoveDialog } from './ui/AccountMoveDialog'
export { BulkAccountMoveDialog } from './ui/BulkAccountMoveDialog'
export { AccountAssignDialog } from './ui/AccountAssignDialog'

// Types
export type { DepartmentFormData, DepartmentFormMode } from './model/types'
export { INITIAL_DEPARTMENT_FORM_DATA } from './model/types'

// Validation
export { validateDepartmentForm, type ValidationResult } from './model/validation'
