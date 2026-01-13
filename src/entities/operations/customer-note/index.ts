/**
 * CustomerNote Entity Public API
 * 고객사 특이사항 엔티티
 */

// Types
export type {
  CustomerNote,
  CustomerNoteCreateRequest,
  CustomerNoteUpdateRequest,
} from './model/types'

// API
export { customerNoteApi } from './api/customerNoteApi'

// Queries
export {
  customerNoteKeys,
  useCustomerNotes,
  useCreateCustomerNote,
  useUpdateCustomerNote,
  useDeleteCustomerNote,
} from './queries/customerNoteQueries'
