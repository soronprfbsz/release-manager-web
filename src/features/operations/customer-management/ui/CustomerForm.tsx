/**
 * Customer Form Component
 * 고객사 생성/수정 폼 컴포넌트
 */

import { getFormIcon } from '@/shared/config/domain-icons'

import type { Project } from '@/entities/operations/project'

import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { CustomerFormData, CustomerFormMode } from '../model/types'

interface CustomerFormProps {
  mode: CustomerFormMode
  formData: CustomerFormData
  projects: Project[]
  isSubmitting: boolean
  onFormDataChange: (data: CustomerFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function CustomerForm({
  mode,
  formData,
  projects,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onClose,
}: CustomerFormProps) {
  return (
    <FormSheet
      mode={mode}
      icon={getFormIcon(mode, 'customer')}
      title={{ create: '고객사 생성', edit: '고객사 수정' }}
      description={{
        create: '새 고객사 정보를 입력하세요.',
        edit: '고객사 정보를 수정하세요.',
      }}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      {/* 프로젝트 선택 */}
      <div className="space-y-2">
        <Label required>프로젝트</Label>
        <Select
          value={formData.projectId}
          onValueChange={(value) => onFormDataChange({ ...formData, projectId: value })}
          disabled={mode === 'edit'}
        >
          <SelectTrigger>
            <SelectValue placeholder="프로젝트를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.projectId} value={project.projectId}>
                {project.projectName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {mode === 'edit' && (
          <TypographyMuted className="text-xs">
            프로젝트는 수정할 수 없습니다.
          </TypographyMuted>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label required>고객사 코드</Label>
          <Input
            value={formData.customerCode}
            onChange={(e) =>
              onFormDataChange({ ...formData, customerCode: e.target.value })
            }
            placeholder="e.g. customerA"
            disabled={mode === 'edit'}
          />
        </div>

        <div className="space-y-2">
          <Label required>고객사명</Label>
          <Input
            value={formData.customerName}
            onChange={(e) =>
              onFormDataChange({ ...formData, customerName: e.target.value })
            }
            placeholder="e.g. A회사"
          />
        </div>
      </div>
      {mode === 'edit' && (
        <TypographyMuted className="text-xs -mt-2">
          고객사 코드는 수정할 수 없습니다.
        </TypographyMuted>
      )}
      <div className="space-y-2">
        <Label>설명</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            onFormDataChange({ ...formData, description: e.target.value })
          }
          placeholder="고객사에 대한 설명을 입력하세요"
          className="min-h-[80px]"
        />
      </div>

      {/* 활성 상태 토글 */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <Label className="font-medium">활성화</Label>
          <TypographyMuted className="text-xs">
            비활성화 시 관리 대상에서 제외됩니다.
          </TypographyMuted>
        </div>
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            onFormDataChange({ ...formData, isActive: checked })
          }
        />
      </div>
    </FormSheet>
  )
}
