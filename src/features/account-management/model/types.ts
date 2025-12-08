/**
 * Account Management Feature Types
 * 계정 관리 기능 타입 정의
 */

import type { Account } from '@/entities/account'

export type AccountFormMode = 'edit'

export interface AccountFormData {
  email: string
  role: string
  isActive: boolean
}

export function createAccountFormData(account?: Account): AccountFormData {
  if (!account) {
    return {
      email: '',
      role: '',
      isActive: true,
    }
  }

  return {
    email: account.email,
    role: account.role,
    isActive: account.isActive,
  }
}
