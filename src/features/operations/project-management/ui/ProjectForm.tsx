/**
 * Project Form Component
 * 프로젝트 생성/수정 폼 (Sheet 기반)
 */

import { Save } from 'lucide-react'

import { getFormIcon } from '@/shared/config/domain-icons'
import { GLYPH_COLORS, resolveGlyph, getGlyphFontSizeClass } from '@/shared/lib/glyph'
import { cn } from '@/shared/lib/utils'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'

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

  // 라이브 프리뷰용
  const previewProject = {
    name: formData.projectName || '?',
    glyphText: formData.glyphText || null,
    glyphBackgroundColor: formData.glyphBackgroundColor || null,
  }
  const { text: previewText, glyphClass: previewGlyphClass } = resolveGlyph(previewProject)
  const previewFontSize = getGlyphFontSizeClass(previewText)

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

      {/* 글리프 배지 설정 */}
      <div className="space-y-3 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">글리프 배지</Label>
          {/* 라이브 프리뷰 */}
          <div
            className={cn(
              'h-10 w-10 rounded-md flex items-center justify-center',
              'font-mono font-semibold select-none',
              previewFontSize,
              previewGlyphClass
            )}
          >
            {previewText}
          </div>
        </div>

        {/* 글리프 텍스트 입력 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            표시 텍스트 (최대 3자, 미입력 시 이름 첫글자 사용)
          </Label>
          <Input
            value={formData.glyphText}
            onChange={(e) => {
              const val = e.target.value.slice(0, 3)
              handleChange('glyphText', val)
            }}
            placeholder="예: DEV"
            maxLength={3}
            className={cn('font-mono', errors.glyphText ? 'border-destructive' : '')}
          />
          {errors.glyphText && (
            <p className="text-xs text-destructive">{errors.glyphText}</p>
          )}
        </div>

        {/* 색상 swatch 그리드 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            배경 색상
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {GLYPH_COLORS.map((color) => {
              const isSelected = formData.glyphBackgroundColor === color.key
              return (
                <button
                  key={color.key}
                  type="button"
                  title={color.label}
                  onClick={() =>
                    handleChange(
                      'glyphBackgroundColor',
                      isSelected ? '' : color.key
                    )
                  }
                  className={cn(
                    'h-7 w-full rounded-md transition-all',
                    color.swatchClass,
                    isSelected
                      ? 'ring-2 ring-offset-1 ring-foreground/60 scale-105'
                      : 'hover:scale-105 hover:ring-1 hover:ring-offset-1 hover:ring-foreground/30'
                  )}
                />
              )
            })}
          </div>
          {/* 선택된 색상 표시 / 초기화 */}
          {formData.glyphBackgroundColor && (
            <p className="text-xs text-muted-foreground flex items-center justify-between">
              <span>
                {GLYPH_COLORS.find((c) => c.key === formData.glyphBackgroundColor)?.label ??
                  formData.glyphBackgroundColor}
              </span>
              <button
                type="button"
                onClick={() => handleChange('glyphBackgroundColor', '')}
                className="text-xs underline underline-offset-2 hover:text-foreground"
              >
                초기화
              </button>
            </p>
          )}
        </div>
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
