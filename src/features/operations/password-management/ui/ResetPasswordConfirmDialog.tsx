/**
 * Reset Password Confirm Dialog
 * 비밀번호 초기화 확인 다이얼로그 (대상 계정 명시 · 되돌릴 수 없음 경고). PRD §12
 */

import { Loader2 } from 'lucide-react'

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

interface ResetPasswordConfirmDialogProps {
  open: boolean
  accountName: string | null
  email: string | null
  isResetting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ResetPasswordConfirmDialog({
  open,
  accountName,
  email,
  isResetting,
  onConfirm,
  onCancel,
}: ResetPasswordConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && !isResetting && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>비밀번호 초기화</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                <span className="font-medium text-foreground">{accountName}</span>
                {email && <span className="text-muted-foreground"> ({email})</span>} 계정의
                비밀번호를 임시 비밀번호로 초기화합니다.
              </p>
              <p className="text-destructive">
                이 작업은 되돌릴 수 없으며, 대상자는 다음 로그인 시 비밀번호를 강제로 변경해야
                합니다.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isResetting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isResetting}
          >
            {isResetting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                초기화 중...
              </>
            ) : (
              '초기화'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
