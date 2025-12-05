/**
 * Engineer Form Component
 * 엔지니어 생성/수정 폼 컴포넌트
 */

import { Users } from 'lucide-react'

import type { Department } from '@/entities/department'

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

import type { EngineerFormData, EngineerFormMode } from '../model/types'

interface EngineerFormProps {
  mode: EngineerFormMode
  formData: EngineerFormData
  departments: Department[]
  isSubmitting: boolean
  onFormDataChange: (data: EngineerFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function EngineerForm({
  mode,
  formData,
  departments,
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
        <Label required>이름</Label>
        <Input
          value={formData.engineerName}
          onChange={(e) =>
            onFormDataChange({ ...formData, engineerName: e.target.value })
          }
          placeholder="예: 홍길동"
          maxLength={50}
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
          placeholder="예: engineer@company.com"
          maxLength={100}
        />
      </div>
      <div className="space-y-2">
        <Label>소속팀</Label>
        <Select
          value={formData.departmentId}
          onValueChange={(value) =>
            onFormDataChange({ ...formData, departmentId: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="소속팀을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.departmentId} value={dept.departmentId.toString()}>
                {dept.departmentName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
