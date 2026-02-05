/**
 * Account Form Component
 * 계정 수정 폼 컴포넌트
 */

import { useCodesByType, CODE_TYPE } from '@/entities/_shared/code'

import { getFormIcon } from '@/shared/config/domain-icons'
import { usePermission } from '@/shared/lib/hooks/use-permission'

import { Combobox } from '@/shared/ui/combobox'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { TypographyMuted } from '@/shared/ui/typography'

import type { AccountFormData } from '../model/types'

interface AccountFormProps {
  open: boolean
  email: string
  formData: AccountFormData
  isSubmitting: boolean
  onFormDataChange: (data: AccountFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function AccountForm({
  open,
  email,
  formData,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onClose,
}: AccountFormProps) {
  // Position 코드 목록 조회
  const { data: positionCodes = [] } = useCodesByType(CODE_TYPE.POSITION, {
    enabled: open,
  })

  // Role 코드 목록 조회
  const { data: roleCodes = [] } = useCodesByType(CODE_TYPE.ACCOUNT_ROLE, {
    enabled: open,
  })

  const positionOptions = [
    { value: '', label: '선택 안함' },
    ...positionCodes.map((code) => ({
      value: code.value,
      label: code.name,
    })),
  ]

  const { isAdmin } = usePermission()

  const roleOptions = roleCodes
    .filter((code) => isAdmin || code.value !== 'ADMIN')
    .map((code) => ({
      value: code.value,
      label: code.value,
    }))

  return (
    <FormSheet
      open={open}
      mode="edit"
      icon={getFormIcon('edit', 'account')}
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>이름</Label>
          <Input
            value={formData.accountName}
            onChange={(e) =>
              onFormDataChange({ ...formData, accountName: e.target.value })
            }
            placeholder="기본 사용자"
          />
        </div>
        <div className="space-y-2">
          <Label>직책</Label>
          <Combobox
            options={positionOptions}
            value={formData.position}
            onValueChange={(value) =>
              onFormDataChange({ ...formData, position: value })
            }
            placeholder="직책을 선택하세요"
            searchPlaceholder="직책 검색..."
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>권한</Label>
        <Combobox
          options={roleOptions}
          value={formData.role}
          onValueChange={(value) =>
            onFormDataChange({ ...formData, role: value })
          }
          placeholder="권한을 선택하세요"
          searchPlaceholder="권한 검색..."
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <Label className="font-medium">활성 상태</Label>
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
