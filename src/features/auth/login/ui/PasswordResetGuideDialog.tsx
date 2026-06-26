/**
 * PasswordResetGuideDialog
 * 비밀번호 재설정 안내 모달 — 활성 관리자 연락처를 표시하고 직접 문의하도록 안내
 */

import { Loader2 } from 'lucide-react'

import { useAdminContacts, type AdminContact } from '@/entities/auth/session'

import { Badge } from '@/shared/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'

interface PasswordResetGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ROLE_LABEL: Record<AdminContact['role'], string> = {
  ADMIN: '관리자',
  OPERATOR: '운영자',
}

const ROLE_BADGE_VARIANT: Record<AdminContact['role'], 'success' | 'info'> = {
  ADMIN: 'success',
  OPERATOR: 'info',
}

export function PasswordResetGuideDialog({ open, onOpenChange }: PasswordResetGuideDialogProps) {
  const { data: contacts, isLoading, isError } = useAdminContacts({ enabled: open })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>비밀번호 재설정 안내</DialogTitle>
          <DialogDescription>
            비밀번호를 잊으셨나요? 아래 관리자에게 비밀번호 초기화를 요청하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">불러오는 중...</span>
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive text-center py-6">
              관리자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          )}

          {!isLoading && !isError && contacts && contacts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              등록된 관리자가 없습니다. 시스템 담당자에게 문의하세요.
            </p>
          )}

          {!isLoading && !isError && contacts && contacts.length > 0 && (
            <ul className="divide-y divide-border">
              {contacts.map((contact, index) => (
                <li key={index} className="py-3 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">{contact.accountName}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {contact.departmentName}
                      </span>
                    </div>
                    <Badge variant={ROLE_BADGE_VARIANT[contact.role]}>
                      {ROLE_LABEL[contact.role]}
                    </Badge>
                  </div>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-primary hover:underline truncate"
                  >
                    {contact.email}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
