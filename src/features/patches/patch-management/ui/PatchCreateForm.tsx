/**
 * Patch Create Form Component
 * 패치 생성 폼 컴포넌트
 *
 * 폼 항목 순서: 고객사 → 버전 범위 → 설명 → 빌드 파일 picker → 미리보기
 * 고객사 선택 시 next-patch-range API 호출 → from/to 자동 채움
 */

import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'

import { ArrowRight, Info, Tag, type LucideIcon } from 'lucide-react'

import { useBuildsInRange } from '@/entities/releases/release'
import type { Customer } from '@/entities/operations'
import { usePatchNamePreview, type BuildSelection } from '@/entities/patches/patch'
import { useNextPatchRange } from '@/entities/operations/customer-site-version'

import type { ProgressResponse } from '@/shared/api/progress/types'
import { Combobox } from '@/shared/ui/combobox'
import { FormSheet } from '@/shared/ui/form-sheet'
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
  isVersionsLoading: boolean
  isSubmitting: boolean
  /** 진행도 polling 결과 — isSubmitting 일 때만 의미 있음. null/undefined 면 메시지 비표시 */
  progress?: ProgressResponse | null
  /** React.Dispatch<SetStateAction> — functional setter 사용 (stale closure 회피). */
  onFormDataChange: Dispatch<SetStateAction<PatchCreateFormData>>
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
  isVersionsLoading,
  isSubmitting,
  progress,
  onFormDataChange,
  onSubmit,
  onClose,
  icon: PageIcon = Tag,
}: PatchCreateFormProps) {

  // 항상 최신 formData / onFormDataChange 를 가리키는 ref — useEffect 의 stale closure 회피
  // (dep 가 다른 비동기 응답일 때 effect 내부 spread 가 옛 formData 를 덮어쓰는 문제 방지)
  const formDataRef = useRef(formData)
  formDataRef.current = formData
  const onFormDataChangeRef = useRef(onFormDataChange)
  onFormDataChangeRef.current = onFormDataChange

  // 현재 선택된 고객사 객체 — customerCode로 역참조
  const selectedCustomer =
    formData.customerCode && formData.customerCode !== '__undefined__'
      ? customers.find((c) => c.customerCode === formData.customerCode) ?? null
      : null

  // 다음 패치 추천 범위 — 실제 고객사 선택 + 폼 열린 상태일 때만 fetch
  // isOpen 이 false 면 customerId/projectId 를 undefined 로 전달해 enabled=false 유도
  const { data: nextRange, isFetching: isRangeFetching } = useNextPatchRange(
    isOpen ? selectedCustomer?.customerId : undefined,
    isOpen ? (formData.projectId || undefined) : undefined,
  )

  /**
   * 고객사가 변경될 때마다 추천 범위로 from/to 자동 채움.
   * - "__undefined__" 또는 미선택: 채움 안 함, from/to 초기화
   * - 실제 고객사 선택 → nextRange 데이터 도착 시 덮어씀
   * customerId 를 dep 에 포함해 고객사가 바뀔 때만 트리거.
   */
  useEffect(() => {
    if (!isOpen) return

    if (!selectedCustomer) {
      // "없음" 또는 미선택: from/to 초기화 — functional setter 로 stale 회피
      onFormDataChangeRef.current((prev) => ({
        ...prev,
        fromVersion: '',
        fromVersionId: null,
        toVersion: '',
        toVersionId: null,
        buildSelection: { enabled: true, web: null, engines: [] },
      }))
      return
    }

    if (!nextRange) return

    // 추천 값이 있을 때만 채움 (null 이면 해당 필드는 그대로)
    const newFrom = nextRange.suggestedFromVersion ?? ''
    const newFromId = nextRange.suggestedFromVersionId ?? null
    const newTo = nextRange.suggestedToVersion ?? ''
    const newToId = nextRange.suggestedToVersionId ?? null

    onFormDataChangeRef.current((prev) => ({
      ...prev,
      fromVersion: newFrom,
      fromVersionId: newFromId,
      toVersion: newTo,
      toVersionId: newToId,
      buildSelection: { enabled: true, web: null, engines: [] },
    }))
    // versions.length 도 dep 에 포함 — tree fetch 가 nextRange 보다 늦게 도착하면
    // Select 옵션이 비어있는 상태에서 value 만 set 되어 placeholder 표시되던 문제 회피.
    // 옵션 도착 시점에 set 을 한 번 더 호출해 Radix Select 가 value 와 매칭하도록.
  }, [selectedCustomer?.customerId, nextRange, versions.length])

  const handleFromVersionChange = (value: string) => {
    // Radix Select 알려진 버그 우회: 비동기로 옵션이 늦게 mount 되어 controlled
    // value 가 옵션에 없을 때 Radix 가 onValueChange("") 를 자체 호출하여 value 를
    // 빈 문자열로 reset 한다. 자동 채움 값이 즉시 사라지는 race 의 원인.
    // 사용자 의도와 무관한 spurious 빈값은 무시.
    if (!value) return
    onFormDataChange((prev) => {
      const fromVersionId = getVersionIdFromOption(versionOptions, value)
      const toVersionCleared =
        prev.toVersion && value >= prev.toVersion ? '' : prev.toVersion
      return {
        ...prev,
        fromVersion: value,
        fromVersionId,
        toVersion: toVersionCleared,
        toVersionId: toVersionCleared
          ? getVersionIdFromOption(versionOptions, toVersionCleared)
          : null,
        buildSelection: { enabled: true, web: null, engines: [] },
      }
    })
  }

  const handleToVersionChange = (value: string) => {
    // Radix Select 알려진 버그 우회 — handleFromVersionChange 의 주석 참고
    if (!value) return
    onFormDataChange((prev) => ({
      ...prev,
      toVersion: value,
      toVersionId: getVersionIdFromOption(versionOptions, value),
      buildSelection: { enabled: true, web: null, engines: [] },
    }))
  }

  // 버전 옵션을 semver desc 로 정렬 — 최신 버전이 위에 노출되어 운영자가 흔히
  // 고르는 "최신" 을 빠르게 선택할 수 있게.
  const compareVersionDesc = (a: string, b: string) => {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)
    const len = Math.max(aParts.length, bParts.length)
    for (let i = 0; i < len; i++) {
      const ai = aParts[i] ?? 0
      const bi = bParts[i] ?? 0
      if (ai !== bi) return bi - ai
    }
    return 0
  }
  const sortedVersions = [...versions].sort(compareVersionDesc)
  const filteredToVersions = sortedVersions.filter(
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
  // functional setter 로 호출하여 stale formData 가 from/to 를 덮어쓰는 race 회피.
  useEffect(() => {
    if (!buildsQuery.data) return
    const data = buildsQuery.data
    const hasBuilds = data.web.length > 0 || data.engines.length > 0
    const selection: BuildSelection = hasBuilds
      ? computeAutoPreselect(data)
      : { enabled: false, web: null, engines: [] }
    onFormDataChangeRef.current((prev) => ({ ...prev, buildSelection: selection }))
  }, [buildsQuery.data])

  // 클라이언트 검증 — 같은 base 면 빌드라도 포함되어야 의미 있음
  const sameBase =
    formData.fromVersionId != null &&
    formData.fromVersionId === formData.toVersionId
  const sel = formData.buildSelection
  const pickerEmpty =
    !sel || (sel.web == null && (!sel.engines || sel.engines.length === 0))
  // customerCode 가 비어있으면 미선택. '__undefined__' 는 명시적 "없음" 선택.
  const customerChosen = formData.customerCode !== ''
  const submitDisabled =
    !formData.fromVersion ||
    !formData.toVersion ||
    !customerChosen ||
    (sameBase && pickerEmpty)

  // 자동 패치명 미리보기 — backend 호출로 충돌 검사까지 적용된 실 확정 이름
  // ("__undefined__" 는 backend 에 빈 값으로 전달되어 "undefined" prefix 로 처리)
  const previewCustomerCode = customerChosen
    ? (formData.customerCode === '__undefined__' ? '' : formData.customerCode)
    : undefined
  const { data: previewedName } = usePatchNamePreview(
    isOpen ? previewCustomerCode : undefined,
    isOpen && customerChosen,
  )
  const computedPatchName = customerChosen ? (previewedName ?? null) : null

  /** 추천 범위 상태 안내 메시지 */
  const rangeHint = (() => {
    if (!selectedCustomer) return null
    if (isRangeFetching) return null

    if (!nextRange) return null

    if (nextRange.currentVersion === null) {
      // 패치 이력 없음 — 신규 사이트
      return { type: 'info' as const, text: '패치 이력 없음 — 초기 적용입니다.' }
    }
    if (nextRange.suggestedFromVersion === null) {
      // 이미 최신 상태
      return { type: 'warning' as const, text: `최신 상태 (${nextRange.currentVersion}) — 적용할 패치 없음` }
    }
    // 정상 추천
    return {
      type: 'success' as const,
      text: `사이트 현재 버전: ${nextRange.currentVersion}`,
    }
  })()

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
      {/* 1. 고객사 — 필수. "없음" 선택 시 customerCode 'undefined' 로 처리됨.
          담당자는 백엔드가 현재 로그인 사용자로 자동 설정.
          고객사 선택 시 next-patch-range API 로 from/to 자동 추천. */}
      <div className="space-y-2">
        <Label required>고객사</Label>
        <Combobox
          options={[
            { value: '__undefined__', label: '없음' },
            ...customers.map((c) => ({
              value: c.customerCode,
              label: `${c.customerName} (${c.customerCode})`,
            })),
          ]}
          value={formData.customerCode || ''}
          onValueChange={(value) =>
            onFormDataChange((prev) => ({
              ...prev,
              customerCode: value,
              // 고객사 변경 시 customerId 동기화
              customerId:
                value === '__undefined__'
                  ? null
                  : (customers.find((c) => c.customerCode === value)?.customerId ?? null),
            }))
          }
          placeholder="고객사 선택..."
          searchPlaceholder="고객사 검색..."
        />

        {/* 추천 범위 상태 안내 */}
        {isRangeFetching && selectedCustomer && (
          <TypographyMuted className="text-xs">버전 범위 확인 중...</TypographyMuted>
        )}
        {rangeHint && (
          <div
            className={[
              'flex items-center gap-1.5 text-xs',
              rangeHint.type === 'warning'
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground',
            ].join(' ')}
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>{rangeHint.text}</span>
          </div>
        )}
      </div>

      {/* 2. 버전 선택 */}
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
              {sortedVersions.map((v) => (
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

      {/* 3. 설명 */}
      <div className="space-y-2">
        <Label>설명</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            onFormDataChange((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="패치에 대한 설명"
          className="min-h-[80px]"
        />
      </div>

      {/* 빌드 정보 + 패치명 preview — 버전 범위 + 고객사 모두 채워졌을 때만 표시 */}
      {formData.fromVersionId && formData.toVersionId && customerChosen && buildsQuery.data &&
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
      {formData.fromVersionId && formData.toVersionId && customerChosen && buildsQuery.isLoading && (
        <TypographyMuted className="text-xs">빌드 목록을 불러오는 중...</TypographyMuted>
      )}

      {/* 생성 정보 미리보기 (버전 범위 + 패치명) */}
      {formData.fromVersion && formData.toVersion && customerChosen && (
        <div className="p-4 bg-primary/10 rounded-lg space-y-2">
          <p className="text-sm text-primary">
            <strong>{formData.fromVersion}</strong> 이상 ~{' '}
            <strong>{formData.toVersion}</strong> 이하 버전의 모든 변경사항이
            포함된 패치가 생성됩니다.
          </p>
          {computedPatchName && (
            <p className="text-xs text-muted-foreground">
              패치명:{' '}
              <span className="font-mono text-foreground">{computedPatchName}</span>
            </p>
          )}
        </div>
      )}
      </>
      )}
    </FormSheet>
  )
}
