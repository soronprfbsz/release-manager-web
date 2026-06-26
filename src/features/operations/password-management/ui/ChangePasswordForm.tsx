/**
 * Change Password Form
 * 비밀번호 변경 폼 (현재/새/새 확인 + 자체 제출 버튼).
 * 자가 변경(내 정보 섹션)과 강제 변경 게이트가 공용으로 사용한다. (PRD §5.1 / §5.3)
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { useChangeMyPassword } from '@/entities/operations/account'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { Button } from '@/shared/ui/button'
import { Form, FormField } from '@/shared/ui/form'

import { PasswordField } from './PasswordField'
import { getPasswordErrorMessage } from '../lib/error-message'
import { changePasswordSchema, type ChangePasswordFormValues } from '../model/validation'


interface ChangePasswordFormProps {
  /** 제출 버튼 라벨 */
  submitLabel?: string
  /** 현재 비밀번호 필드 라벨 (게이트에서 "임시 비밀번호" 등으로 override) */
  currentLabel?: string
  /** 성공 후 콜백 (게이트 해제, 시트 닫기 등) */
  onSuccess?: () => void
}

export function ChangePasswordForm({
  submitLabel = '비밀번호 변경',
  currentLabel = '현재 비밀번호',
  onSuccess,
}: ChangePasswordFormProps) {
  const { toast } = useToast()
  const changePassword = useChangeMyPassword()

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // FormSheet 내부 부모 <form> 과 중첩되지 않도록 ChangePasswordForm 은 <div> 로 렌더링하고
  // 제출은 버튼 onClick 으로 RHF handleSubmit 을 호출한다.
  const handleSubmit = form.handleSubmit((values) => {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          form.reset()
          toast({
            title: '비밀번호 변경 완료',
            description: '비밀번호가 성공적으로 변경되었습니다.',
          })
          onSuccess?.()
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: '비밀번호 변경 실패',
            description: getPasswordErrorMessage(error),
          })
        },
      }
    )
  })

  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <PasswordField
              field={field}
              label={currentLabel}
              placeholder="현재 비밀번호 입력"
              autoComplete="current-password"
            />
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <PasswordField
              field={field}
              label="새 비밀번호"
              placeholder="새 비밀번호 입력 (8~64자)"
              autoComplete="new-password"
            />
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <PasswordField
              field={field}
              label="새 비밀번호 확인"
              placeholder="새 비밀번호 다시 입력"
              autoComplete="new-password"
            />
          )}
        />

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={changePassword.isPending}
          className="w-full"
        >
          {changePassword.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {submitLabel} 중...
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4 mr-2" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </Form>
  )
}
