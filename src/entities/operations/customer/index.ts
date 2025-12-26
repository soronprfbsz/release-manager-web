/**
 * Customer Entity Public API
 */

// Types
export type {
  Customer,
  CustomerCreateRequest,
  CustomerUpdateRequest,
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
} from './queries/customerQueries'
