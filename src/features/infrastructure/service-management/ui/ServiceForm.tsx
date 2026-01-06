/**
 * Service Form Sheet
 * 서비스 생성/수정 폼
 */

import { Server } from 'lucide-react'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { useCodesByType, CODE_TYPE } from '@/entities/_shared/code'
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

  return (
    <FormSheet
      mode={mode}
      icon={Server}
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
    </FormSheet>
  )
}
