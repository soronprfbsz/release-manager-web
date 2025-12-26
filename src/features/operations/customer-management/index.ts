/**
 * Customer Management Feature
 * 고객사 관리 기능 모듈
 */

// UI Components
export { CustomerTable } from './ui/CustomerTable'
export { CustomerForm } from './ui/CustomerForm'
export { CustomerFilters } from './ui/CustomerFilters'
export { CustomerDeleteDialog } from './ui/CustomerDeleteDialog'

// Types
export type {
  CustomerFormData,
  CustomerFiltersState,
  CustomerFormMode,
} from './model/types'

// Validation
export { validateCustomerForm, type ValidationResult } from './model/validation'
