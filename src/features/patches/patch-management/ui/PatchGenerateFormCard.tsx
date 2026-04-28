/**
 * Patch Generate Form Card Component
 * 패치 생성 폼 카드 컴포넌트
 */

import { ArrowRight, GitBranch, Layers, Loader2, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useBuildsInRange } from '@/entities/releases/release'
import type { Customer, Account } from '@/entities/operations'
import type { BuildSelection } from '@/entities/patches/patch'

import { ROUTES } from '@/shared/config/constants'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Combobox } from '@/shared/ui/combobox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { PatchCreateFormData, VersionOption } from '../model/types'
import { getVersionIdFromOption } from '../lib/helpers'
import { BuildPickerSection, computeAutoPreselect } from './BuildPickerSection'

type ReleaseType = 'STANDARD' | 'CUSTOM'

interface PatchGenerateFormCardProps {
  releaseType: ReleaseType
  formData: PatchCreateFormData
  versions: string[]
  /** 버전 ID 매핑 (builds-in-range 조회용, 선택 사항) */
  versionOptions?: VersionOption[]
  customers: Customer[]
  accounts: Account[]
  isVersionsLoading: boolean
  isSubmitting: boolean
  onReleaseTypeChange: (type: ReleaseType) => void
  onFormDataChange: (data: PatchCreateFormData) => void
  onSubmit: () => void
}

export function PatchGenerateFormCard({
  releaseType,
  formData,
  versions,
  versionOptions = [],
  customers,
  accounts,
  isVersionsLoading,
  isSubmitting,
  onReleaseTypeChange,
  onFormDataChange,
  onSubmit,
}: PatchGenerateFormCardProps) {
  const navigate = useNavigate()

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

  const handleCustomClick = () => {
    navigate(`${ROUTES.PATCHES}?tab=custom`)
  }

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
    const data = buildsQuery.data
    const selection: BuildSelection = data
      ? computeAutoPreselect(data)
      : { enabled: true, web: null, engines: [] }
    onFormDataChange({ ...formData, buildSelection: { ...selection, enabled: true } })
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
    isSubmitting ||
    (toggleEnabled && pickerEmpty) ||
    (sameBase && (!toggleEnabled || pickerEmpty))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          패치 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Release Type */}
        <div className="space-y-2">
          <Label>릴리즈 타입 *</Label>
          <div className="flex gap-2">
            <Button
              variant={releaseType === 'STANDARD' ? 'default' : 'outline'}
              onClick={() => {
                onReleaseTypeChange('STANDARD')
                onFormDataChange({ ...formData, fromVersion: '', toVersion: '' })
              }}
              className="flex-1"
            >
              <Package className="h-4 w-4 mr-2" />
              Standard
            </Button>
            <Button
              variant={releaseType === 'CUSTOM' ? 'default' : 'outline'}
              onClick={handleCustomClick}
              className="flex-1"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Custom
            </Button>
          </div>
        </div>

        {/* Version Selection */}
        <div className="space-y-2">
          <Label required>버전 범위</Label>
          <div className="flex items-center gap-3">
            <Combobox
              options={versions.map((v) => ({ value: v, label: v }))}
              value={formData.fromVersion}
              onValueChange={handleFromVersionChange}
              placeholder="시작 버전"
              searchPlaceholder="버전 검색..."
              disabled={isVersionsLoading || versions.length === 0}
              className="flex-1"
            />
            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Combobox
              options={filteredToVersions.map((v) => ({ value: v, label: v }))}
              value={formData.toVersion}
              onValueChange={handleToVersionChange}
              placeholder="종료 버전"
              searchPlaceholder="버전 검색..."
              disabled={isVersionsLoading || versions.length === 0 || !formData.fromVersion}
              className="flex-1"
            />
          </div>
          {isVersionsLoading && <TypographyMuted>버전 목록을 불러오는 중...</TypographyMuted>}
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

        {/* Customer */}
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
                customerCode: value === '__none__' || !value ? '' : value,
              })
            }
            placeholder="선택 안함"
            searchPlaceholder="고객사 검색..."
          />
        </div>

        {/* 담당자 */}
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
                assigneeId: value === '__none__' || !value ? null : Number(value),
              })
            }
            placeholder="선택 안함"
            searchPlaceholder="담당자 검색..."
          />
        </div>

        {/* Patch Name */}
        <div className="space-y-2">
          <Label>패치명</Label>
          <Input
            value={formData.patchName}
            onChange={(e) => onFormDataChange({ ...formData, patchName: e.target.value })}
            placeholder="미입력 시 자동 생성 (e.g. 20260102_1.0.0_1.1.0)"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>설명</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            placeholder="패치에 대한 설명을 입력하세요 (e.g. 특정 버그 수정, 기능 추가 등)"
            className="min-h-[80px]"
          />
        </div>

        {/* 빌드 파일 포함 토글 + BuildPickerSection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="buildToggleCard" className="cursor-pointer font-medium">
                빌드 파일 포함
              </Label>
              <TypographyMuted className="text-xs">
                WEB/ENGINE 카테고리의 빌드 파일을 선택하여 포함합니다.
              </TypographyMuted>
            </div>
            <Switch
              id="buildToggleCard"
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
            <TypographyMuted className="text-xs">
              빌드 목록을 불러오는 중...
            </TypographyMuted>
          )}
        </div>

        {/* Info Message */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <TypographyMuted>
            선택한 버전 범위 내의 모든 변경사항(MariaDB, CrateDB)이 하나의 패치 파일로
            생성됩니다.
          </TypographyMuted>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={submitDisabled}
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

export type { ReleaseType }
