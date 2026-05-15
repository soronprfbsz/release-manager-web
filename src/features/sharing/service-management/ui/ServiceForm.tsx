/**
 * Service Form Sheet
 * 서비스 생성/수정 폼
 */

import { useCodesByType, CODE_TYPE } from '@/entities/_shared/code'

import { getFormIcon } from '@/shared/config/domain-icons'
import { cn } from '@/shared/lib/utils'
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
import { Textarea } from '@/shared/ui/textarea'

import {
  GLYPH_COLORS,
  resolveGlyph,
  getGlyphFontSizeClass,
} from '../lib/glyph'
import type { ServiceFormData, ServiceFormMode } from '../model/types'

interface ServiceFormProps {
  mode: ServiceFormMode
  formData: ServiceFormData
  isSubmitting: boolean
  onFormDataChange: (data: ServiceFormData) => void
  onSubmit: () => void
  onCancel: () => void
}

export function ServiceForm({
  mode,
  formData,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const { data: serviceTypes = [], isLoading: isLoadingServiceTypes } = useCodesByType(CODE_TYPE.SERVICE_TYPE)

  // 라이브 프리뷰용 — serviceName 이 없을 때는 '?' 로 표시
  const previewService = {
    serviceName: formData.serviceName || '?',
    glyphText: formData.glyphText || null,
    glyphBackgroundColor: formData.glyphBackgroundColor || null,
  }
  const { text: previewText, glyphClass: previewGlyphClass } = resolveGlyph(previewService)
  const previewFontSize = getGlyphFontSizeClass(previewText)

  return (
    <FormSheet
      mode={mode}
      icon={getFormIcon(mode, 'service')}
      title={{ create: '서비스 생성', edit: '서비스 수정' }}
      description={{
        create: '새 서비스 정보를 입력하세요.',
        edit: '서비스 정보를 수정하세요.',
      }}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onClose={onCancel}
    >
      <div className="space-y-2">
        <Label required>서비스 타입</Label>
        <Select
          value={formData.serviceType}
          onValueChange={(value) =>
            onFormDataChange({
              ...formData,
              serviceType: value as ServiceFormData['serviceType'],
            })
          }
          disabled={isLoadingServiceTypes}
        >
          <SelectTrigger>
            <SelectValue placeholder="서비스 타입 선택" />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label required>서비스명</Label>
        <Input
          value={formData.serviceName}
          onChange={(e) =>
            onFormDataChange({ ...formData, serviceName: e.target.value })
          }
          placeholder="서비스명 입력"
        />
      </div>

      <div className="space-y-2">
        <Label>설명</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            onFormDataChange({ ...formData, description: e.target.value })
          }
          placeholder="서비스 설명"
          className="min-h-[80px]"
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
              onFormDataChange({ ...formData, glyphText: val })
            }}
            placeholder="예: API"
            maxLength={3}
            className="font-mono"
          />
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
                    onFormDataChange({
                      ...formData,
                      glyphBackgroundColor: isSelected ? '' : color.key,
                    })
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
                {GLYPH_COLORS.find((c) => c.key === formData.glyphBackgroundColor)?.label ?? formData.glyphBackgroundColor}
              </span>
              <button
                type="button"
                onClick={() => onFormDataChange({ ...formData, glyphBackgroundColor: '' })}
                className="text-xs underline underline-offset-2 hover:text-foreground"
              >
                초기화
              </button>
            </p>
          )}
        </div>
      </div>
    </FormSheet>
  )
}
