/**
 * Patch Create Form Component
 * 패치 생성 폼 컴포넌트
 *
 * 폼 항목 순서: 사이트 → 버전 범위 → 설명 → 빌드 파일 picker → 미리보기
 * 사이트 선택 시 next-patch-range API 호출 → from/to 자동 채움
 */

import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'

import { ArrowRight, Info, Tag, type LucideIcon } from 'lucide-react'

import { usePatchNamePreview, type BuildSelection } from '@/entities/patches/patch'
import { useBuildsInRange } from '@/entities/releases/release'
import { SiteSelect, type Site } from '@/entities/sites'
import { useNextPatchRange } from '@/entities/sites/site-version'

import type { ProgressResponse } from '@/shared/api/progress/types'
import { compareVersions } from '@/shared/lib/utils/version'
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

import { BuildPickerSection, computeAutoPreselect } from './BuildPickerSection'
import { getVersionIdFromOption } from '../lib/helpers'

import type { PatchCreateFormData, VersionOption } from '../model/types'

/** 패치 생성 8단계 라벨 — ServerProgressView 체크리스트 미리보기용 */
const PATCH_STEPS = [
  '버전 범위 검증',
  '출력 디렉토리 생성',
  'DB 누적 변경 파일 복사',
  'WEB 빌드 파일 복사',
  'ENGINE 빌드 파일 범위 누적',
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
  sites: Site[]
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
  sites,
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

  // 현재 선택된 사이트 객체 — siteCode로 역참조
  const selectedSite = formData.siteCode
    ? sites.find((c) => c.siteCode === formData.siteCode) ?? null
    : null

  // 다음 패치 추천 범위 — 실제 사이트 선택 + 폼 열린 상태일 때만 fetch
  // isOpen 이 false 면 siteId/projectId 를 undefined 로 전달해 enabled=false 유도
  const { data: nextRange, isFetching: isRangeFetching } = useNextPatchRange(
    isOpen ? selectedSite?.siteId : undefined,
    isOpen ? (formData.projectId || undefined) : undefined,
  )

  /**
   * 사이트가 변경될 때마다 추천 범위로 from/to 자동 채움.
   * - 미선택: 채움 안 함, from/to 초기화
   * - 실제 사이트 선택 → nextRange 데이터 도착 시 덮어씀
   * siteId 를 dep 에 포함해 사이트가 바뀔 때만 트리거.
   */
  useEffect(() => {
    if (!isOpen) return

    if (!selectedSite) {
      // 미선택: from/to 초기화 — functional setter 로 stale 회피
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
  }, [selectedSite?.siteId, nextRange, versions.length])

  const handleFromVersionChange = (value: string) => {
    // Radix Select 알려진 버그 우회: 비동기로 옵션이 늦게 mount 되어 controlled
    // value 가 옵션에 없을 때 Radix 가 onValueChange("") 를 자체 호출하여 value 를
    // 빈 문자열로 reset 한다. 자동 채움 값이 즉시 사라지는 race 의 원인.
    // 사용자 의도와 무관한 spurious 빈값은 무시.
    if (!value) return
    onFormDataChange((prev) => {
      const fromVersionId = getVersionIdFromOption(versionOptions, value)
      // From == To 는 유효한 범위다 (해당 버전에 사후 추가된 빌드/파일 회수용).
      // From 이 To 를 넘어설 때만 To 를 비운다.
      const toVersionCleared =
        prev.toVersion && compareVersions(value, prev.toVersion) > 0 ? '' : prev.toVersion
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
  // 고르는 "최신" 을 빠르게 선택할 수 있게. (공유 compareVersions 로 정렬/필터 일원화)
  const sortedVersions = [...versions].sort((a, b) => compareVersions(b, a))
  // 끝 버전은 시작 버전 이상만. 문자열 비교 시 "1.1.10" < "1.1.8" 이 되어 최신(.10/.11)이
  // 누락되므로 반드시 semver 비교(compareVersions)를 사용한다.
  const filteredToVersions = sortedVersions.filter(
    (v) => formData.fromVersion && compareVersions(v, formData.fromVersion) >= 0
  )

  // builds-in-range 쿼리
  // 표준 패치의 빌드는 site=null(표준 빌드)이다. "사이트" 선택은 패치 태깅 / 추천 범위용일 뿐
  // 빌드 출처가 아니므로 빌드 조회에는 siteId 를 넘기지 않는다.
  // (넘기면 findBuildsInBaseRange 의 siteMatch 가 표준 빌드(site null)를 전부 배제하여
  //  web/engine 빌드가 패치에서 누락된다 — 사이트 선택 시 빌드 미포함 버그의 원인)
  const buildsQuery = useBuildsInRange(
    formData.projectId || null,
    formData.fromVersionId ?? null,
    formData.toVersionId ?? null,
    null,
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

  // 사이트 필수 — 비어있으면 제출 불가
  const siteChosen = formData.siteCode !== ''
  const submitDisabled =
    !formData.fromVersion ||
    !formData.toVersion ||
    !siteChosen

  // 자동 패치명 미리보기 — backend 호출로 충돌 검사까지 적용된 실 확정 이름
  const previewSiteCode = siteChosen ? formData.siteCode : undefined
  const { data: previewedName } = usePatchNamePreview(
    isOpen ? previewSiteCode : undefined,
    isOpen && siteChosen,
  )
  const computedPatchName = siteChosen ? (previewedName ?? null) : null

  /** 추천 범위 상태 안내 메시지 */
  const rangeHint = (() => {
    if (!selectedSite) return null
    if (isRangeFetching) return null

    if (!nextRange) return null

    if (nextRange.currentVersion === null) {
      // 패치 이력 없음 — 신규 사이트
      return { type: 'info' as const, text: '패치 이력 없음 — 초기 적용입니다.' }
    }
    if (nextRange.suggestedFromVersion === null) {
      // 사이트 버전이 등록된 최신 버전과 동일 — 추가로 적용할 신규 버전이 없는 상태.
      // 부정적 경고가 아닌 중립 안내로 표시한다.
      return { type: 'info' as const, text: `최신 상태 (${nextRange.currentVersion})` }
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
      {/* 1. 사이트 — 필수. 담당자는 백엔드가 현재 로그인 사용자로 자동 설정.
          사이트 선택 시 next-patch-range API 로 from/to 자동 추천. */}
      <div className="space-y-2">
        <Label required>사이트</Label>
        <SiteSelect
          sites={sites}
          value={formData.siteCode || ''}
          onChange={(value, site) =>
            onFormDataChange((prev) => ({
              ...prev,
              siteCode: value,
              // 사이트 변경 시 siteId 동기화
              siteId: site?.siteId ?? null,
            }))
          }
        />

        {/* 추천 범위 상태 안내 */}
        {isRangeFetching && selectedSite && (
          <TypographyMuted className="text-xs">버전 범위 확인 중...</TypographyMuted>
        )}
        {rangeHint && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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

      {/* 빌드 정보 + 패치명 preview — 버전 범위 + 사이트 모두 채워졌을 때만 표시 */}
      {formData.fromVersionId && formData.toVersionId && siteChosen && buildsQuery.data &&
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
      {formData.fromVersionId && formData.toVersionId && siteChosen && buildsQuery.isLoading && (
        <TypographyMuted className="text-xs">빌드 목록을 불러오는 중...</TypographyMuted>
      )}

      {/* 생성 정보 미리보기 (버전 범위 + 패치명) */}
      {formData.fromVersion && formData.toVersion && siteChosen && (
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
