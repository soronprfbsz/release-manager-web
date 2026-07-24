import { useState, useMemo } from 'react'

import { useMutation } from '@tanstack/react-query'
import { Info, Tag, ChevronRight, Pencil, type LucideIcon } from 'lucide-react'

import { releaseApi, useStandardVersionList, useAllCustomReleaseTree } from '@/entities/releases/release'
import { SiteSelect, useSites, type Site } from '@/entities/sites/site'

import { useServerProgress } from '@/shared/api'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { generateProgressId } from '@/shared/lib/progress/generateProgressId'
import { cn } from '@/shared/lib/utils'
import { findLatestVersionString } from '@/shared/lib/utils/version'
import { useProjectStore } from '@/shared/store'
import { Combobox } from '@/shared/ui/combobox'
import { FileDropzone } from '@/shared/ui/file-dropzone'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import type { UploadProgressInfo } from '@/shared/ui/server-progress-view'
import { ServerProgressView } from '@/shared/ui/server-progress-view'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

/** 커스텀 버전 생성 5단계 라벨 */
const VERSION_CREATE_STEPS = [
  'ZIP 압축 해제',
  'ZIP 구조 검증',
  '버전 디렉토리 생성',
  '파일 복사 / DB 저장',
  '마무리 정리',
] as const

interface CustomVersionCreateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  /** 페이지 헤더와 동일한 아이콘 */
  icon?: LucideIcon
}

type VersionBumpType = 'major' | 'minor' | 'patch'

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024 // 10GB
const DEFAULT_VERSION = '1.0.0'

/** 버전 문자열 파싱 */
function parseVersion(version: string): { major: number; minor: number; patch: number } | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) return null
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  }
}

/** 커스텀 버전에서 커스텀 버전 부분만 추출 (예: 1.1.0-siteB.1.0.0 -> 1.0.0) */
function extractCustomVersionPart(fullVersion: string): string | null {
  // 형식: {표준본버전}-{사이트 코드}.{커스텀버전} (예: 1.1.0-siteB.1.0.0)
  // 마지막 버전 패턴(X.Y.Z)을 찾아서 추출
  const match = fullVersion.match(/(\d+\.\d+\.\d+)$/)
  return match ? match[1] : null
}

