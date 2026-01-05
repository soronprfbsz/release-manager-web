import { useState, useRef } from 'react'

import { Upload, FileArchive, X, Flame, Loader2, AlertTriangle } from 'lucide-react'

import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { formatFileSize } from '@/shared/lib/utils/format'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Textarea } from '@/shared/ui/textarea'

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { handleProgress, startTransfer, startServerProcessing, completeTransfer, resetTransfer } = useFileTransferProgress()
  
  const [comment, setComment] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadCompleted, setUploadCompleted] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const resetForm = () => {
    setComment('')
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

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: '파일 형식 오류',
        description: 'ZIP 파일만 업로드할 수 있습니다.',
        variant: 'destructive',
      })
      return
    }
    setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClickUploadArea = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            핫픽스 생성
          </SheetTitle>
          <SheetDescription>
            버전 <strong>{hotfixBaseVersion}</strong>의 핫픽스를 생성합니다.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          {/* 핫픽스 안내 */}
          <div className="mb-5 p-3 rounded-md border border-yellow-500/50 bg-yellow-500/10">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-semibold text-yellow-700 dark:text-yellow-400">핫픽스 안내</p>
                <ul className="mt-1.5 ml-4 list-disc space-y-0.5 text-muted-foreground">
                  <li>핫픽스는 <strong className="text-foreground">고객사의 버전 변경 없이 특정 내용만을 패치</strong>하고 싶을 때 사용하는 기능입니다.</li>
                  <li>가급적 <strong className="text-foreground">핫픽스 대신 패치 관리 기능을 통한 패치 방법을 권장합니다.</strong> 버전업을 거부하는 고객사 등 특수한 경우에만 사용해주세요.</li>                  
                  <li>핫픽스 내용은 <strong className="text-foreground">패치 생성 시 포함되지 않습니다.</strong> 핫픽스 내용이 <strong className="text-foreground">패치 관리에 반영 되어야 한다면, 
                  해당 내용이 포함 된 릴리즈 버전을 생성</strong>해 주세요.</li>                  
                  
                </ul>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 대상 버전 표시 */}
            <div className="space-y-2">
              <Label>대상 버전</Label>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-medium">{hotfixBaseVersion}</span>
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
                핫픽스 파일 (ZIP) <span className="text-destructive">*</span>
              </Label>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                  transition-colors
                  ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                  ${isUploading ? 'pointer-events-none opacity-50' : ''}
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClickUploadArea}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileInputChange}
                  disabled={isUploading}
                />
                
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileArchive className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-2"
                      onClick={handleRemoveFile}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">클릭하거나 파일을 드래그하세요</p>
                      <p className="text-xs text-muted-foreground">ZIP 파일만 지원됩니다</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={!comment.trim() || !selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  '핫픽스 생성'
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

