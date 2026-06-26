/**
 * Change Password Dialog
 * 비밀번호 변경 모달 — 내 정보 수정 시트에서 "비밀번호 변경" 버튼으로 진입.
 * ChangePasswordForm 을 감싸고, 변경 성공 시 모달을 닫는다.
 */

import { KeyRound } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

import { ChangePasswordForm } from './ChangePasswordForm'

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            비밀번호 변경
          </DialogTitle>
          <DialogDescription>
            현재 비밀번호를 입력해 새 비밀번호로 변경합니다.
          </DialogDescription>
        </DialogHeader>
        <ChangePasswordForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
