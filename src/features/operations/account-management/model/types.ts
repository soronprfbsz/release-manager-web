/**
 * Account Management Feature Types
 * 계정 관리 기능 타입 정의
 */

import type { Account } from '@/entities/operations/account'

export type AccountFormMode = 'edit'

export interface AccountFormData {
  accountName: string
  role: string
  status: string
}

export function createAccountFormData(account?: Account): AccountFormData {
  if (!account) {
    return {
      accountName: '',
      role: '',
      status: 'ACTIVE',
    }
  }

  return {
    accountName: account.accountName,
    role: account.role,
    status: account.status,
  }
}
