/**
 * Custom Patch Create Form Component
 * 커스텀 패치 생성 폼 컴포넌트 (FormSheet 기반)
 *
 * 표준(PatchCreateForm) 과 동일한 정책:
 *  - 빌드 파일 포함 토글 default ON
 *  - from/to 모두 선택된 시점부터 picker 영역 노출
 *  - 자동으로 모두 최신 빌드 preselect (computeAutoPreselect)
 *  - WEB / ENGINE 의 자동 선택 빌드 (최신) read-only 표시
 *  - 패치 생성 진행 중 ServerProgressView 로 폼 입력 영역 대체
 */

import { useEffect } from 'react'

import { AlertTriangle, ArrowRight, GitBranch, type LucideIcon } from 'lucide-react'

import type {
  BuildSelection,
  CustomPatchSite,
  CustomPatchVersion,
} from '@/entities/patches/patch'
import { useBuildsInRange } from '@/entities/releases/release'
import { SiteSelect } from '@/entities/sites'

import type { ProgressResponse } from '@/shared/api/progress/types'
import { usePermission } from '@/shared/lib/hooks/use-permission'
import { compareVersions } from '@/shared/lib/utils/version'
import { Combobox } from '@/shared/ui/combobox'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ServerProgressView } from '@/shared/ui/server-progress-view'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import { BuildPickerSection, computeAutoPreselect } from './BuildPickerSection'
import { findUnapprovedInRange, formatVersionLabel } from '../lib/helpers'

import type { CustomPatchCreateFormData } from '../model/types'

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

interface CustomPatchCreateFormProps {
  isOpen: boolean
  formData: CustomPatchCreateFormData
  sites: CustomPatchSite[]
  versions: CustomPatchVersion[]
  isSitesLoading: boolean
  isVersionsLoading: boolean
  isSubmitting: boolean
  /** 진행도 polling 결과 — isSubmitting 일 때만 의미 */
  progress?: ProgressResponse | null
  onFormDataChange: (data: CustomPatchCreateFormData) => void
  onSubmit: () => void
  onClose: () => void
  /** 페이지 헤더와 동일한 아이콘 */
  icon?: LucideIcon
}

