/**
 * Reset Password Result Dialog
 * 초기화 결과 모달 — 임시비번 1회 표시 + 복사 + 전달 안내 + 닫으면 재확인 불가 경고. PRD §12
 * 평문 임시비번은 어디에도 저장/로그하지 않는다.
 */

import { useState } from 'react'

import { AlertTriangle, Check, Copy, KeyRound } from 'lucide-react'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { copyToClipboard } from '@/shared/lib/utils/clipboard'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

interface ResetPasswordResultDialogProps {
  open: boolean
  accountName: string | null
  temporaryPassword: string | null
  onClose: () => void
}

export function ResetPasswordResultDialog({
  open,
  accountName,
  temporaryPassword,
  onClose,
}: ResetPasswordResultDialogProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!temporaryPassword) return
    const ok = await copyToClipboard(temporaryPassword)
    if (ok) {
      setCopied(true)
      toast({ title: '복사 완료', description: '임시 비밀번호가 클립보드에 복사되었습니다.' })
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast({
        variant: 'destructive',
        title: '복사 실패',
        description: '클립보드 복사에 실패했습니다. 직접 선택해 복사하세요.',
      })
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCopied(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            임시 비밀번호 발급 완료
          </DialogTitle>
          <DialogDescription>
            {accountName && <span className="font-medium text-foreground">{accountName}</span>}{' '}
            계정의 임시 비밀번호입니다. 대상자에게 전달한 뒤 로그인 후 즉시 변경하도록 안내하세요.
          </DialogDescription>
        </DialogHeader>

        {/* 임시비번 표시 */}
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-4">
          <code className="flex-1 select-all font-mono text-xl font-semibold tracking-wider break-all">
            {temporaryPassword}
          </code>
          <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 재확인 불가 경고 */}
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
          <p>
            이 임시 비밀번호는 지금만 확인할 수 있습니다. 모달을 닫으면 다시 볼 수 없으니 반드시
            복사하거나 전달을 완료하세요.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
