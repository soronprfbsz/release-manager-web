/**
 * Patch Create Form Component
 * 패치 생성 폼 컴포넌트
 */

import { useEffect, useMemo, useState } from 'react'

import { ArrowRight, Tag, type LucideIcon } from 'lucide-react'

import { useBuildsInRange } from '@/entities/releases/release'
import type { Customer, Account } from '@/entities/operations'
import type { BuildSelection } from '@/entities/patches/patch'

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

import type { PatchCreateFormData, VersionOption } from '../model/types'
import { getVersionIdFromOption, detectOutdatedSelections } from '../lib/helpers'
import { BuildPickerSection, computeAutoPreselect } from './BuildPickerSection'
import { OutdatedBuildsWarningDialog } from './OutdatedBuildsWarningDialog'

interface PatchCreateFormProps {
  isOpen: boolean
  formData: PatchCreateFormData
  /** 버전 문자열 목록 (Select 표시용) */
  versions: string[]
  /** 버전 ID 매핑 (builds-in-range 조회용, 선택 사항) */
  versionOptions?: VersionOption[]
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
  versionOptions = [],
  customers,
  accounts,
  isVersionsLoading,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onClose,
  icon: PageIcon = Tag,
}: PatchCreateFormProps) {
  const [warningOpen, setWarningOpen] = useState(false)

  const handleFromVersionChange = (value: string) => {
    const fromVersionId = getVersionIdFromOption(versionOptions, value)
    const toVersionCleared =
      formData.toVersion && value >= formData.toVersion ? '' : formData.toVersion
    onFormDataChange({
      ...formData,
      fromVersion: value,
      fromVersionId,
      toVersion: toVersionCleared,
      toVersionId: toVersionCleared
        ? getVersionIdFromOption(versionOptions, toVersionCleared)
        : null,
      buildSelection: null,
    })
  }

  const handleToVersionChange = (value: string) => {
    const toVersionId = getVersionIdFromOption(versionOptions, value)
    onFormDataChange({
      ...formData,
      toVersion: value,
      toVersionId,
      buildSelection: null,
    })
  }

  const filteredToVersions = versions.filter(
    (v) => formData.fromVersion && v >= formData.fromVersion
  )

  // builds-in-range 쿼리
  const buildsQuery = useBuildsInRange(
    formData.projectId || null,
    formData.fromVersionId ?? null,
    formData.toVersionId ?? null,
    formData.customerId ?? null,
  )

  const toggleEnabled = formData.buildSelection?.enabled ?? false

  const handleToggleEnabled = (next: boolean) => {
    if (!next) {
      onFormDataChange({
        ...formData,
        buildSelection: { enabled: false, web: null, engines: [] },
      })
      return
    }
    // 토글 ON → 자동 preselect (모두 최신)
    const data = buildsQuery.data
    const selection: BuildSelection = data
      ? computeAutoPreselect(data)
      : { enabled: true, web: null, engines: [] }
    onFormDataChange({ ...formData, buildSelection: { ...selection, enabled: true } })
  }

  // 토글 ON + data 로드 시 자동 preselect (모두 최신).
  // 이미 selection 이 채워져 있으면 사용자 선택을 보존.
  useEffect(() => {
    if (!toggleEnabled || !buildsQuery.data) return
    const sel = formData.buildSelection
    const isEmpty = !sel?.web && (sel?.engines?.length ?? 0) === 0
    if (!isEmpty) return
    const auto = computeAutoPreselect(buildsQuery.data)
    onFormDataChange({ ...formData, buildSelection: { ...auto, enabled: true } })
    // formData / onFormDataChange 는 의도적으로 제외 — buildsQuery.data 변경 시 1회만 자동 preselect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleEnabled, buildsQuery.data])

  // 구버전 빌드 선택 검출
  const outdatedSelections = useMemo(() => {
    if (!toggleEnabled || !buildsQuery.data || !formData.buildSelection) return []
    return detectOutdatedSelections(buildsQuery.data, formData.buildSelection)
  }, [toggleEnabled, buildsQuery.data, formData.buildSelection])

  // 패치 생성 버튼 클릭 처리 — 구버전 선택 시 경고 dialog 먼저
  const handleSubmitWithCheck = () => {
    if (outdatedSelections.length > 0) {
      setWarningOpen(true)
    } else {
      onSubmit()
    }
  }

  const handleWarningConfirm = () => {
    setWarningOpen(false)
    onSubmit()
  }

  const handleWarningCancel = () => {
    setWarningOpen(false)
  }

  // 클라이언트 검증
  const sameBase =
    formData.fromVersionId != null &&
    formData.fromVersionId === formData.toVersionId
  const sel = formData.buildSelection
  const pickerEmpty =
    !sel || (sel.web == null && (!sel.engines || sel.engines.length === 0))
  const submitDisabled =
    !formData.fromVersion ||
    !formData.toVersion ||
    (toggleEnabled && pickerEmpty) ||
    (sameBase && (!toggleEnabled || pickerEmpty))

  return (
    <>
      <OutdatedBuildsWarningDialog
        open={warningOpen}
        outdatedSelections={outdatedSelections}
        onConfirm={handleWarningConfirm}
        onCancel={handleWarningCancel}
      />
    <FormSheet
      open={isOpen}
      icon={PageIcon}
      title="패치 생성"
      description="선택한 버전 범위 내의 모든 변경사항이 하나의 패치 파일로 생성됩니다."
      submitLabel="패치 생성"
      submitIcon={PageIcon}
      isSubmitting={isSubmitting}
      submitDisabled={submitDisabled}
      onSubmit={handleSubmitWithCheck}
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
            onValueChange={handleToVersionChange}
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
        {/* 빌드 전용 인디케이터 */}
        {sameBase && (
          <p className="text-xs text-muted-foreground">
            빌드 전용 패치 — DB 스크립트 없이 빌드 파일만 생성됩니다
          </p>
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

      {/* 빌드 파일 포함 토글 + BuildPickerSection */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor="buildToggle" className="cursor-pointer font-medium">
              빌드 파일 포함
            </Label>
            <TypographyMuted className="text-xs">
              WEB/ENGINE 카테고리의 빌드 파일을 선택하여 포함합니다.
            </TypographyMuted>
          </div>
          <Switch
            id="buildToggle"
            checked={toggleEnabled}
            onCheckedChange={handleToggleEnabled}
            disabled={
              isSubmitting ||
              (buildsQuery.isLoading && !buildsQuery.data) ||
              (!formData.fromVersionId || !formData.toVersionId)
            }
          />
        </div>
        {toggleEnabled && buildsQuery.data && (
          <div className="rounded-lg border p-4">
            <BuildPickerSection
              data={buildsQuery.data}
              value={
                formData.buildSelection ?? { enabled: true, web: null, engines: [] }
              }
              onChange={(next) =>
                onFormDataChange({ ...formData, buildSelection: next })
              }
              disabled={isSubmitting}
            />
          </div>
        )}
        {toggleEnabled && buildsQuery.isLoading && (
          <TypographyMuted className="text-xs">빌드 목록을 불러오는 중...</TypographyMuted>
        )}
      </div>

      {/* 생성 정보 미리보기 */}
      {formData.fromVersion && formData.toVersion && (
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-primary">
            <strong>{formData.fromVersion}</strong> 이상 ~{' '}
            <strong>{formData.toVersion}</strong> 이하 버전의 모든 변경사항이
            포함된 패치가 생성됩니다.
          </p>
        </div>
      )}
    </FormSheet>
    </>
  )
}
