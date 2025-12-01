import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Upload, X, FileArchive, Info } from 'lucide-react'
import { releaseApi } from '@/entities/release'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Progress } from '@/shared/ui/progress'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'

interface VersionCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function VersionCreateDialog({ open, onOpenChange, onSuccess }: VersionCreateDialogProps) {
  const [version, setVersion] = useState('')
  const [comment, setComment] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { transferState, handleProgress, startTransfer, completeTransfer, resetTransfer } = useFileTransferProgress()

  const createMutation = useMutation({
    mutationFn: async () => {
      startTransfer()
      await releaseApi.createVersion(version, comment, file!, handleProgress)
      completeTransfer()
    },
    onSuccess: () => {
      toast({
        title: '버전 생성 완료',
        description: `버전 ${version}이(가) 성공적으로 생성되었습니다.`,
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
    setComment('')
    setFile(null)
    resetTransfer()
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!version.trim()) {
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

    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: '파일 형식 오류',
        description: 'ZIP 파일만 업로드 가능합니다.',
        variant: 'destructive',
      })
      return
    }

    createMutation.mutate()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.zip')) {
        toast({
          title: '파일 형식 오류',
          description: 'ZIP 파일만 업로드 가능합니다.',
          variant: 'destructive',
        })
        return
      }

      const maxSize = 1024 * 1024 * 1024 // 1GB
      if (selectedFile.size > maxSize) {
        toast({
          title: '파일 크기 초과',
          description: '파일 크기는 1GB를 초과할 수 없습니다.',
          variant: 'destructive',
        })
        return
      }

      setFile(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      if (!droppedFile.name.toLowerCase().endsWith('.zip')) {
        toast({
          title: '파일 형식 오류',
          description: 'ZIP 파일만 업로드 가능합니다.',
          variant: 'destructive',
        })
        return
      }

      const maxSize = 1024 * 1024 * 1024 // 1GB
      if (droppedFile.size > maxSize) {
        toast({
          title: '파일 크기 초과',
          description: '파일 크기는 1GB를 초과할 수 없습니다.',
          variant: 'destructive',
        })
        return
      }

      setFile(droppedFile)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClickUploadArea = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>버전 생성</DialogTitle>
            <DialogDescription>
              새로운 릴리즈 버전을 생성합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 파일 구조 안내 - 호버 시 표시 */}
            <div className="flex items-center gap-2">
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
                        <p className="font-medium text-foreground text-xs">1단계: 폴더 구조 생성</p>
                        <p className="text-xs">아래와 같은 폴더 구조로 파일을 준비하세요:</p>
                        <div className="font-mono text-xs bg-muted rounded border p-2">
                          <div>📁 database/</div>
                          <div className="ml-4">📁 mariadb/</div>
                          <div className="ml-8">📄 1.patch_mariadb_ddl.sql</div>
                          <div className="ml-8">📄 2.patch_mariadb_view.sql</div>
                          <div className="ml-8">📄 3.patch_mariadb_데이터코드.sql</div>
                          <div className="ml-8">📄 ...</div>
                          <div className="ml-4">📁 cratedb/</div>
                          <div className="ml-8">📄 1.patch_cratedb_ddl.sql</div>
                          <div>📁 web/</div>
                          <div className="ml-4">📁 build/</div>
                          <div className="ml-8">📄 app.war</div>
                          <div>📁 engine/</div>
                          <div className="ml-4">📁 build/</div>
                          <div className="ml-8">📄 engine.jar</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium text-foreground text-xs">2단계: ZIP 압축</p>
                        <p className="text-xs">
                          <strong>database, web, engine 등의 최상위 폴더를 선택</strong>하여 ZIP으로 압축
                        </p>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 text-xs">
                          <span className="text-yellow-600 dark:text-yellow-500">⚠️ 주의:</span> 최상위 카테고리 폴더(database, web, engine, install)를 직접 선택하여 압축해야 합니다.
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium text-foreground text-xs">폴더 구조 규칙</p>
                        <div className="text-xs space-y-0.5">
                          <p className="font-mono bg-muted px-2 py-1 rounded">
                            {'{카테고리}'}/{'{하위카테고리}'}/{'{파일}'}
                          </p>
                          <p className="text-muted-foreground">
                            • 카테고리: database, web, engine, install
                          </p>
                          <p className="text-muted-foreground">
                            • 하위카테고리: mariadb, cratedb, build 등
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="version">
                버전 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="version"
                placeholder="예: 1.1.3"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="comment">
                코멘트 <span className="text-destructive">*</span>
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

            <div className="grid gap-2">
              <Label htmlFor="patchFiles">
                버전 파일 <span className="text-destructive">*</span>
              </Label>
              <input
                ref={fileInputRef}
                id="patchFiles"
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <div
                  onClick={handleClickUploadArea}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-colors duration-200
                    ${isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`
                      rounded-full p-3
                      ${isDragging ? 'bg-primary/10' : 'bg-muted'}
                    `}>
                      <Upload className={`h-6 w-6 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {isDragging ? '파일을 여기에 놓아주세요' : '파일을 여기에 끌어다 놓거나 클릭하여 선택하세요'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        최대 파일 크기: 1GB
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="rounded-md p-2 bg-primary/10">
                        <FileArchive className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 업로드 진행률 표시 */}
            {transferState.isTransferring && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">업로드 중...</span>
                  <span className="font-medium">{transferState.progress}%</span>
                </div>
                <Progress value={transferState.progress} />
                <div className="text-xs text-muted-foreground text-center">
                  {(transferState.loaded / (1024 * 1024)).toFixed(2)} MB / {(transferState.total / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
              취소
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
