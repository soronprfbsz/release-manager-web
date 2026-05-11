/**
 * Customer Entity Public API
 */

// Types
export type {
  Customer,
  CustomerCreateRequest,
  CustomerUpdateRequest,
  ResetPatchStateResponse,
} from './model/types'

// API
export { customerApi } from './api/customerApi'

// Queries
export {
  customerKeys,
  useCustomers,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useUpdateCustomerStatus,
  useResetCustomerPatchState,
} from './queries/customerQueries'
