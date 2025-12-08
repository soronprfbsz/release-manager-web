/**
 * Account Management Feature Types
 * 계정 관리 기능 타입 정의
 */

import type { Account } from '@/entities/account'

export type AccountFormMode = 'edit'

export interface AccountFormData {
  role: string
  status: string
}

export function createAccountFormData(account?: Account): AccountFormData {
  if (!account) {
    return {
      role: '',
      status: 'ACTIVE',
    }
  }

  return {
    role: account.role,
    status: account.status,
  }
}
