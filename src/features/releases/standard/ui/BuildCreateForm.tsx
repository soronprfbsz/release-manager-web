import { useEffect, useState } from 'react'

import { Hammer, Info } from 'lucide-react'

import { useCreateBuild } from '@/entities/releases/release'

import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { FileDropzone } from '@/shared/ui/file-dropzone'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

interface BuildCreateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  baseVersionId: number
  baseVersion: string
  onSuccess?: () => void
}

/**
 * 오늘 날짜를 yyMMdd 정수로 반환 (예: 260427).
 * 서버 기본값과 동일한 포맷.
 */
function todayYyMmDd(): number {
  const d = new Date()
  const yy = d.getFullYear() % 100
  const mm = d.getMonth() + 1
  const dd = d.getDate()
  return yy * 10000 + mm * 100 + dd
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
  const [buildVersionInput, setBuildVersionInput] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadCompleted, setUploadCompleted] = useState(false)

  const createBuild = useCreateBuild()

  // open 시 오늘 날짜로 자동 prefill
  useEffect(() => {
    if (open) {
      setBuildVersionInput(String(todayYyMmDd()))
    }
  }, [open])

  const resetForm = () => {
    setComment('')
    setBuildVersionInput('')
    setSelectedFile(null)
    setIsUploading(false)
    setUploadCompleted(false)
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

    // buildVersion 입력값 검증 (비어있으면 서버가 채움, 입력했으면 양의 정수여야 함)
    let buildVersion: number | undefined = undefined
    const trimmed = buildVersionInput.trim()
    if (trimmed) {
      const parsed = Number(trimmed)
      if (!Number.isInteger(parsed) || parsed <= 0) {
        toast({
          title: '빌드 버전 오류',
          description: '빌드 버전은 양의 정수여야 합니다 (예: 260427).',
          variant: 'destructive',
        })
        return
      }
      buildVersion = parsed
    }

    setIsUploading(true)
    setUploadCompleted(false)
    if (selectedFile) {
      startTransfer(selectedFile.name, 'upload')
    }

    try {
      const response = await createBuild.mutateAsync({
        baseVersionId,
        comment,
        buildVersion,
        file: selectedFile ?? undefined,
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
              교체하는 경우 사용합니다 (예: 1.1.0.260427).
            </li>
            <li>
              ZIP 파일은{' '}
              <strong className="text-foreground">루트에 web/, engine/, etc/ 만</strong>{' '}
              허용됩니다 (대소문자 구분).
            </li>
            <li>
              빌드 버전을 비워두면 오늘 날짜(yyMMdd)로 자동 채움. 같은 base 에 동일 버전이 이미
              있으면 +1 자동 증가됩니다.
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

  return (
    <FormSheet
      open={open}
      icon={Hammer}
      iconClassName="text-blue-500"
      title="빌드 생성"
      description={
        <>
          버전 <strong>{baseVersion}</strong>의 빌드를 생성합니다.
        </>
      }
      submitLabel="빌드 생성"
      isSubmitting={isUploading}
      submitDisabled={!comment.trim()}
      onSubmit={handleSubmit}
      onClose={handleClose}
      width="w-[500px] sm:max-w-[500px]"
      headerContent={headerContent}
    >
      {/* 대상 버전 & 빌드 버전 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>대상 버전</Label>
          <div className="flex items-center p-3 bg-muted/50 rounded-md h-10">
            <span className="font-medium">{baseVersion}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="buildVersion">빌드 버전</Label>
          <Input
            id="buildVersion"
            type="number"
            inputMode="numeric"
            placeholder="예: 260427"
            value={buildVersionInput}
            onChange={(e) => setBuildVersionInput(e.target.value)}
            disabled={isUploading}
          />
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
          hint="ZIP 파일만 지원. 루트에 web/, engine/, etc/ 만 허용"
        />
      </div>
    </FormSheet>
  )
}
