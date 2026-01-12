/**
 * Department Form Component
 * 부서 생성/수정 폼 컴포넌트
 */

import { Plus, Pencil } from 'lucide-react'

import type { Department } from '@/entities/_shared/department'

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
import { TypographyMuted } from '@/shared/ui/typography'

import type { DepartmentFormData, DepartmentFormMode } from '../model/types'

interface DepartmentFormProps {
  open: boolean
  mode: DepartmentFormMode
  formData: DepartmentFormData
  departments: Department[]
  /** 수정 중인 부서 ID (edit 모드에서 자기 자신을 상위 부서로 선택 방지) */
  editingDepartmentId?: number | null
  isSubmitting: boolean
  onFormDataChange: (data: DepartmentFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function DepartmentForm({
  open,
  mode,
  formData,
  departments,
  editingDepartmentId,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onClose,
}: DepartmentFormProps) {
  // 선택 가능한 부서 목록 (수정 시 자기 자신 제외)
  const selectableDepartments = departments.filter(
    (d) => d.departmentId !== editingDepartmentId
  )

  return (
    <FormSheet
      open={open}
      icon={mode === 'create' ? Plus : Pencil}
      title={mode === 'create' ? '부서 생성' : '부서 수정'}
      description={
        mode === 'create'
          ? '새 부서 정보를 입력하세요.'
          : '부서 정보를 수정하세요.'
      }
      submitLabel={mode === 'create' ? '생성' : '저장'}
      submitIcon={mode === 'create' ? Plus : Pencil}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      {/* 부서명 */}
      <div className="space-y-2">
        <Label required>부서명</Label>
        <Input
          value={formData.departmentName}
          onChange={(e) =>
            onFormDataChange({ ...formData, departmentName: e.target.value })
          }
          placeholder="부서명을 입력하세요"
        />
      </div>

      {/* 상위 부서 선택 (생성 시에만) */}
      {mode === 'create' && (
        <div className="space-y-2">
          <Label>상위 부서</Label>
          <Select
            value={formData.parentDepartmentId?.toString() || ''}
            onValueChange={(value) =>
              onFormDataChange({
                ...formData,
                parentDepartmentId: value ? parseInt(value) : null,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="상위 부서를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {selectableDepartments.map((dept) => (
                <SelectItem key={dept.departmentId} value={dept.departmentId.toString()}>
                  {dept.departmentName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TypographyMuted className="text-xs">
            하위에 부서를 생성할 상위 부서를 선택하세요.
          </TypographyMuted>
        </div>
      )}

      {/* 설명 */}
      <div className="space-y-2">
        <Label>설명</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            onFormDataChange({ ...formData, description: e.target.value })
          }
          placeholder="부서에 대한 설명을 입력하세요"
          className="min-h-[80px]"
        />
      </div>
    </FormSheet>
  )
}
