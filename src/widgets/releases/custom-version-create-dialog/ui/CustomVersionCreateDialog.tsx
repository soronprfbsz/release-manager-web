import { useState, useRef, useMemo } from 'react'

import { useMutation } from '@tanstack/react-query'
import { Upload, X, FileArchive, Info, Loader2, Tag } from 'lucide-react'

import { useCustomers, type Customer } from '@/entities/operations/customer'
import { useProjectStore } from '@/shared/store'
import { releaseApi, useStandardVersionList, useAllCustomReleaseTree } from '@/entities/releases/release'

import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Combobox } from '@/shared/ui/combobox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Textarea } from '@/shared/ui/textarea'
import { Checkbox } from '@/shared/ui/checkbox'

interface CustomVersionCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CustomVersionCreateDialog({ open, onOpenChange, onSuccess }: CustomVersionCreateDialogProps) {
  const projectId = useProjectStore((state) => state.projectId)
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [baseVersionId, setBaseVersionId] = useState<number | null>(null)
  const [customVersion, setCustomVersion] = useState('')
  const [comment, setComment] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isApproved, setIsApproved] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { handleProgress, startTransfer, startServerProcessing, completeTransfer, resetTransfer } = useFileTransferProgress()
  const [uploadCompleted, setUploadCompleted] = useState(false)

  // 고객사 목록 조회 (활성화된 고객사만)
  const { data: customersData } = useCustomers({ isActive: true, size: 1000 })
  const customers = customersData?.content || []

  // 표준본 버전 목록 조회 (baseVersion 선택용)
  const { data: standardVersions = [] } = useStandardVersionList(projectId)

  // 커스텀 릴리즈 트리 조회 (고객사별 버전 존재 여부 확인용)
  const { data: customTreeData } = useAllCustomReleaseTree(projectId)

  // 선택된 고객사 정보
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.customerId === customerId)
  }, [customers, customerId])

  // 선택된 고객사의 최초 버전 생성 여부 확인
  const isFirstVersionForCustomer = useMemo(() => {
    if (!selectedCustomer || !customTreeData?.customers) return false
    const customerNode = customTreeData.customers.find(c => c.customerCode === selectedCustomer.customerCode)
    // 고객사 노드가 없거나 버전 그룹이 없으면 최초 버전
    return !customerNode || customerNode.majorMinorGroups.length === 0
  }, [selectedCustomer, customTreeData])

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

      await releaseApi.createCustomVersion(
        projectId,
        customerId!,
        customVersion,
        comment,
        file!,
        isApproved,
        isFirstVersionForCustomer && baseVersionId ? baseVersionId : undefined,
        progressHandler
      )
      completeTransfer()
    },
    onSuccess: () => {
      toast({
        title: '커스텀 버전 생성 완료',
        description: `버전 ${customVersion}이(가) 성공적으로 생성되었습니다.`,
      })
      handleClose()
      onSuccess()
    },
    onError: (error) => {
      resetTransfer()
      toast({
        title: '커스텀 버전 생성 실패',
        description: error instanceof Error ? error.message : '버전 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const handleClose = () => {
    setCustomerId(null)
    setBaseVersionId(null)
    setCustomVersion('')
    setComment('')
    setFile(null)
    setIsApproved(false)
    setUploadCompleted(false)
    resetTransfer()
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerId) {
      toast({
        title: '입력 오류',
        description: '고객사를 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (isFirstVersionForCustomer && !baseVersionId) {
      toast({
        title: '입력 오류',
        description: '최초 버전 생성 시 표준본 버전(Base Version)을 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!customVersion.trim()) {
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

      const maxSize = 10 * 1024 * 1024 * 1024 // 10GB
      if (selectedFile.size > maxSize) {
        toast({
          title: '파일 크기 초과',
          description: '파일 크기는 10GB를 초과할 수 없습니다.',
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

      const maxSize = 10 * 1024 * 1024 * 1024 // 10GB
      if (droppedFile.size > maxSize) {
        toast({
          title: '파일 크기 초과',
          description: '파일 크기는 10GB를 초과할 수 없습니다.',
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
            <Tag className="h-5 w-5" />
            커스텀 버전 생성
          </SheetTitle>
          <SheetDescription>
            고객사별 커스텀 릴리즈 버전을 생성합니다.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 파일 구조 안내 */}
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

            {/* 고객사 선택 */}
            <div className="space-y-2">
              <Label htmlFor="customerId" required>
                고객사
              </Label>
              <Combobox
                options={customers.map((customer: Customer) => ({
                  value: String(customer.customerId),
                  label: `${customer.customerName} (${customer.customerCode})`,
                }))}
                value={customerId ? String(customerId) : ''}
                onValueChange={(value) => {
                  setCustomerId(value ? Number(value) : null)
                  setBaseVersionId(null) // 고객사 변경 시 baseVersionId 초기화
                }}
                placeholder="고객사를 선택하세요"
                searchPlaceholder="고객사 검색..."
              />
            </div>

            {/* 표준본 버전 선택 (최초 버전 생성 시에만 표시) */}
            {customerId && isFirstVersionForCustomer && (
              <div className="space-y-2">
                <Label htmlFor="baseVersionId" required>
                  표준본 버전 (Base Version)
                </Label>
                <Combobox
                  options={standardVersions.map((sv) => ({
                    value: String(sv.versionId),
                    label: `${sv.version}${!sv.isApproved ? ' (승인되지 않음)' : ''}`,
                  }))}
                  value={baseVersionId ? String(baseVersionId) : ''}
                  onValueChange={(value) => setBaseVersionId(value ? Number(value) : null)}
                  placeholder="기준이 될 표준본 버전을 선택하세요"
                  searchPlaceholder="표준본 버전 검색..."
                />
                <p className="text-xs text-muted-foreground">
                  고객사별 최초 커스텀 버전 생성 시 기준이 될 표준본 버전을 선택해야 합니다.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customVersion" required>
                버전
              </Label>
              <Input
                id="customVersion"
                placeholder="예: 1.0.0"
                value={customVersion}
                onChange={(e) => setCustomVersion(e.target.value)}
                required
              />
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isApproved"
                checked={isApproved}
                onCheckedChange={(checked) => setIsApproved(checked as boolean)}
              />
              <Label
                htmlFor="isApproved"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                승인된 버전으로 생성
              </Label>
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
                        최대 파일 크기: 10GB
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
                    <Tag className="h-4 w-4 mr-2" />
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
