/**
 * Patch Create Form Component
 * 패치 생성 폼 컴포넌트
 */

import { ArrowRight, Layers, Loader2 } from 'lucide-react'

import type { Customer } from '@/entities/customer'
import type { Engineer } from '@/entities/engineer'

import { Button } from '@/shared/ui/button'
import { Combobox } from '@/shared/ui/combobox'
import { Label } from '@/shared/ui/label'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { PatchCreateFormData } from '../model/types'

interface PatchCreateFormProps {
  isOpen: boolean
  formData: PatchCreateFormData
  versions: string[]
  customers: Customer[]
  engineers: Engineer[]
  isVersionsLoading: boolean
  isSubmitting: boolean
  onFormDataChange: (data: PatchCreateFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function PatchCreateForm({
  isOpen,
  formData,
  versions,
  customers,
  engineers,
  isVersionsLoading,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onClose,
}: PatchCreateFormProps) {
  const handleFromVersionChange = (value: string) => {
    onFormDataChange({
      ...formData,
      fromVersion: value,
      toVersion: formData.toVersion && value >= formData.toVersion ? '' : formData.toVersion,
    })
  }

  const filteredToVersions = versions.filter(
    (v) => formData.fromVersion && v > formData.fromVersion
  )

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            패치 생성
          </SheetTitle>
          <SheetDescription>
            선택한 버전 범위 내의 모든 변경사항이 하나의 패치 파일로 생성됩니다.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <div className="space-y-5">
            {/* 버전 선택 */}
            <div className="space-y-2">
              <Label required>버전 범위</Label>
              <div className="flex items-center gap-3">
                <Select
                  value={formData.fromVersion}
                  onValueChange={handleFromVersionChange}
                  disabled={isVersionsLoading || versions.length === 0}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="시작 버전" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Select
                  value={formData.toVersion}
                  onValueChange={(value) =>
                    onFormDataChange({ ...formData, toVersion: value })
                  }
                  disabled={
                    isVersionsLoading || versions.length === 0 || !formData.fromVersion
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="종료 버전" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredToVersions.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isVersionsLoading && (
                <TypographyMuted>버전 목록을 불러오는 중...</TypographyMuted>
              )}
              {!isVersionsLoading && versions.length === 0 && (
                <TypographyMuted>등록된 버전이 없습니다.</TypographyMuted>
              )}
            </div>

            {/* 고객사 */}
            <div className="space-y-2">
              <Label>고객사</Label>
              <Combobox
                options={[
                  { value: '__none__', label: '선택 안함' },
                  ...customers.map((c) => ({
                    value: c.customerCode,
                    label: `${c.customerName} (${c.customerCode})`,
                  })),
                ]}
                value={formData.customerCode || '__none__'}
                onValueChange={(value) =>
                  onFormDataChange({
                    ...formData,
                    customerCode: value === '__none__' ? '' : value,
                  })
                }
                placeholder="선택 안함"
                searchPlaceholder="고객사 검색..."
              />
            </div>

            {/* 담당 엔지니어 */}
            <div className="space-y-2">
              <Label>담당 엔지니어</Label>
              <Combobox
                options={[
                  { value: '__none__', label: '선택 안함' },
                  ...engineers.map((e) => ({
                    value: String(e.engineerId),
                    label: `${e.engineerName} (${e.departmentName || '부서 없음'})`,
                  })),
                ]}
                value={formData.engineerId !== null ? String(formData.engineerId) : '__none__'}
                onValueChange={(value) =>
                  onFormDataChange({
                    ...formData,
                    engineerId: value === '__none__' ? null : Number(value),
                  })
                }
                placeholder="선택 안함"
                searchPlaceholder="엔지니어 검색..."
              />
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  onFormDataChange({ ...formData, description: e.target.value })
                }
                placeholder="패치에 대한 설명"
                className="min-h-[80px]"
              />
            </div>

            {/* 생성 정보 미리보기 */}
            {formData.fromVersion && formData.toVersion && (
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>{formData.fromVersion}</strong> 초과 ~{' '}
                  <strong>{formData.toVersion}</strong> 이하 버전의 모든 DB 변경사항이
                  포함된 패치가 생성됩니다.
                </p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                취소
              </Button>
              <Button
                onClick={onSubmit}
                disabled={!formData.fromVersion || !formData.toVersion || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4 mr-2" />
                    패치 생성
                  </>
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
