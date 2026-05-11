/**
 * Customer Management Feature
 * 고객사 관리 기능 모듈
 */

// UI Components
export { CustomerTable } from './ui/CustomerTable'
export { CustomerForm } from './ui/CustomerForm'
export { CustomerFilters } from './ui/CustomerFilters'
export { CustomerDeleteModal } from './ui/CustomerDeleteModal'

// UI Components - Operation Tab
export { CustomerTree } from './ui/CustomerTree'
export { CustomerDetailPanel } from './ui/CustomerDetailPanel'
export { CustomerPatchHistoryCard } from './ui/CustomerPatchHistoryCard'
export { CustomerVersionInfo } from './ui/CustomerVersionInfo'
export { CustomerNotesCard } from './ui/CustomerNotesCard'
export { CustomerNoteForm, type CustomerNoteFormMode, type CustomerNoteFormData, INITIAL_NOTE_FORM_DATA } from './ui/CustomerNoteForm'
export { CustomerNoteDeleteDialog } from './ui/CustomerNoteDeleteDialog'

// Types
export type {
  CustomerFormData,
  CustomerFiltersState,
  CustomerFormMode,
} from './model/types'

// Validation
export { validateCustomerForm, type ValidationResult } from './model/validation'
