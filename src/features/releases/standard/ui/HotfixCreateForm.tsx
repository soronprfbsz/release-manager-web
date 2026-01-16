import { useState } from 'react'

import { Flame, AlertTriangle } from 'lucide-react'

import { useAccounts, type Account } from '@/entities/operations'

import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { Combobox } from '@/shared/ui/combobox'
import { FileDropzone } from '@/shared/ui/file-dropzone'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

interface HotfixCreateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  hotfixBaseVersionId: number
  hotfixBaseVersion: string
  onSuccess?: () => void
}

export function HotfixCreateForm({
  open,
  onOpenChange,
  projectId,
  hotfixBaseVersionId,
  hotfixBaseVersion,
  onSuccess,
}: HotfixCreateFormProps) {
  const { toast } = useToast()
  const { handleProgress, startTransfer, startServerProcessing, completeTransfer, resetTransfer } = useFileTransferProgress()

  const [comment, setComment] = useState('')
  const [assigneeId, setAssigneeId] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadCompleted, setUploadCompleted] = useState(false)
  const [isApproved, setIsApproved] = useState(false)

  // 담당자 목록 조회 (엔지니어만)
  const { data: accountsResponse } = useAccounts({ size: 10000, departmentType: 'ENGINEER' })
  const accounts = accountsResponse?.content ?? []

  const resetForm = () => {
    setComment('')
    setAssigneeId(null)
    setSelectedFile(null)
    setIsUploading(false)
    setUploadCompleted(false)
    setIsApproved(false)
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
        description: '코멘트를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!selectedFile) {
      toast({
        title: '파일 필요',
        description: '핫픽스 파일을 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    setUploadCompleted(false)
    startTransfer()

    try {
      // Dynamic import to avoid circular dependency
      const { releaseApi } = await import('@/entities/releases/release')

      await releaseApi.createHotfix(
        projectId,
        hotfixBaseVersionId,
        comment,
        selectedFile,
        assigneeId ?? undefined,
        isApproved || undefined,
        (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            handleProgress({ loaded: progressEvent.loaded, total: progressEvent.total })
            if (progress >= 100 && !uploadCompleted) {
              setUploadCompleted(true)
              startServerProcessing()
            }
          }
        }
      )

      completeTransfer()
      toast({
        title: '핫픽스 생성 완료',
        description: `${hotfixBaseVersion}의 핫픽스가 생성되었습니다.`,
      })

      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: '핫픽스 생성 실패',
        description: error instanceof Error ? error.message : '핫픽스 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
      resetTransfer()
    } finally {
      setIsUploading(false)
    }
  }

  // 핫픽스 안내 배너
  const headerContent = (
    <div className="mb-5 p-3 rounded-md border border-accent bg-accent/40">
      <div className="flex gap-2">
        <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-foreground">핫픽스 안내</p>
          <ul className="mt-1.5 ml-4 list-disc space-y-0.5 text-muted-foreground">
            <li>핫픽스는 <strong className="text-foreground">고객사의 버전 변경 없이 특정 내용만을 패치</strong>하고 싶을 때 사용하는 기능입니다.</li>
            <li>가급적 <strong className="text-foreground">핫픽스 보다는 패치 관리 기능을 통한 패치를 권장</strong>합니다. 버전 업데이트를 원치 않는 고객사 등 부득이한 경우에만 제한적으로 사용해주세요.</li>
            <li>핫픽스 내용은 <strong className="text-foreground">패치 생성 시 포함되지 않습니다.</strong> 핫픽스 내용이 <strong className="text-foreground">패치 관리에 반영 되어야 한다면,
              해당 내용이 포함 된 릴리즈 버전을 생성</strong>해 주세요.</li>
          </ul>
        </div>
      </div>
    </div>
  )

  return (
    <FormSheet
      open={open}
      icon={Flame}
      iconClassName="text-orange-500"
      title="핫픽스 생성"
      description={<>버전 <strong>{hotfixBaseVersion}</strong>의 핫픽스를 생성합니다.</>}
      submitLabel="핫픽스 생성"
      isSubmitting={isUploading}
      submitDisabled={!comment.trim() || !selectedFile}
      onSubmit={handleSubmit}
      onClose={handleClose}
      width="w-[500px] sm:max-w-[500px]"
      headerContent={headerContent}
    >
      {/* 대상 버전 & 담당자 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>대상 버전</Label>
          <div className="flex items-center p-3 bg-muted/50 rounded-md h-10">
            <span className="font-medium">{hotfixBaseVersion}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assigneeId">담당자</Label>
          <Combobox
            options={[
              { value: '__none__', label: '선택 안함' },
              ...accounts.map((a: Account) => ({
                value: String(a.accountId),
                label: `${a.accountName} (${a.departmentName || '부서 없음'})`,
              })),
            ]}
            value={assigneeId !== null ? String(assigneeId) : '__none__'}
            onValueChange={(value) =>
              setAssigneeId(value === '__none__' ? null : Number(value))
            }
            placeholder="선택 안함"
            searchPlaceholder="담당자 검색..."
            disabled={isUploading}
          />
        </div>
      </div>

      {/* 코멘트 */}
      <div className="space-y-2">
        <Label htmlFor="comment">
          코멘트 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="comment"
          placeholder="핫픽스에 대한 설명을 입력하세요"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isUploading}
          rows={3}
        />
      </div>

      {/* 파일 업로드 */}
      <div className="space-y-2">
        <Label>
          핫픽스 파일 <span className="text-destructive">*</span>
        </Label>
        <FileDropzone
          file={selectedFile}
          onFileChange={setSelectedFile}
          accept={['.zip']}
          onError={handleFileError}
          disabled={isUploading}
          heightClass="h-28"
          hint="ZIP 파일만 지원"
        />
      </div>

      {/* 승인된 상태로 생성 */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor="isApproved" className="cursor-pointer font-medium">
            승인된 상태로 생성
          </Label>
          <TypographyMuted className="text-xs">
            활성화 시 승인된 상태로 핫픽스가 생성됩니다.
          </TypographyMuted>
        </div>
        <Switch
          id="isApproved"
          checked={isApproved}
          onCheckedChange={setIsApproved}
          disabled={isUploading}
        />
      </div>
    </FormSheet>
  )
}
