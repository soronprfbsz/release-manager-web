/**
 * Account Delete Dialog Component
 * 계정 삭제 확인 다이얼로그 컴포넌트
 */

import { AlertTriangle } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'

interface AccountDeleteDialogProps {
  open: boolean
  accountUsername: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function AccountDeleteDialog({
  open,
  accountUsername,
  onConfirm,
  onCancel,
}: AccountDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>계정 삭제</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            정말 <strong>{accountUsername}</strong> 계정을 삭제하시겠습니까?
            <br />
            <br />
            삭제된 계정은 복구할 수 없으며, 해당 계정으로 더 이상 로그인할 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