export function CustomPatchCreateForm({
  isOpen,
  formData,
  sites,
  versions,
  isSitesLoading,
  isVersionsLoading,
  isSubmitting,
  progress,
  onFormDataChange,
  onSubmit,
  onClose,
  icon: PageIcon = GitBranch,
}: CustomPatchCreateFormProps) {

  const { canCreatePatchWithUnapproved } = usePermission()

  // 미승인 버전은 권한이 있을 때만 고를 수 있다. 없으면 아예 목록에서 제외.
  const selectableVersions = canCreatePatchWithUnapproved
    ? versions
    : versions.filter((v) => v.isApproved)
  const fromVersionOptions = selectableVersions
  const filteredToVersions = selectableVersions.filter(
    (v) => !v.isBaseVersion && formData.fromVersion && compareVersions(v.version, formData.fromVersion) > 0,
  )

  // 구간 내 미승인 버전. 중간 버전은 어느 콤보박스에도 나타나지 않으므로 별도로 안내한다.
  const unapprovedInRange = findUnapprovedInRange(
    versions,
    formData.fromVersion,
    formData.toVersion,
  )

  const findVersionId = (versionStr: string): number | null =>
    selectableVersions.find((v) => v.version === versionStr)?.versionId ?? null

  const handleFromVersionChange = (value: string) => {
    const fromVersionId = findVersionId(value)
    const clearTo =
      formData.toVersion && compareVersions(value, formData.toVersion) >= 0
        ? { toVersion: '', toVersionId: null }
        : { toVersion: formData.toVersion, toVersionId: formData.toVersionId }
    onFormDataChange({
      ...formData,
      fromVersion: value,
      fromVersionId,
      ...clearTo,
      // from/to 변경 시 picker 선택은 비우되 토글 ON 은 유지 (default ON 정책)
      buildSelection: { enabled: true, web: null, engines: [] },
    })
  }

  const handleToVersionChange = (value: string) => {
    onFormDataChange({
      ...formData,
      toVersion: value,
      toVersionId: findVersionId(value),
      buildSelection: { enabled: true, web: null, engines: [] },
    })
  }

  // builds-in-range 쿼리 — siteId 동봉
  const buildsQuery = useBuildsInRange(
    formData.projectId || null,
    formData.fromVersionId ?? null,
    formData.toVersionId ?? null,
    formData.siteId,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildsQuery.data])

  const selectedSite = sites.find((c) => c.siteId === formData.siteId)
  const fullBaseVersion = versions.find((v) => v.isBaseVersion)?.version || ''
  const standardVersion = fullBaseVersion.includes('-')
    ? fullBaseVersion.split('-')[0]
    : fullBaseVersion

  const getFullVersionName = (version: string) => {
    if (!standardVersion || !selectedSite?.siteCode) return version
    if (version === standardVersion) return version
    if (version.includes(`-${selectedSite.siteCode}.`)) return version
    return `${standardVersion}-${selectedSite.siteCode}.${version}`
  }

  const submitDisabled =
    !formData.siteId || !formData.fromVersion || !formData.toVersion

  return (
    <FormSheet
        open={isOpen}
        icon={PageIcon}
        title="커스텀 패치 생성"
        description={
          isSubmitting
            ? '진행 중인 작업이 끝날 때까지 잠시만 기다려 주세요.'
            : '사이트의 커스텀 버전 범위 내 모든 변경사항이 하나의 패치 파일로 생성됩니다.'
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
            {/* 사이트 — 담당자는 백엔드가 현재 로그인 사용자로 자동 설정 */}
            <div className="space-y-2">
              <Label required>사이트</Label>
              <SiteSelect
                sites={sites}
                value={selectedSite?.siteCode ?? ''}
                onChange={(_value, site) => {
                  onFormDataChange({
                    ...formData,
                    siteId: site?.siteId ?? null,
                    fromVersion: '',
                    toVersion: '',
                    fromVersionId: null,
                    toVersionId: null,
                    buildSelection: { enabled: true, web: null, engines: [] },
                  })
                }}
                placeholder="사이트 선택"
                disabled={isSitesLoading}
              />
              {isSitesLoading && (
                <TypographyMuted>사이트 목록을 불러오는 중...</TypographyMuted>
              )}
              {!isSitesLoading && sites.length === 0 && (
                <TypographyMuted>커스텀 버전이 있는 사이트가 없습니다.</TypographyMuted>
              )}
            </div>

            {/* 버전 선택 */}
            <div className="space-y-2">
              <Label required>버전 범위</Label>
              <div className="flex items-center gap-3">
                <Combobox
                  options={fromVersionOptions.map((v) => ({
                    value: v.version,
                    label: v.isBaseVersion
                      ? `${v.version} (베이스)`
                      : formatVersionLabel(v.version, v.isApproved),
                  }))}
                  value={formData.fromVersion}
                  onValueChange={handleFromVersionChange}
                  placeholder="시작 버전"
                  searchPlaceholder="버전 검색..."
                  disabled={
                    isVersionsLoading || !formData.siteId || fromVersionOptions.length === 0
                  }
                  className="flex-1"
                />
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Combobox
                  options={filteredToVersions.map((v) => ({
                    value: v.version,
                    label: formatVersionLabel(v.version, v.isApproved),
                  }))}
                  value={formData.toVersion}
                  onValueChange={handleToVersionChange}
                  placeholder="종료 버전"
                  searchPlaceholder="버전 검색..."
                  disabled={isVersionsLoading || !formData.siteId || !formData.fromVersion}
                  className="flex-1"
                />
              </div>
              {formData.siteId && isVersionsLoading && (
                <TypographyMuted>버전 목록을 불러오는 중...</TypographyMuted>
              )}
              {formData.siteId && !isVersionsLoading && selectableVersions.length === 0 && (
                <TypographyMuted>선택 가능한 버전이 없습니다.</TypographyMuted>
              )}
            </div>

            {/* 미승인 포함 경고 — 구간 중간의 미승인은 콤보박스 라벨로 드러나지 않으므로 별도 안내 */}
            {unapprovedInRange.length > 0 && (
              <div className="flex items-start gap-1.5 rounded-lg bg-yellow-500/10 p-3 text-xs text-yellow-700 dark:text-yellow-500">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  이 범위에는 미승인 버전(
                  <strong>{unapprovedInRange.map((v) => v.version).join(', ')}</strong>
                  )이 포함됩니다. 내부 검증용 패치로 생성되며 고객사 배포용이 아닙니다.
                </span>
              </div>
            )}

            {/* 패치명 */}
            <div className="space-y-2">
              <Label>패치명</Label>
              <Input
                value={formData.patchName}
                onChange={(e) => onFormDataChange({ ...formData, patchName: e.target.value })}
                placeholder="미입력 시 자동 생성 (e.g. siteCode_260511)"
                maxLength={100}
              />
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

            {/* 빌드 파일 포함 토글 + BuildPickerSection. from/to 모두 선택된 시점부터 표시 */}
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
            {formData.siteId && formData.fromVersion && formData.toVersion && (
              <div className="p-4 bg-primary/20 rounded-lg space-y-2">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {getFullVersionName(formData.fromVersion)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <strong className="text-primary">
                    {getFullVersionName(formData.toVersion)}
                  </strong>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  위 버전 범위 내 모든 변경사항이 포함된 패치가 생성됩니다.
                </p>
              </div>
            )}
          </>
        )}
      </FormSheet>
  )
}
