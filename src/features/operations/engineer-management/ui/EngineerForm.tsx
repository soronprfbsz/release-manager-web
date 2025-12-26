/**
 * Engineer Form Component
 * 엔지니어 생성/수정 폼 컴포넌트
 */

import { Users } from 'lucide-react'

import type { CodeSimpleResponse } from '@/entities/_shared/code'
import type { Department } from '@/entities/_shared/department'

import { Combobox } from '@/shared/ui/combobox'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

import type { EngineerFormData, EngineerFormMode } from '../model/types'

interface EngineerFormProps {
  mode: EngineerFormMode
  formData: EngineerFormData
  departments: Department[]
  positions: CodeSimpleResponse[]
  isSubmitting: boolean
  onFormDataChange: (data: EngineerFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function EngineerForm({
  mode,
  formData,
  departments,
  positions,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onClose,
}: EngineerFormProps) {
  return (
    <FormSheet
      mode={mode}
      icon={Users}
      title={{ create: '엔지니어 등록', edit: '엔지니어 수정' }}
      description={{
        create: '새 엔지니어 정보를 입력하세요.',
        edit: '엔지니어 정보를 수정하세요.',
      }}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      <div className="space-y-2">
        <Label>소속팀</Label>
        <Combobox
          options={departments.map((dept) => ({
            value: dept.departmentId.toString(),
            label: dept.departmentName,
          }))}
          value={formData.departmentId}
          onValueChange={(value) =>
            onFormDataChange({ ...formData, departmentId: value })
          }
          placeholder="소속팀을 선택하세요"
          searchPlaceholder="소속팀 검색..."
        />
      </div>
      <div className="space-y-2">
        <Label required>이름</Label>
        <Input
          value={formData.engineerName}
          onChange={(e) =>
            onFormDataChange({ ...formData, engineerName: e.target.value })
          }
          placeholder="예: 신성수"
          maxLength={50}
        />
      </div>
      <div className="space-y-2">
        <Label>직급</Label>
        <Combobox
          options={positions.map((pos) => ({
            value: pos.value,
            label: pos.name,
          }))}
          value={formData.position}
          onValueChange={(value) =>
            onFormDataChange({ ...formData, position: value })
          }
          placeholder="직급을 선택하세요"
          searchPlaceholder="직급 검색..."
        />
      </div>
      <div className="space-y-2">
        <Label required>이메일</Label>
        <Input
          type="email"
          value={formData.engineerEmail}
          onChange={(e) =>
            onFormDataChange({ ...formData, engineerEmail: e.target.value })
          }
          placeholder="예: shinss@tscientific.co.kr"
          maxLength={100}
        />
      </div>
      <div className="space-y-2">
        <Label>설명</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            onFormDataChange({ ...formData, description: e.target.value })
          }
          placeholder="엔지니어에 대한 설명을 입력하세요"
          maxLength={500}
          rows={3}
        />
      </div>
    </FormSheet>
  )
}
