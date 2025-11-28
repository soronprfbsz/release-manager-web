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
import { useToast } from '@/shared/lib/hooks/use-toast'
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

  const createMutation = useMutation({
    mutationFn: () => releaseApi.createVersion(version, comment, file!),
    onSuccess: () => {
      toast({
        title: '버전 생성 완료',
        description: `버전 ${version}이(가) 성공적으로 생성되었습니다.`,
      })
      handleClose()
      onSuccess()
    },
    onError: (error) => {
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

      const maxSize = 50 * 1024 * 1024 // 50MB
      if (selectedFile.size > maxSize) {
        toast({
          title: '파일 크기 초과',
          description: '파일 크기는 50MB를 초과할 수 없습니다.',
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

      const maxSize = 50 * 1024 * 1024 // 50MB
      if (droppedFile.size > maxSize) {
        toast({
          title: '파일 크기 초과',
          description: '파일 크기는 50MB를 초과할 수 없습니다.',
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
                <PopoverContent className="w-96" align="start">
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-foreground">
                      ZIP 파일 구조
                    </p>
                    <div className="text-muted-foreground space-y-1">
                      <p>아래와 같은 폴더 구조로 ZIP 파일을 생성해주세요:</p>
                      <div className="font-mono text-xs bg-muted rounded border p-2 mt-2">
                        <div>📁 cratedb/</div>
                        <div className="ml-4">📄 1.patch_cratedb_ddl.sql</div>
                        <div>📁 mariadb/</div>
                        <div className="ml-4">📄 1.patch_mariadb_ddl.sql</div>
                        <div className="ml-4">📄 2.patch_mariadb_view.sql</div>
                        <div className="ml-4">📄 ...</div>
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground">
                        💡 버전으로 생성할 파일 및 폴더를 모두 선택 → zip로 압축 → 버전 파일에 업로드
                      </p>
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
                        최대 파일 크기: 50MB
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
