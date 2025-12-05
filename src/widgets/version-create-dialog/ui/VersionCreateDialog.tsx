import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Upload, X, FileArchive, Info, Loader2, Package } from 'lucide-react'
import { releaseApi } from '@/entities/release'
import { codeApi, CODE_TYPE } from '@/entities/code'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
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
  const [releaseCategory, setReleaseCategory] = useState<string>('PATCH')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { handleProgress, startTransfer, startServerProcessing, completeTransfer, resetTransfer } = useFileTransferProgress()
  const [uploadCompleted, setUploadCompleted] = useState(false)

  // 릴리즈 카테고리 목록 조회
  const { data: releaseCategoryOptions = [] } = useQuery({
    queryKey: ['codes', CODE_TYPE.RELEASE_CATEGORY],
    queryFn: () => codeApi.getCodesByType(CODE_TYPE.RELEASE_CATEGORY),
  })

  // 첫 번째 옵션을 기본값으로 설정
  useEffect(() => {
    if (releaseCategoryOptions.length > 0 && !releaseCategory) {
      setReleaseCategory(releaseCategoryOptions[0].value)
    }
  }, [releaseCategoryOptions, releaseCategory])

  const createMutation = useMutation({
    mutationFn: async () => {
      setUploadCompleted(false)
      startTransfer(file?.name, 'upload')

      // 진행률 핸들러 래퍼 - 100% 도달 시 서버 처리 단계로 전환
      const progressHandler = (progressEvent: { loaded: number; total?: number }) => {
        handleProgress(progressEvent)

        // 100%에 도달하면 서버 처리 단계로 전환
        if (progressEvent.total && progressEvent.loaded >= progressEvent.total && !uploadCompleted) {
          setUploadCompleted(true)
          // 약간의 지연 후 서버 처리 단계 표시 (토스트 업데이트 타이밍 조정)
          setTimeout(() => {
            startServerProcessing()
          }, 100)
        }
      }

      await releaseApi.createVersion(version, comment, releaseCategory, file!, progressHandler)
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
    setUploadCompleted(false)
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            버전 생성
          </SheetTitle>
          <SheetDescription>
            새로운 릴리즈 버전을 생성합니다.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="space-y-2">
              <Label htmlFor="version" required>
                버전
              </Label>
              <Input
                id="version"
                placeholder="예: 1.1.3"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
              />
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
              <Label htmlFor="patchFiles" required>
                버전 파일
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

            {/* 버튼 */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createMutation.isPending}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    생성
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
