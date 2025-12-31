/**
 * Custom Patch Generate Form Card Component
 * 커스텀 패치 생성 폼 카드 컴포넌트
 */

import { ArrowRight, GitBranch, Layers, Loader2 } from 'lucide-react'

import type { Engineer } from '@/entities/operations'
import type { CustomPatchCustomer, CustomPatchVersion } from '@/entities/patches/patch'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Combobox } from '@/shared/ui/combobox'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { CustomPatchCreateFormData } from '../model/types'

interface CustomPatchGenerateFormCardProps {
  formData: CustomPatchCreateFormData
  customers: CustomPatchCustomer[]
  versions: CustomPatchVersion[]
  engineers: Engineer[]
  isCustomersLoading: boolean
  isVersionsLoading: boolean
  isSubmitting: boolean
  onFormDataChange: (data: CustomPatchCreateFormData) => void
  onSubmit: () => void
}

export function CustomPatchGenerateFormCard({
  formData,
  customers,
  versions,
  engineers,
  isCustomersLoading,
  isVersionsLoading,
  isSubmitting,
  onFormDataChange,
  onSubmit,
}: CustomPatchGenerateFormCardProps) {
  // 승인된 버전만 필터링
  const approvedVersions = versions.filter((v) => v.isApproved)

  // fromVersion: 승인된 모든 버전 (베이스 버전 포함)
  const fromVersionOptions = approvedVersions

  // toVersion: 베이스 버전이 아닌 것 + fromVersion보다 큰 것
  const filteredToVersions = approvedVersions.filter(
    (v) => !v.isBaseVersion && formData.fromVersion && v.version > formData.fromVersion
  )

  const handleFromVersionChange = (value: string) => {
    onFormDataChange({
      ...formData,
      fromVersion: value,
      toVersion: formData.toVersion && value >= formData.toVersion ? '' : formData.toVersion,
    })
  }

  const selectedCustomer = customers.find((c) => c.customerId === formData.customerId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          커스텀 패치 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Customer Selection */}
        <div className="space-y-2">
          <Label required>고객사</Label>
          <Combobox
            options={customers.map((c) => ({
              value: String(c.customerId),
              label: `${c.customerName} (${c.customerCode})`,
            }))}
            value={formData.customerId ? String(formData.customerId) : ''}
            onValueChange={(value) => {
              onFormDataChange({
                ...formData,
                customerId: value ? Number(value) : null,
                fromVersion: '',
                toVersion: '',
              })
            }}
            placeholder="고객사를 선택하세요"
            searchPlaceholder="고객사 검색..."
            disabled={isCustomersLoading}
          />
          {isCustomersLoading && <TypographyMuted>고객사 목록을 불러오는 중...</TypographyMuted>}
          {!isCustomersLoading && customers.length === 0 && (
            <TypographyMuted>커스텀 버전이 있는 고객사가 없습니다.</TypographyMuted>
          )}
        </div>

        {/* Version Selection */}
        <div className="space-y-2">
          <Label required>버전 범위</Label>
          <div className="flex items-center gap-3">
            <Combobox
              options={fromVersionOptions.map((v) => ({
                value: v.version,
                label: v.isBaseVersion ? `${v.version} (베이스)` : v.version,
              }))}
              value={formData.fromVersion}
              onValueChange={handleFromVersionChange}
              placeholder="시작 버전"
              searchPlaceholder="버전 검색..."
              disabled={isVersionsLoading || !formData.customerId || fromVersionOptions.length === 0}
              className="flex-1"
            />
            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Combobox
              options={filteredToVersions.map((v) => ({
                value: v.version,
                label: v.version,
              }))}
              value={formData.toVersion}
              onValueChange={(value) => onFormDataChange({ ...formData, toVersion: value })}
              placeholder="종료 버전"
              searchPlaceholder="버전 검색..."
              disabled={isVersionsLoading || !formData.customerId || !formData.fromVersion}
              className="flex-1"
            />
          </div>
          {formData.customerId && isVersionsLoading && (
            <TypographyMuted>버전 목록을 불러오는 중...</TypographyMuted>
          )}
          {formData.customerId && !isVersionsLoading && approvedVersions.length === 0 && (
            <TypographyMuted>승인된 버전이 없습니다.</TypographyMuted>
          )}
        </div>

        {/* Assigned Engineer */}
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
                engineerId: value === '__none__' || !value ? null : Number(value),
              })
            }
            placeholder="선택 안함"
            searchPlaceholder="엔지니어 검색..."
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>설명</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            placeholder="패치에 대한 설명을 입력하세요 (예: 특정 버그 수정, 기능 추가 등)"
            className="min-h-[80px]"
          />
        </div>

        {/* Info Message */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <TypographyMuted>
            {selectedCustomer
              ? `${selectedCustomer.customerName}의 커스텀 버전 범위 내 모든 변경사항이 하나의 패치 파일로 생성됩니다.`
              : '고객사를 선택하면 해당 고객사의 커스텀 버전 목록이 표시됩니다.'}
          </TypographyMuted>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={!formData.customerId || !formData.fromVersion || !formData.toVersion || isSubmitting}
          className="w-full"
          size="lg"
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
      </CardContent>
    </Card>
  )
}