/** 버전 증가 */
function bumpVersion(version: string, type: VersionBumpType): string {
  const parsed = parseVersion(version)
  if (!parsed) return ''

  switch (type) {
    case 'major':
      return `${parsed.major + 1}.0.0`
    case 'minor':
      return `${parsed.major}.${parsed.minor + 1}.0`
    case 'patch':
      return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`
  }
}

export function CustomVersionCreateForm({ open, onOpenChange, onSuccess, icon: PageIcon = Tag }: CustomVersionCreateFormProps) {
  const projectId = useProjectStore((state) => state.projectId)
  const [siteId, setSiteId] = useState<number | null>(null)
  const [customBaseVersionId, setCustomBaseVersionId] = useState<number | null>(null)
  const [customVersion, setCustomVersion] = useState('')
  const [bumpType, setBumpType] = useState<VersionBumpType>('patch')
  const [isManualInput, setIsManualInput] = useState(false)
  const [comment, setComment] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isApproved, setIsApproved] = useState(false)
  const { toast } = useToast()
  /** 업로드 phase 진행 정보 (null=비활성) */
  const [uploadProgress, setUploadProgress] = useState<UploadProgressInfo | null>(null)
  /** 서버 진행도 polling 용 ID */
  const [activeProgressId, setActiveProgressId] = useState<string | null>(null)

  // 서버 처리 단계 진행도 polling
  const progressQuery = useServerProgress(activeProgressId, activeProgressId !== null)

  // 사이트 목록 조회 (활성화된 사이트만)
  const { data: sitesData } = useSites({ isActive: true, size: 1000 })
  const sites = sitesData?.content || []

  // 표준본 버전 목록 조회 (baseVersion 선택용)
  const { data: standardVersions = [] } = useStandardVersionList(projectId)

  // 커스텀 릴리즈 트리 조회 (사이트별 버전 존재 여부 확인용)
  const { data: customTreeData } = useAllCustomReleaseTree(projectId)

  // 선택된 사이트 정보
  const selectedSite = useMemo(() => {
    return sites.find(c => c.siteId === siteId)
  }, [sites, siteId])

  // 선택된 사이트의 최초 버전 생성 여부 확인
  const isFirstVersionForSite = useMemo(() => {
    if (!selectedSite || !customTreeData?.sites) return false
    const siteNode = customTreeData.sites.find(c => c.siteCode === selectedSite.siteCode)
    // 사이트 노드가 없거나 버전 그룹이 없으면 최초 버전
    return !siteNode || siteNode.majorMinorGroups.length === 0
  }, [selectedSite, customTreeData])

  // 선택된 사이트의 최신 버전 문자열
  const latestVersionForSite = useMemo(() => {
    if (!selectedSite || !customTreeData?.sites) return null
    const siteNode = customTreeData.sites.find(c => c.siteCode === selectedSite.siteCode)
    if (!siteNode) return null
    return findLatestVersionString(siteNode.majorMinorGroups)
  }, [selectedSite, customTreeData])

  // 커스텀 버전 부분만 추출 (예: 1.1.0-siteB.1.0.0 -> 1.0.0)
  const currentCustomVersion = useMemo(() => {
    if (!latestVersionForSite) return null
    return extractCustomVersionPart(latestVersionForSite)
  }, [latestVersionForSite])

  // 선택된 사이트의 customBaseVersion 조회 (기존 버전이 있는 경우)
  const existingCustomBaseVersion = useMemo(() => {
    if (!selectedSite || !customTreeData?.sites) return null
    const siteNode = customTreeData.sites.find(c => c.siteCode === selectedSite.siteCode)
    return siteNode?.customBaseVersion || null
  }, [selectedSite, customTreeData])

  // 선택된 표준본 버전 문자열 (최초 버전 생성 시)
  const selectedStandardVersion = useMemo(() => {
    if (!customBaseVersionId) return null
    return standardVersions.find(sv => sv.versionId === customBaseVersionId)?.version || null
  }, [customBaseVersionId, standardVersions])

  // 실제 사용할 baseVersion (기존 것 또는 새로 선택한 것)
  const effectiveBaseVersion = existingCustomBaseVersion || selectedStandardVersion

  // 풀네임 커스텀 버전 생성: {baseVersion}-{siteCode}.{customVersion}
  const getFullVersionName = (version: string) => {
    if (!effectiveBaseVersion || !selectedSite?.siteCode) return version
    return `${effectiveBaseVersion}-${selectedSite.siteCode}.${version}`
  }

  // 자동 계산된 버전
  const calculatedVersion = useMemo(() => {
    if (!siteId) return ''
    // 버전이 없는 경우 (최초 버전) 기본값 1.0.0
    if (!latestVersionForSite || !currentCustomVersion) return DEFAULT_VERSION
    return bumpVersion(currentCustomVersion, bumpType)
  }, [siteId, latestVersionForSite, currentCustomVersion, bumpType])

  // 실제 사용될 버전 (수동 입력 모드면 customVersion, 아니면 calculatedVersion)
  const effectiveVersion = isManualInput ? customVersion : calculatedVersion

  // 버전 타입 버튼 스타일
  const getButtonStyle = (type: VersionBumpType) => {
    const isSelected = bumpType === type && !isManualInput
    return cn(
      'flex-1 py-2 rounded-lg text-sm font-medium',
      'cursor-pointer',
      isSelected
        ? 'bg-primary text-primary-foreground border-primary'
        : 'bg-background hover:bg-accent border-border hover:border-primary/50'
    )
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      // 업로드 시작: uploadProgress 초기화
      setUploadProgress({ loaded: 0, total: 0, percent: 0 })

      // 서버 처리 단계 polling 시작용 ID 생성
      const progressId = generateProgressId()
      setActiveProgressId(progressId)

      const progressHandler = (progressEvent: { loaded: number; total?: number }) => {
        const loaded = progressEvent.loaded
        const total = progressEvent.total ?? 0
        const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0
        setUploadProgress({ loaded, total, percent })
      }

      await releaseApi.createCustomVersion(
        projectId,
        siteId!,
        effectiveVersion,
        comment,
        file!,
        isApproved,
        isFirstVersionForSite && customBaseVersionId ? customBaseVersionId : undefined,
        progressHandler,
        progressId
      )
    },
    onSuccess: () => {
      // 완료 후 0.7초 여유를 두고 progressId 초기화
      setTimeout(() => setActiveProgressId(null), 700)
      toast({
        title: '커스텀 버전 생성 완료',
        description: `버전 ${getFullVersionName(effectiveVersion)}이(가) 성공적으로 생성되었습니다.`,
      })
      handleClose()
      onSuccess()
    },
    onError: (error) => {
      setActiveProgressId(null)
      setUploadProgress(null)
      toast({
        title: '커스텀 버전 생성 실패',
        description: error instanceof Error ? error.message : '버전 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const handleClose = () => {
    if (createMutation.isPending) return
    setSiteId(null)
    setCustomBaseVersionId(null)
    setCustomVersion('')
    setBumpType('patch')
    setIsManualInput(false)
    setComment('')
    setFile(null)
    setIsApproved(false)
    setUploadProgress(null)
    setActiveProgressId(null)
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!siteId) {
      toast({
        title: '입력 오류',
        description: '사이트를 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (isFirstVersionForSite && !customBaseVersionId) {
      toast({
        title: '입력 오류',
        description: '최초 버전 생성 시 표준본 버전(Base Version)을 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!effectiveVersion.trim()) {
      toast({
        title: '입력 오류',
        description: '버전을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: '입력 오류',
        description: '코멘트를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!file) {
      toast({
        title: '입력 오류',
        description: '패치 파일을 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    createMutation.mutate()
  }

  const handleFileError = (message: string) => {
    toast({
      title: '파일 오류',
      description: message,
      variant: 'destructive',
    })
  }

  // 파일 구조 안내 배너
  const headerContent = (
    <div className="flex items-center gap-2 mb-5">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Info className="h-4 w-4" />
            <span className="underline decoration-dotted">버전 파일 생성 방법</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[440px]" align="start">
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground">버전 파일 생성 방법</p>
            <div className="text-muted-foreground space-y-3">
              <div className="space-y-1">
                <p className="text-xs">
                  버전에는 <strong className="text-foreground">db 패치 sql</strong> 과
                  {' '}<strong className="text-foreground">수동 패치용 파일</strong> 을 등록합니다.
                </p>
                <p className="text-xs">
                  빌드 산출물 (<span className="font-mono">web: war, webobjects</span> /{' '}
                  <span className="font-mono">engine: 바이너리</span>) 은
                  {' '}<strong className="text-foreground">빌드 버전</strong> 으로 등록하세요.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-medium text-foreground text-xs">예시 폴더 구조</p>
                <div className="font-mono text-xs bg-muted rounded border p-2">
                  <div>📁 database/   <span className="text-muted-foreground">← (db patch)</span></div>
                  <div className="ml-4">📁 MARIADB/</div>
                  <div className="ml-8">📄 1.patch_mariadb_xxx.sql</div>
                  <div className="ml-4">📁 CRATEDB/</div>
                  <div className="ml-8">📄 1.patch_cratedb_xxx.sql</div>
                  <div>📁 web/   <span className="text-muted-foreground">← (빌드파일 외 패치 파일)</span></div>
                  <div className="ml-4">📄 context_xml_patch.sh</div>
                  <div>📁 engine/   <span className="text-muted-foreground">← (빌드파일 외 패치 파일)</span></div>
                  <div className="ml-4">📄 nc_conf.conf</div>
                  <div className="ml-4">📄 NMS_COMMON.conf</div>
                </div>
              </div>

              <div className="bg-accent/40 border border-accent rounded p-2 text-xs space-y-1">
                <span className="text-foreground">⚠️ 폴더 규칙</span>
                <p className="text-muted-foreground">• 루트는 <span className="font-mono">database/</span>, <span className="font-mono">web/</span>, <span className="font-mono">engine/</span>, <span className="font-mono">etc/</span> 만 허용</p>
                <p className="text-muted-foreground">
                  • 빌드 산출물 (war, webobjects.tar.gz, 엔진 바이너리) 은 여기 <strong>아님</strong> — 빌드 버전으로
                </p>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )

  // 업로드 시작 시점부터 진행 뷰 표시 (createMutation.isPending 전체)
  const isProcessing = createMutation.isPending

  return (
    <FormSheet
      open={open}
      icon={PageIcon}
      title="커스텀 버전 생성"
      description={
        isProcessing
          ? '파일을 업로드하고 서버에서 처리 중입니다. 잠시만 기다려 주세요.'
          : '사이트별 커스텀 릴리즈 버전을 생성합니다.'
      }
      submitLabel="생성"
      submitIcon={Tag}
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit}
      onClose={handleClose}
      width="w-[500px] sm:max-w-[500px]"
      headerContent={isProcessing ? undefined : headerContent}
    >
      {isProcessing ? (
        <ServerProgressView
          progress={progressQuery.data ?? null}
          title="커스텀 버전 생성 중"
          completedTitle="커스텀 버전 생성 완료"
          steps={VERSION_CREATE_STEPS}
          uploadProgress={uploadProgress}
        />
      ) : (
      <>
      {/* 사이트 선택 */}
      <div className="space-y-2">
        <Label htmlFor="siteId" required>
          사이트
        </Label>
        <SiteSelect
          sites={sites}
          value={sites.find((s: Site) => s.siteId === siteId)?.siteCode ?? ''}
          onChange={(_value, site) => {
            setSiteId(site?.siteId ?? null)
            setCustomBaseVersionId(null) // 사이트 변경 시 customBaseVersionId 초기화
            setBumpType('patch') // 사이트 변경 시 버전 타입 초기화
            setIsManualInput(false) // 사이트 변경 시 수동 입력 모드 해제
            setCustomVersion('') // 사이트 변경 시 버전 초기화
          }}
          placeholder="사이트를 선택하세요"
        />
      </div>

      {/* 표준본 버전 선택 (최초 버전 생성 시에만 표시) */}
      {siteId && isFirstVersionForSite && (
        <div className="space-y-2">
          <Label htmlFor="customBaseVersionId" required>
            표준본 버전 (Base Version)
          </Label>
          <Combobox
            options={standardVersions.map((sv) => ({
              value: String(sv.versionId),
              label: `${sv.version}${!sv.isApproved ? ' (승인되지 않음)' : ''}`,
            }))}
            value={customBaseVersionId ? String(customBaseVersionId) : ''}
            onValueChange={(value) => setCustomBaseVersionId(value ? Number(value) : null)}
            placeholder="기준이 될 표준본 버전을 선택하세요"
            searchPlaceholder="표준본 버전 검색..."
          />
          <TypographyMuted className="text-xs">
            사이트별 최초 커스텀 버전 생성 시 기준이 될 표준본 버전을 선택해야 합니다.
          </TypographyMuted>
        </div>
      )}

      {/* 버전 선택 영역 */}
      <div className="space-y-3">
        <Label required>버전</Label>

        {siteId && !isManualInput ? (
          <div className="rounded-lg border bg-card p-4 space-y-4">
            {/* 버전 타입 선택 버튼 (최초 버전이 아닌 경우에만 표시) */}
            {currentCustomVersion && (
              <div className="flex gap-2">
                <button
                  type="button"
                  className={getButtonStyle('major')}
                  onClick={() => setBumpType('major')}
                >
                  <div className="text-center">
                    <div className="font-semibold">MAJOR</div>
                    <div className="text-[11px] opacity-70 mt-0.5">핵심 변경</div>
                  </div>
                </button>
                <button
                  type="button"
                  className={getButtonStyle('minor')}
                  onClick={() => setBumpType('minor')}
                >
                  <div className="text-center">
                    <div className="font-semibold">MINOR</div>
                    <div className="text-[11px] opacity-70 mt-0.5">주요 변경</div>
                  </div>
                </button>
                <button
                  type="button"
                  className={getButtonStyle('patch')}
                  onClick={() => setBumpType('patch')}
                >
                  <div className="text-center">
                    <div className="font-semibold">PATCH</div>
                    <div className="text-[11px] opacity-70 mt-0.5">단순 변경</div>
                  </div>
                </button>
              </div>
            )}

            {/* 새 버전 표시 */}
            <div className="flex items-center justify-center gap-3 py-2 bg-muted/50 rounded-md">
              {currentCustomVersion ? (
                <>
                  <span className="text-muted-foreground text-sm">{getFullVersionName(currentCustomVersion)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-primary text-sm">{getFullVersionName(calculatedVersion)}</span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground text-sm">최초 버전</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-primary text-sm">{getFullVersionName(calculatedVersion)}</span>
                </>
              )}
            </div>
          </div>
        ) : siteId ? (
          <Input
            id="customVersion"
            placeholder="e.g. 1.0.0"
            value={customVersion}
            onChange={(e) => setCustomVersion(e.target.value)}
            required
          />
        ) : (
          <Input
            id="customVersion"
            placeholder="사이트를 먼저 선택하세요"
            disabled
          />
        )}

        {/* 직접 입력 토글 */}
        {siteId && (
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => {
              setIsManualInput(!isManualInput)
              if (!isManualInput) {
                setCustomVersion(calculatedVersion)
              }
            }}
          >
            <Pencil className="h-3 w-3" />
            {isManualInput ? '자동 입력' : '직접 입력'}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment" required>
          코멘트
        </Label>
        <Textarea
          id="comment"
          placeholder="버전에 대한 설명을 입력하세요"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label required>버전 파일</Label>
        <FileDropzone
          file={file}
          onFileChange={setFile}
          accept={['.zip']}
          maxSize={MAX_FILE_SIZE}
          onError={handleFileError}
          disabled={createMutation.isPending}
          heightClass="h-32"
          hint="최대 파일 크기: 10GB"
        />
      </div>

      {/* 승인된 상태로 생성 */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor="isApproved" className="cursor-pointer font-medium">
            승인된 상태로 생성
          </Label>
          <TypographyMuted className="text-xs">
            활성화 시 승인된 상태로 버전이 생성됩니다.
          </TypographyMuted>
        </div>
        <Switch
          id="isApproved"
          checked={isApproved}
          onCheckedChange={setIsApproved}
        />
      </div>
      </>
      )}
    </FormSheet>
  )
}
