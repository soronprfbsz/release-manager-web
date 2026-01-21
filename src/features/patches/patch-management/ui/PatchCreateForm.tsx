/**
 * Patch Create Form Component
 * 패치 생성 폼 컴포넌트
 */

import { ArrowRight, Tag, type LucideIcon } from 'lucide-react'

import type { Customer, Account } from '@/entities/operations'

import { Combobox } from '@/shared/ui/combobox'
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
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { PatchCreateFormData } from '../model/types'

interface PatchCreateFormProps {
  isOpen: boolean
  formData: PatchCreateFormData
  versions: string[]
  customers: Customer[]
  accounts: Account[]
  isVersionsLoading: boolean
  isSubmitting: boolean
  onFormDataChange: (data: PatchCreateFormData) => void
  onSubmit: () => void
  onClose: () => void
  /** 페이지 헤더와 동일한 아이콘 */
  icon?: LucideIcon
}

export function PatchCreateForm({
  isOpen,
  formData,
  versions,
  customers,
  accounts,
  isVersionsLoading,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onClose,
  icon: PageIcon = Tag,
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
    <FormSheet
      open={isOpen}
      icon={PageIcon}
      title="패치 생성"
      description="선택한 버전 범위 내의 모든 변경사항이 하나의 패치 파일로 생성됩니다."
      submitLabel="패치 생성"
      submitIcon={PageIcon}
      isSubmitting={isSubmitting}
      submitDisabled={!formData.fromVersion || !formData.toVersion}
      onSubmit={onSubmit}
      onClose={onClose}
      width="w-[500px] sm:max-w-[500px]"
    >
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

      {/* 고객사 & 담당자 */}
      <div className="grid grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <Label>담당자</Label>
          <Combobox
            options={[
              { value: '__none__', label: '선택 안함' },
              ...accounts.map((a) => ({
                value: String(a.accountId),
                label: `${a.accountName} (${a.departmentName || '부서 없음'})`,
              })),
            ]}
            value={formData.assigneeId !== null ? String(formData.assigneeId) : '__none__'}
            onValueChange={(value) =>
              onFormDataChange({
                ...formData,
                assigneeId: value === '__none__' ? null : Number(value),
              })
            }
            placeholder="선택 안함"
            searchPlaceholder="담당자 검색..."
          />
        </div>
      </div>

      {/* 패치명 */}
      <div className="space-y-2">
        <Label>패치명</Label>
        <Input
          value={formData.patchName}
          onChange={(e) =>
            onFormDataChange({ ...formData, patchName: e.target.value })
          }
          placeholder="미입력 시 자동 생성 (e.g. 20260102_1.0.0_1.1.0)"
          maxLength={100}
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

      {/* 모든 빌드 버전 포함 */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor="includeAllBuildVersions" className="cursor-pointer font-medium">
            모든 버전의 빌드 파일 포함
          </Label>
          <TypographyMuted className="text-xs">
            WEB/ENGINE 카테고리의 모든 버전의 빌드 파일을 포함합니다. 체크 해제 시 마지막 버전의 빌드 파일만 포함됩니다.
          </TypographyMuted>
        </div>
        <Switch
          id="includeAllBuildVersions"
          checked={formData.includeAllBuildVersions}
          onCheckedChange={(checked) =>
            onFormDataChange({ ...formData, includeAllBuildVersions: checked })
          }
        />
      </div>

      {/* 생성 정보 미리보기 */}
      {formData.fromVersion && formData.toVersion && (
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-primary">
            <strong>{formData.fromVersion}</strong> 이상 ~{' '}
            <strong>{formData.toVersion}</strong> 이하 버전의 모든 DB 변경사항이
            포함된 패치가 생성됩니다.
          </p>
        </div>
      )}
    </FormSheet>
  )
}
