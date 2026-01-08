/**
 * Project Form Component
 * 프로젝트 생성/수정 폼 (Sheet 기반)
 */

import { Save } from 'lucide-react'

import { getFormIcon } from '@/shared/config/domain-icons'

import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Switch } from '@/shared/ui/switch'

import type { ProjectFormData, ProjectFormMode } from '../model/types'

interface ProjectFormProps {
  mode: ProjectFormMode
  formData: ProjectFormData
  isEnabled?: boolean
  isSubmitting: boolean
  errors?: Record<string, string>
  onFormDataChange: (data: ProjectFormData) => void
  onEnabledChange?: (isEnabled: boolean) => void
  onSubmit: () => void
  onClose: () => void
}

export function ProjectForm({
  mode,
  formData,
  isEnabled = true,
  isSubmitting,
  errors = {},
  onFormDataChange,
  onEnabledChange,
  onSubmit,
  onClose,
}: ProjectFormProps) {
  const isEditMode = mode === 'edit'

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value })
  }

  return (
    <FormSheet
      mode={mode}
      icon={getFormIcon(mode, 'project')}
      title={{ create: '새 프로젝트', edit: '프로젝트 수정' }}
      description={{ create: '새로운 프로젝트를 생성합니다.', edit: '프로젝트 정보를 수정합니다.' }}
      submitLabel={{ create: '생성', edit: '수정' }}
      submitIcon={Save}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onClose={onClose}
      width="sm:max-w-md"
    >
      {/* 프로젝트 ID */}
      <div className="grid gap-2">
        <Label htmlFor="projectId">
          프로젝트 코드 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="projectId"
          placeholder="e.g. my-project"
          value={formData.projectId}
          onChange={(e) => handleChange('projectId', e.target.value)}
          disabled={isEditMode}
          className={errors.projectId ? 'border-destructive' : ''}
        />
        {errors.projectId && (
          <p className="text-xs text-destructive">{errors.projectId}</p>
        )}
        {!isEditMode && (
          <p className="text-xs text-muted-foreground">
            영문 소문자, 숫자, 언더스코어만 사용 가능
          </p>
        )}
      </div>

      {/* 프로젝트명 */}
      <div className="grid gap-2">
        <Label htmlFor="projectName">
          프로젝트명 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="projectName"
          placeholder="프로젝트명을 입력하세요"
          value={formData.projectName}
          onChange={(e) => handleChange('projectName', e.target.value)}
          className={errors.projectName ? 'border-destructive' : ''}
        />
        {errors.projectName && (
          <p className="text-xs text-destructive">{errors.projectName}</p>
        )}
      </div>

      {/* 설명 */}
      <div className="grid gap-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          placeholder="프로젝트 설명을 입력하세요"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
        />
      </div>

      {/* 활성 상태 */}
      {onEnabledChange && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor="isEnabled" className="cursor-pointer font-medium">
              활성 상태
            </Label>
            <p className="text-xs text-muted-foreground">
              비활성화하면 프로젝트가 관리 대상에서 제외됩니다.
            </p>
          </div>
          <Switch
            id="isEnabled"
            checked={isEnabled}
            onCheckedChange={onEnabledChange}
          />
        </div>
      )}
    </FormSheet>
  )
}
