/**
 * Custom Patch Create Form Component
 * 커스텀 패치 생성 폼 컴포넌트 (FormSheet 기반)
 */

import { ArrowRight, GitBranch, Layers } from 'lucide-react'

import type { Engineer } from '@/entities/operations'
import type { CustomPatchCustomer, CustomPatchVersion } from '@/entities/patches/patch'

import { Combobox } from '@/shared/ui/combobox'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { CustomPatchCreateFormData } from '../model/types'

interface CustomPatchCreateFormProps {
  isOpen: boolean
  formData: CustomPatchCreateFormData
  customers: CustomPatchCustomer[]
  versions: CustomPatchVersion[]
  engineers: Engineer[]
  isCustomersLoading: boolean
  isVersionsLoading: boolean
  isSubmitting: boolean
  onFormDataChange: (data: CustomPatchCreateFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function CustomPatchCreateForm({
  isOpen,
  formData,
  customers,
  versions,
  engineers,
  isCustomersLoading,
  isVersionsLoading,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onClose,
}: CustomPatchCreateFormProps) {
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
    <FormSheet
      open={isOpen}
      icon={GitBranch}
      title="커스텀 패치 생성"
      description="고객사의 커스텀 버전 범위 내 모든 변경사항이 하나의 패치 파일로 생성됩니다."
      submitLabel="패치 생성"
      submitIcon={Layers}
      isSubmitting={isSubmitting}
      submitDisabled={!formData.customerId || !formData.fromVersion || !formData.toVersion}
      onSubmit={onSubmit}
      onClose={onClose}
      width="w-[500px] sm:max-w-[500px]"
    >
      {/* 고객사 선택 */}
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
        {isCustomersLoading && (
          <TypographyMuted>고객사 목록을 불러오는 중...</TypographyMuted>
        )}
        {!isCustomersLoading && customers.length === 0 && (
          <TypographyMuted>커스텀 버전이 있는 고객사가 없습니다.</TypographyMuted>
        )}
      </div>

      {/* 버전 선택 */}
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
            disabled={
              isVersionsLoading || !formData.customerId || fromVersionOptions.length === 0
            }
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

      {/* 패치명 */}
      <div className="space-y-2">
        <Label>패치명</Label>
        <Input
          value={formData.patchName}
          onChange={(e) =>
            onFormDataChange({ ...formData, patchName: e.target.value })
          }
          placeholder="미입력 시 자동 생성 (예: 20260102_1.0.0_1.1.0)"
          maxLength={100}
        />
        <TypographyMuted className="text-xs">
          최대 100자. 미입력 시 날짜와 버전 정보로 자동 생성됩니다.
        </TypographyMuted>
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label>설명</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
          placeholder="패치에 대한 설명"
          className="min-h-[80px]"
        />
      </div>

      {/* 생성 정보 미리보기 */}
      {formData.customerId && formData.fromVersion && formData.toVersion && (
        <div className="p-4 bg-blue-500/10 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>{selectedCustomer?.customerName}</strong>의{' '}
            <strong>{formData.fromVersion}</strong> 초과 ~{' '}
            <strong>{formData.toVersion}</strong> 이하 버전의 모든 DB 변경사항이 포함된
            패치가 생성됩니다.
          </p>
        </div>
      )}
    </FormSheet>
  )
}
