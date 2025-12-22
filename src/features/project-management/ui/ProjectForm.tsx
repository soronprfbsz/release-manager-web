/**
 * Project Form Component
 * 프로젝트 생성/수정 폼 (Sheet 기반)
 */

import { useEffect } from 'react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Switch } from '@/shared/ui/switch'

import type { ProjectFormData, ProjectFormMode } from '../model/types'

interface ProjectFormProps {
  mode: ProjectFormMode
  formData: ProjectFormData
  isActive?: boolean
  isSubmitting: boolean
  errors?: Record<string, string>
  onFormDataChange: (data: ProjectFormData) => void
  onActiveChange?: (isActive: boolean) => void
  onSubmit: () => void
  onClose: () => void
}

export function ProjectForm({
  mode,
  formData,
  isActive = true,
  isSubmitting,
  errors = {},
  onFormDataChange,
  onActiveChange,
  onSubmit,
  onClose,
}: ProjectFormProps) {
  const isOpen = mode !== null
  const isEditMode = mode === 'edit'

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value })
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? '프로젝트 수정' : '새 프로젝트'}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? '프로젝트 정보를 수정합니다.'
              : '새로운 프로젝트를 생성합니다.'}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-6">
          {/* 프로젝트 ID */}
          <div className="grid gap-2">
            <Label htmlFor="projectId">
              프로젝트 ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="projectId"
              placeholder="예: my-project"
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
                영문, 숫자, 하이픈, 언더스코어만 사용 가능
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

          {/* 활성 상태 (수정 모드에서만) */}
          {isEditMode && onActiveChange && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">활성 상태</Label>
                <p className="text-xs text-muted-foreground">
                  비활성화하면 프로젝트 선택 목록에서 제외됩니다.
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={onActiveChange}
              />
            </div>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : isEditMode ? '수정' : '생성'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
