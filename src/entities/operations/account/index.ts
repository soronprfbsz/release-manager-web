/**
 * Account Entity Public API
 */

// Types
export type {
  Account,
  AccountUpdateRequest,
  MyAccount,
  MyAccountUpdateRequest,
} from './model/types'

export type { AccountListParams } from './api/accountApi'

// API
export { accountApi } from './api/accountApi'

// Queries
export {
  accountKeys,
  useAccounts,
  useAccountsByDepartment,
  useUpdateAccount,
  useDeleteAccount,
  useMyAccount,
  useUpdateMyAccount,
} from './queries/accountQueries'
