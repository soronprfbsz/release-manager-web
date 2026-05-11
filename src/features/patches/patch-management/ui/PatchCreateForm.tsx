/**
 * Patch Create Form Component
 * 패치 생성 폼 컴포넌트
 */

import { useEffect } from 'react'

import { ArrowRight, Tag, type LucideIcon } from 'lucide-react'

import { useBuildsInRange } from '@/entities/releases/release'
import type { Customer, Account } from '@/entities/operations'
import type { BuildSelection } from '@/entities/patches/patch'

import type { ProgressResponse } from '@/shared/api/progress/types'
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
import { ServerProgressView } from '@/shared/ui/server-progress-view'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { PatchCreateFormData, VersionOption } from '../model/types'
import { getVersionIdFromOption } from '../lib/helpers'
import { BuildPickerSection, computeAutoPreselect } from './BuildPickerSection'

/** 패치 생성 8단계 라벨 — ServerProgressView 체크리스트 미리보기용 */
const PATCH_STEPS = [
  '버전 범위 검증',
  '출력 디렉토리 생성',
  'DB 누적 변경 파일 복사',
  'WEB / ENGINE 빌드 파일 복사',
  '빌드 공유 자산 동반',
  '패치 스크립트 생성',
  'README / 빌드 메타 생성',
  'DB 메타 저장',
] as const

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
  /** 진행도 polling 결과 — isSubmitting 일 때만 의미 있음. null/undefined 면 메시지 비표시 */
  progress?: ProgressResponse | null
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
  progress,
  onFormDataChange,
  onSubmit,
  onClose,
  icon: PageIcon = Tag,
}: PatchCreateFormProps) {

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
      // from/to 변경 시 picker 선택은 비우되 토글 ON 은 유지 — default ON 정책
      buildSelection: { enabled: true, web: null, engines: [] },
    })
  }

  const handleToVersionChange = (value: string) => {
    const toVersionId = getVersionIdFromOption(versionOptions, value)
    onFormDataChange({
      ...formData,
      toVersion: value,
      toVersionId,
      // from/to 변경 시 picker 선택은 비우되 토글 ON 은 유지 — default ON 정책
      buildSelection: { enabled: true, web: null, engines: [] },
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

  // 빌드 데이터 로드 시 자동 preselect (항상 최신). 빌드 후보가 없으면 enabled=false.
  useEffect(() => {
    if (!buildsQuery.data) return
    const data = buildsQuery.data
    const hasBuilds = data.web.length > 0 || data.engines.length > 0
    const selection: BuildSelection = hasBuilds
      ? computeAutoPreselect(data)
      : { enabled: false, web: null, engines: [] }
    onFormDataChange({ ...formData, buildSelection: selection })
    // formData / onFormDataChange 는 의도적으로 제외 — buildsQuery.data 변경 시 1회만 자동 preselect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildsQuery.data])

  // 클라이언트 검증 — 같은 base 면 빌드라도 포함되어야 의미 있음
  const sameBase =
    formData.fromVersionId != null &&
    formData.fromVersionId === formData.toVersionId
  const sel = formData.buildSelection
  const pickerEmpty =
    !sel || (sel.web == null && (!sel.engines || sel.engines.length === 0))
  const submitDisabled =
    !formData.fromVersion ||
    !formData.toVersion ||
    (sameBase && pickerEmpty)

  return (
    <FormSheet
      open={isOpen}
      icon={PageIcon}
      title="패치 생성"
      description={
        isSubmitting
          ? '진행 중인 작업이 끝날 때까지 잠시만 기다려 주세요.'
          : '선택한 버전 범위 내의 모든 변경사항이 하나의 패치 파일로 생성됩니다.'
      }
      submitLabel="패치 생성"
      submitIcon={PageIcon}
      isSubmitting={isSubmitting}
      submitDisabled={submitDisabled}
      onSubmit={onSubmit}
      onClose={onClose}
      width="w-[500px] sm:max-w-[500px]"
    >
      {isSubmitting ? (
        <ServerProgressView
          progress={progress}
          title="패치 생성 중"
          completedTitle="패치 생성 완료"
          steps={PATCH_STEPS}
        />
      ) : (
      <>
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
          placeholder="미입력 시 자동 생성 (e.g. customerA_260511, 고객사 미선택 시 undefined_260511)"
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

      {/* 빌드 파일 자동 포함 — from/to 모두 선택된 시점부터 표시. 빌드 후보 없으면 자연 생략. */}
      {formData.fromVersionId && formData.toVersionId && buildsQuery.data &&
        (buildsQuery.data.web.length > 0 || buildsQuery.data.engines.length > 0) && (
        <div className="flex flex-col gap-2">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="space-y-1">
              <Label className="font-medium">포함될 빌드 파일</Label>
              <TypographyMuted className="text-xs">
                선택된 버전 범위 내 WEB/ENGINE 카테고리의 최신 빌드파일을 포함합니다.
              </TypographyMuted>
            </div>
            <BuildPickerSection data={buildsQuery.data} />
          </div>
        </div>
      )}
      {formData.fromVersionId && formData.toVersionId && buildsQuery.isLoading && (
        <TypographyMuted className="text-xs">빌드 목록을 불러오는 중...</TypographyMuted>
      )}

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
      </>
      )}
    </FormSheet>
  )
}
