import { useState } from 'react'

import { Hammer, Info } from 'lucide-react'

import { useCreateBuild } from '@/entities/releases/release'

import { useServerProgress } from '@/shared/api'
import { generateProgressId } from '@/shared/lib/progress/generateProgressId'
import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { FileDropzone } from '@/shared/ui/file-dropzone'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Label } from '@/shared/ui/label'
import { ServerProgressView } from '@/shared/ui/server-progress-view'
import { Textarea } from '@/shared/ui/textarea'

/** 빌드 생성 단계 라벨 (ZIP 포함 시 4단계 / 미포함 시 2단계) */
const BUILD_STEPS_WITH_ZIP = [
  'ZIP 압축 해제',
  '구조 검증',
  '파일 복사 / DB 저장',
  '마무리 정리',
] as const

const BUILD_STEPS_NO_ZIP = [
  '빌드 행 생성',
  '마무리',
] as const

interface BuildCreateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  baseVersionId: number
  baseVersion: string
  onSuccess?: () => void
}

export function BuildCreateForm({
  open,
  onOpenChange,
  baseVersionId,
  baseVersion,
  onSuccess,
}: BuildCreateFormProps) {
  const { toast } = useToast()
  const {
    handleProgress,
    startTransfer,
    startServerProcessing,
    completeTransfer,
    resetTransfer,
  } = useFileTransferProgress()

  const [comment, setComment] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadCompleted, setUploadCompleted] = useState(false)
  /** 서버 진행도 polling 용 ID */
  const [activeProgressId, setActiveProgressId] = useState<string | null>(null)

  const createBuild = useCreateBuild()

  // 서버 처리 단계 진행도 polling
  const progressQuery = useServerProgress(activeProgressId, activeProgressId !== null)

  const resetForm = () => {
    setComment('')
    setSelectedFile(null)
    setIsUploading(false)
    setUploadCompleted(false)
    setActiveProgressId(null)
    resetTransfer()
  }

  const handleClose = () => {
    if (!isUploading) {
      resetForm()
      onOpenChange(false)
    }
  }

  const handleFileError = (message: string) => {
    toast({
      title: '파일 오류',
      description: message,
      variant: 'destructive',
    })
  }

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: '코멘트 필요',
        description: '빌드 노트를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    setUploadCompleted(false)
    if (selectedFile) {
      startTransfer(selectedFile.name, 'upload')
    }

    // 진행도 polling 용 ID 생성
    const progressId = generateProgressId()
    setActiveProgressId(progressId)

    try {
      const response = await createBuild.mutateAsync({
        baseVersionId,
        comment,
        file: selectedFile ?? undefined,
        progressId,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            handleProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
            })
            if (progress >= 100 && !uploadCompleted) {
              setUploadCompleted(true)
              startServerProcessing()
            }
          }
        },
      })

      completeTransfer()
      toast({
        title: '빌드 생성 완료',
        description: `${response.fullVersion} 빌드가 생성되었습니다 (파일 ${response.uploadedFileCount}개).`,
      })

      // 완료 후 0.7초 여유를 두고 progressId 초기화
      setTimeout(() => setActiveProgressId(null), 700)
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: '빌드 생성 실패',
        description:
          error instanceof Error
            ? error.message
            : '빌드 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
      setActiveProgressId(null)
      resetTransfer()
    } finally {
      setIsUploading(false)
    }
  }

  // 빌드 안내 배너
  const headerContent = (
    <div className="mb-5 p-3 rounded-md border border-accent bg-accent/40">
      <div className="flex gap-2">
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-foreground">빌드 안내</p>
          <ul className="mt-1.5 ml-4 list-disc space-y-0.5 text-muted-foreground">
            <li>
              빌드는{' '}
              <strong className="text-foreground">DB 변경 없이 WEB/ENGINE 산출물만</strong>{' '}
              교체하는 경우 사용합니다 (예: 1.1.0.260430-1).
            </li>
            <li>
              ZIP 파일은{' '}
              <strong className="text-foreground">루트에 web/, engine/ 만</strong>{' '}
              허용됩니다 (대소문자 구분).
            </li>
            <li>
              빌드 버전은{' '}
              <strong className="text-foreground">오늘 날짜(yyMMdd)-회차</strong>{' '}
              형태로 자동 부여됩니다. 같은 날 추가 빌드는 -2, -3 으로 회차가 증가합니다.
            </li>
            <li>
              <strong className="text-foreground">engine/ 하위는 엔진명 단일 실행 파일</strong>입니다 (예: engine/NC_SMS). 디렉터리로 감싸면 안 됩니다.
            </li>
            <li>
              빌드는{' '}
              <strong className="text-foreground">즉시 활성화</strong>되며 별도 승인 절차가 없습니다.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )

  // 서버 처리 단계가 시작됐을 때 ServerProgressView 표시
  const isServerProcessing = isUploading && !!activeProgressId

  return (
    <FormSheet
      open={open}
      icon={Hammer}
      iconClassName="text-blue-500"
      title="빌드 생성"
      description={
        isServerProcessing
          ? '서버에서 파일을 처리 중입니다. 잠시만 기다려 주세요.'
          : (
            <>
              버전 <strong>{baseVersion}</strong>의 빌드를 생성합니다.
            </>
          )
      }
      submitLabel="빌드 생성"
      isSubmitting={isUploading}
      submitDisabled={!comment.trim()}
      onSubmit={handleSubmit}
      onClose={handleClose}
      width="w-[500px] sm:max-w-[500px]"
      headerContent={isServerProcessing ? undefined : headerContent}
    >
      {isServerProcessing ? (
        <ServerProgressView
          progress={progressQuery.data ?? null}
          title="빌드 생성 중"
          completedTitle="빌드 생성 완료"
          steps={selectedFile ? BUILD_STEPS_WITH_ZIP : BUILD_STEPS_NO_ZIP}
        />
      ) : (
      <>
      {/* 대상 버전 */}
      <div className="space-y-2">
        <Label>대상 버전</Label>
        <div className="flex items-center p-3 bg-muted/50 rounded-md h-10">
          <span className="font-medium">{baseVersion}</span>
        </div>
      </div>

      {/* 코멘트 */}
      <div className="space-y-2">
        <Label htmlFor="comment">
          빌드 노트 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="comment"
          placeholder="빌드 변경 내역을 입력하세요"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isUploading}
          rows={3}
        />
      </div>

      {/* 파일 업로드 (선택) */}
      <div className="space-y-2">
        <Label>빌드 ZIP (선택)</Label>
        <FileDropzone
          file={selectedFile}
          onFileChange={setSelectedFile}
          accept={['.zip']}
          onError={handleFileError}
          disabled={isUploading}
          heightClass="h-28"
          hint="ZIP 파일만 지원. 루트에 web/, engine/ 만 허용"
        />
      </div>
      </>
      )}
    </FormSheet>
  )
}
