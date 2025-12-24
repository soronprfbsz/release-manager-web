/**
 * Account Form Component
 * 계정 수정 폼 컴포넌트
 */

import { User } from 'lucide-react'

import { Combobox } from '@/shared/ui/combobox'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { TypographyMuted } from '@/shared/ui/typography'

import type { AccountFormData } from '../model/types'

interface AccountFormProps {
  email: string
  formData: AccountFormData
  isSubmitting: boolean
  onFormDataChange: (data: AccountFormData) => void
  onSubmit: () => void
  onClose: () => void
}

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'ADMIN' },
  { value: 'USER', label: 'USER' },
  { value: 'GUEST', label: 'GUEST' },
]

export function AccountForm({
  email,
  formData,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onClose,
}: AccountFormProps) {
  return (
    <FormSheet
      mode="edit"
      icon={User}
      title={{ create: '', edit: '계정 수정' }}
      description={{
        create: '',
        edit: '계정 정보를 수정하세요.',
      }}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <div className="space-y-2">
        <Label>이메일</Label>
        <Input
          type="email"
          value={email}
          disabled
        />
        <TypographyMuted className="text-xs">
          이메일은 수정할 수 없습니다.
        </TypographyMuted>
      </div>
      <div className="space-y-2">
        <Label>계정명</Label>
        <Input
          value={formData.accountName}
          onChange={(e) =>
            onFormDataChange({ ...formData, accountName: e.target.value })
          }
          placeholder="기본 사용자"
        />
      </div>
      <div className="space-y-2">
        <Label>권한</Label>
        <Combobox
          options={ROLE_OPTIONS}
          value={formData.role}
          onValueChange={(value) =>
            onFormDataChange({ ...formData, role: value })
          }
          placeholder="권한을 선택하세요"
          searchPlaceholder="권한 검색..."
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>활성 상태</Label>
          <TypographyMuted className="text-xs">
            비활성화하면 해당 계정으로 로그인할 수 없습니다.
          </TypographyMuted>
        </div>
        <Switch
          checked={formData.status === 'ACTIVE'}
          onCheckedChange={(checked) =>
            onFormDataChange({ ...formData, status: checked ? 'ACTIVE' : 'INACTIVE' })
          }
        />
      </div>
    </FormSheet>
  )
}
