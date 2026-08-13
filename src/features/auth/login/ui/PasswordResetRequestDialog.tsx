/**
 * PasswordResetRequestDialog
 * 비밀번호 재설정 요청 — 담당자를 선택해 처리 요청 메시지를 보낸다.
 *
 * 계정 열거를 막기 위해 서버는 미등록 이메일·쿨다운 중복에도 성공 응답을 준다.
 * 따라서 이 화면은 결과를 구분해 보여주지 않는다 — 의도된 동작이다.
 */

import { useState, FormEvent } from 'react'

import { Loader2 } from 'lucide-react'

import { AdminContactPicker, useRequestPasswordReset } from '@/entities/auth/session'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

interface PasswordResetRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PasswordResetRequestDialog({
  open,
  onOpenChange,
}: PasswordResetRequestDialogProps) {
  const [email, setEmail] = useState('')
  const [memo, setMemo] = useState('')
  const [recipientAccountIds, setRecipientAccountIds] = useState<number[]>([])

  const { toast } = useToast()
  const requestPasswordReset = useRequestPasswordReset()

  const reset = () => {
    setEmail('')
    setMemo('')
    setRecipientAccountIds([])
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (recipientAccountIds.length === 0) {
      toast({
        title: '담당자를 선택해주세요',
        description: '요청을 받을 담당자를 1명 이상 선택해야 합니다.',
        variant: 'destructive',
      })
      return
    }

    try {
      await requestPasswordReset.mutateAsync({
        email,
        memo: memo.trim() || undefined,
        recipientAccountIds,
      })
      toast({
        title: '요청이 접수되었습니다',
        description: '담당자가 확인 후 임시 비밀번호를 전달해 드립니다.',
      })
      handleOpenChange(false)
    } catch {
      toast({
        title: '요청 실패',
        description: '요청을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>비밀번호 재설정 요청</DialogTitle>
          <DialogDescription>
            담당자를 선택해 요청을 보내면, 확인 후 임시 비밀번호를 전달해 드립니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">가입한 이메일</Label>
            <Input
              id="reset-email"
              name="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label>요청할 담당자</Label>
            <AdminContactPicker
              value={recipientAccountIds}
              onChange={setRecipientAccountIds}
              enabled={open}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-memo">메모 (선택)</Label>
            <Textarea
              id="reset-memo"
              name="reset-memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="본인 확인을 위한 연락처 등을 남겨주세요"
              maxLength={500}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={requestPasswordReset.isPending}>
              {requestPasswordReset.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              요청 보내기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
