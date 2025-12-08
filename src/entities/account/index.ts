/**
 * Account Entity Public API
 */

// Types
export type {
  Account,
  AccountUpdateRequest,
} from './model/types'

// API
export { accountApi } from './api/accountApi'

// Queries
export {
  accountKeys,
  useAccounts,
  useUpdateAccount,
  useDeleteAccount,
} from './queries/accountQueries'
