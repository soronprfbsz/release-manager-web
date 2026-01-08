import { useState, useEffect, useMemo } from 'react'

import { useMutation } from '@tanstack/react-query'
import { Info, Tag, ChevronRight, Pencil, type LucideIcon } from 'lucide-react'

import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'
import { useProjectStore } from '@/shared/store'
import { releaseApi } from '@/entities/releases/release'

import { cn } from '@/shared/lib/utils'
import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { FileDropzone } from '@/shared/ui/file-dropzone'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
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
  const [releaseCategory, setReleaseCategory] = useState<string>('PATCH')
  const [file, setFile] = useState<File | null>(null)
  const [isApproved, setIsApproved] = useState(false)
  const { toast } = useToast()
  const { handleProgress, startTransfer, startServerProcessing, completeTransfer, resetTransfer } = useFileTransferProgress()
  const [uploadCompleted, setUploadCompleted] = useState(false)

  // 릴리즈 카테고리 목록 조회
  const { data: releaseCategoryOptions = [] } = useCodesByType(CODE_TYPE.RELEASE_CATEGORY)

  // 첫 번째 옵션을 기본값으로 설정
  useEffect(() => {
    if (releaseCategoryOptions.length > 0 && !releaseCategory) {
      setReleaseCategory(releaseCategoryOptions[0].value)
    }
  }, [releaseCategoryOptions, releaseCategory])

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
      setUploadCompleted(false)
      startTransfer(file?.name, 'upload')

      const progressHandler = (progressEvent: { loaded: number; total?: number }) => {
        handleProgress(progressEvent)

        if (progressEvent.total && progressEvent.loaded >= progressEvent.total && !uploadCompleted) {
          setUploadCompleted(true)
          setTimeout(() => {
            startServerProcessing()
          }, 100)
        }
      }

      await releaseApi.createVersion(projectId, effectiveVersion, comment, releaseCategory, file!, isApproved, progressHandler)
      completeTransfer()
    },
    onSuccess: () => {
      toast({
        title: '버전 생성 완료',
        description: `버전 ${effectiveVersion}이(가) 성공적으로 생성되었습니다.`,
      })
      handleClose()
      onSuccess()
    },
    onError: (error) => {
      resetTransfer()
      toast({
        title: '버전 생성 실패',
        description: error instanceof Error ? error.message : '버전 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const handleClose = () => {
    setVersion('')
    setBumpType('patch')
    setIsManualInput(false)
    setComment('')
    setFile(null)
    setIsApproved(false)
    setUploadCompleted(false)
    resetTransfer()
    onOpenChange(false)
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
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Info className="h-4 w-4" />
            <span className="underline decoration-dotted">버전 파일 생성 방법</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[440px]" align="start">
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground">
              버전 파일 생성 방법
            </p>
            <div className="text-muted-foreground space-y-2">
              <div className="space-y-1">
                <p className="font-medium text-foreground text-xs">1단계: 파일 준비</p>
                <p className="text-xs">아래와 같은 폴더 구조로 파일을 준비하세요:</p>
                <div className="font-mono text-xs bg-muted rounded border p-2">
                  <div>📁 database/</div>
                  <div className="ml-4">📁 MARIADB/</div>
                  <div className="ml-8">📄 1.patch_mariadb_테스트1.sql</div>
                  <div className="ml-8">📄 2.patch_mariadb_테스트2.sql</div>
                  <div className="ml-8">📄 ...</div>
                  <div className="ml-4">📁 CRATEDB/</div>
                  <div className="ml-8">📄 ...</div>
                  <div>📁 web/</div>
                  <div className="ml-4">📄 nms_solution-2.0.0.240102-1-STD.war</div>
                  <div className="ml-4">📄 nms_solution-2.0.0.240102-1-STD.tar</div>
                  <div>📁 engine/</div>
                  <div className="ml-4">📁 NC_SMS/</div>
                  <div className="ml-8">📄 ...</div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-medium text-foreground text-xs">2단계: ZIP 압축</p>
                <p className="text-xs">
                  위 구조로 구성된 <strong>폴더들을 선택</strong>하여 ZIP으로 압축
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 text-xs space-y-2">
                  <span className="text-yellow-600 dark:text-yellow-500">⚠️폴더 구조 규칙</span>
                  <p className="font-mono bg-muted px-2 py-1 rounded">
                    {'{카테고리}'}/{'{하위카테고리}'}/{'{파일}'}
                  </p>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">
                      • 카테고리: database, web, engine
                    </p>
                    <p className="text-muted-foreground">
                      • 하위카테고리: MARIADB, CRATEDB, NC_SMS 등
                    </p>
                    <p className="text-muted-foreground">
                      • database 및 engine 이름은 반드시 대문자로 작성
                    </p>
                    <p className="text-muted-foreground ml-4">
                      mariadb<span className="text-red-500">(✗)</span> MARIADB<span className="text-green-500">(✓)</span> / Nc_Sms<span className="text-red-500">(✗)</span> NC_SMS<span className="text-green-500">(✓)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )

  return (
    <FormSheet
      open={open}
      icon={PageIcon}
      title="버전 생성"
      description="새로운 릴리즈 버전을 생성합니다."
      submitLabel="생성"
      submitIcon={Tag}
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit}
      onClose={handleClose}
      width="w-[500px] sm:max-w-[500px]"
      headerContent={headerContent}
    >
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
                  <div className="text-[11px] opacity-70 mt-0.5">주요 변경</div>
                </div>
              </button>
              <button
                type="button"
                className={getButtonStyle('minor')}
                onClick={() => setBumpType('minor')}
              >
                <div className="text-center">
                  <div className="font-semibold">MINOR</div>
                  <div className="text-[11px] opacity-70 mt-0.5">기능 추가</div>
                </div>
              </button>
              <button
                type="button"
                className={getButtonStyle('patch')}
                onClick={() => setBumpType('patch')}
              >
                <div className="text-center">
                  <div className="font-semibold">PATCH</div>
                  <div className="text-[11px] opacity-70 mt-0.5">버그 수정</div>
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
        <Label htmlFor="releaseCategory" required>
          릴리즈 타입
        </Label>
        <Select
          value={releaseCategory}
          onValueChange={setReleaseCategory}
        >
          <SelectTrigger id="releaseCategory">
            <SelectValue placeholder="릴리즈 타입을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {releaseCategoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* 승인된 버전으로 생성 */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor="isApproved" className="cursor-pointer font-medium">
            승인된 버전으로 생성
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
    </FormSheet>
  )
}
