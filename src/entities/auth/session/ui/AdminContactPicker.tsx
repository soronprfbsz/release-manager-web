/**
 * AdminContactPicker
 * 담당자(ADMIN/OPERATOR) 선택 — 비밀번호 재설정 요청 / 회원가입 두 화면이 공유한다.
 *
 * 인증 없이 열리는 화면에서 쓰이므로 공개 API(GET /api/auth/admins)만 사용한다.
 */

import { Loader2 } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'

import { useAdminContacts } from '../queries/sessionQueries'

import type { AdminContact } from '../model/types'

const ROLE_LABEL: Record<AdminContact['role'], string> = {
  ADMIN: '관리자',
  OPERATOR: '운영자',
}

const ROLE_BADGE_VARIANT: Record<AdminContact['role'], 'success' | 'info'> = {
  ADMIN: 'success',
  OPERATOR: 'info',
}

interface AdminContactPickerProps {
  /** 선택된 담당자 계정 ID 목록 */
  value: number[]
  onChange: (accountIds: number[]) => void
  /** 목록 조회를 미룰 때 false (예: 닫힌 다이얼로그) */
  enabled?: boolean
}

export function AdminContactPicker({
  value,
  onChange,
  enabled = true,
}: AdminContactPickerProps) {
  const { data: contacts, isLoading, isError } = useAdminContacts({ enabled })

  const toggle = (accountId: number) => {
    onChange(
      value.includes(accountId)
        ? value.filter((id) => id !== accountId)
        : [...value, accountId]
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">불러오는 중...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive text-center py-6">
        담당자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
    )
  }

  if (!contacts || contacts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        등록된 담당자가 없습니다. 시스템 담당자에게 문의하세요.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border rounded-md border">
      {contacts.map((contact) => (
        <li key={contact.accountId}>
          <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50">
            <Checkbox
              checked={value.includes(contact.accountId)}
              onCheckedChange={() => toggle(contact.accountId)}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{contact.accountName}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {contact.departmentName}
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate">{contact.email}</span>
            </div>
            <Badge variant={ROLE_BADGE_VARIANT[contact.role]} className="shrink-0">
              {ROLE_LABEL[contact.role]}
            </Badge>
          </label>
        </li>
      ))}
    </ul>
  )
}
