import { useState, useMemo } from 'react'

import { useMutation } from '@tanstack/react-query'
import { Info, Tag, ChevronRight, Pencil, type LucideIcon } from 'lucide-react'

import { releaseApi } from '@/entities/releases/release'

import { useServerProgress } from '@/shared/api'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { generateProgressId } from '@/shared/lib/progress/generateProgressId'
import { cn } from '@/shared/lib/utils'
import { useProjectStore } from '@/shared/store'
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
import { Textarea } from '@/shared/ui/textarea'

/** 버전 생성 5단계 라벨 */
const VERSION_CREATE_STEPS = [
  'ZIP 압축 해제',
  'ZIP 구조 검증',
  '버전 디렉토리 생성',
  '파일 복사 / DB 저장',
  '마무리 정리',
] as const

interface VersionCreateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  /** 최신 버전 정보 */
  latestVersion?: string
  /** 페이지 헤더와 동일한 아이콘 */
  icon?: LucideIcon
}

type VersionBumpType = 'major' | 'minor' | 'patch'

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024 // 10GB

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

export function VersionCreateForm({ open, onOpenChange, onSuccess, latestVersion, icon: PageIcon = Tag }: VersionCreateFormProps) {
  const projectId = useProjectStore((state) => state.projectId)
  const [version, setVersion] = useState('')
  const [bumpType, setBumpType] = useState<VersionBumpType>('patch')
  const [isManualInput, setIsManualInput] = useState(false)
  const [comment, setComment] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()
  /** 업로드 phase 진행 정보 (null=비활성) */
  const [uploadProgress, setUploadProgress] = useState<UploadProgressInfo | null>(null)
  /** 서버 진행도 polling 용 ID */
  const [activeProgressId, setActiveProgressId] = useState<string | null>(null)

  // 서버 처리 단계 진행도 polling
  const progressQuery = useServerProgress(activeProgressId, activeProgressId !== null)

  // 자동 계산된 버전
  const calculatedVersion = useMemo(() => {
    if (!latestVersion) return ''
    return bumpVersion(latestVersion, bumpType)
  }, [latestVersion, bumpType])

  // 실제 사용될 버전 (수동 입력 모드면 version, 아니면 calculatedVersion)
  const effectiveVersion = isManualInput ? version : calculatedVersion

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

      await releaseApi.createVersion(projectId, effectiveVersion, comment, file!, progressHandler, progressId)
    },
    onSuccess: () => {
      // 완료 후 0.7초 여유를 두고 progressId 초기화 (completed=true polling 수신 보장)
      setTimeout(() => setActiveProgressId(null), 700)
      toast({
        title: '버전 생성 완료',
        description: `버전 ${effectiveVersion}이(가) 성공적으로 생성되었습니다.`,
      })
      // handleClose 는 isPending 가드에 걸린다 — onSuccess 콜백 시점엔 mutation 이
      // 아직 pending 상태라 sheet 가 닫히지 않으므로 가드 없는 resetAndClose 를 쓴다
      resetAndClose()
      onSuccess()
    },
    onError: (error) => {
      setActiveProgressId(null)
      setUploadProgress(null)
      toast({
        title: '버전 생성 실패',
        description: error instanceof Error ? error.message : '버전 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const resetAndClose = () => {
    setVersion('')
    setBumpType('patch')
    setIsManualInput(false)
    setComment('')
    setFile(null)
    setUploadProgress(null)
    setActiveProgressId(null)
    onOpenChange(false)
  }

  // 사용자 조작(X/취소)용 — 업로드 중에는 닫기 방지
  const handleClose = () => {
    if (createMutation.isPending) return
    resetAndClose()
  }

  const handleSubmit = () => {
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
      title="버전 생성"
      description={
        isProcessing
          ? '파일을 업로드하고 서버에서 처리 중입니다. 잠시만 기다려 주세요.'
          : '새로운 릴리즈 버전을 생성합니다.'
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
          title="버전 생성 중"
          completedTitle="버전 생성 완료"
          steps={VERSION_CREATE_STEPS}
          uploadProgress={uploadProgress}
        />
      ) : (
      <>
      {/* 버전 선택 영역 */}
      <div className="space-y-3">
        <Label required>버전</Label>

        {latestVersion && !isManualInput ? (
          <div className="rounded-lg border bg-card p-4 space-y-4">

            {/* 버전 타입 선택 버튼 */}
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

            {/* 새 버전 표시 */}
            <div className="flex items-center justify-center gap-3 py-2 bg-muted/50 rounded-md">
              <span className="text-muted-foreground">{latestVersion}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold text-primary">{calculatedVersion}</span>
            </div>
          </div>
        ) : (
          <Input
            id="version"
            placeholder="e.g. 1.0.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            required
          />
        )}

        {/* 직접 입력 토글 */}
        {latestVersion && (
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => {
              setIsManualInput(!isManualInput)
              if (!isManualInput) {
                setVersion(calculatedVersion)
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
      </>
      )}
    </FormSheet>
  )
}
