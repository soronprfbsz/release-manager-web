/**
 * File Transfer Sheet
 * SSH 연결을 통한 파일 업로드 및 패치 배포
 */

import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Upload, X, FileArchive, Loader2, FileUp, Package } from 'lucide-react'

import { sshShellApi } from '@/entities/ssh-shell'
import { usePatches, type CumulativePatch } from '@/entities/patch'
import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

interface FileTransferSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shellSessionId: string | null
  isConnected: boolean
}

export function FileTransferSheet({
  open,
  onOpenChange,
  shellSessionId,
  isConnected,
}: FileTransferSheetProps) {
  // Patch Deploy Tab State
  const [selectedPatchId, setSelectedPatchId] = useState<string>('')
  const [patchRemotePath, setPatchRemotePath] = useState('')

  // File Upload Tab State
  const [remotePath, setRemotePath] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadCompleted, setUploadCompleted] = useState(false)

  const { toast } = useToast()
  const { handleProgress, startTransfer, startServerProcessing, completeTransfer, resetTransfer } =
    useFileTransferProgress()

  // Fetch patches for patch deployment
  const { data: patchesData } = usePatches({
    page: 0,
    size: 100,
  })

  // Patch Deploy Mutation
  const deployPatchMutation = useMutation({
    mutationFn: async () => {
      if (!shellSessionId || !selectedPatchId) {
        throw new Error('세션 ID 또는 패치가 선택되지 않았습니다.')
      }

      await sshShellApi.deployPatch(
        shellSessionId,
        parseInt(selectedPatchId),
        patchRemotePath.trim() || undefined
      )
    },
    onSuccess: () => {
      toast({
        title: '패치 배포 완료',
        description: '패치 파일이 원격 서버로 전송되었습니다.',
      })
      handleClosePatchDeploy()
    },
    onError: (error) => {
      toast({
        title: '패치 배포 실패',
        description: error instanceof Error ? error.message : '패치 배포 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  // File Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!shellSessionId || !file) {
        throw new Error('세션 ID 또는 파일이 없습니다.')
      }

      setUploadCompleted(false)
      startTransfer(file.name, 'upload')

      // 진행률 핸들러 래퍼 - 100% 도달 시 서버 처리 단계로 전환
      const progressHandler = (progressEvent: { loaded: number; total?: number }) => {
        handleProgress(progressEvent)

        // 100%에 도달하면 서버 처리 단계로 전환
        if (progressEvent.total && progressEvent.loaded >= progressEvent.total && !uploadCompleted) {
          setUploadCompleted(true)
          // 약간의 지연 후 서버 처리 단계 표시
          setTimeout(() => {
            startServerProcessing()
          }, 100)
        }
      }

      await sshShellApi.uploadFile(
        shellSessionId,
        file,
        remotePath.trim() || undefined,
        progressHandler
      )
      completeTransfer()
    },
    onSuccess: () => {
      toast({
        title: '파일 업로드 완료',
        description: `${file?.name} 파일이 원격 서버로 전송되었습니다.`,
      })
      handleCloseFileUpload()
    },
    onError: (error) => {
      resetTransfer()
      toast({
        title: '파일 업로드 실패',
        description: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const handleClosePatchDeploy = () => {
    setSelectedPatchId('')
    setPatchRemotePath('')
  }

  const handleCloseFileUpload = () => {
    setRemotePath('')
    setFile(null)
    setUploadCompleted(false)
    resetTransfer()
  }

  const handleClose = () => {
    handleClosePatchDeploy()
    handleCloseFileUpload()
    onOpenChange(false)
  }

  const handlePatchDeploySubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatchId) {
      toast({
        title: '입력 오류',
        description: '배포할 패치를 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    deployPatchMutation.mutate()
  }

  const handleFileUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: '입력 오류',
        description: '업로드할 파일을 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    const maxSize = 1024 * 1024 * 1024 // 1GB
    if (file.size > maxSize) {
      toast({
        title: '파일 크기 초과',
        description: '파일 크기는 1GB를 초과할 수 없습니다.',
        variant: 'destructive',
      })
      return
    }

    uploadMutation.mutate()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
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

  if (!isConnected || !shellSessionId) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            파일 전송
          </SheetTitle>
          <SheetDescription>원격 서버로 패치 또는 파일을 전송합니다.</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="patch" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patch">패치 배포</TabsTrigger>
            <TabsTrigger value="file">파일 업로드</TabsTrigger>
          </TabsList>

          {/* 패치 배포 탭 */}
          <TabsContent value="patch">
            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
              <form onSubmit={handlePatchDeploySubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="patchSelect" required>
                    패치 선택
                  </Label>
                  <Select value={selectedPatchId} onValueChange={setSelectedPatchId}>
                    <SelectTrigger id="patchSelect">
                      <SelectValue placeholder="배포할 패치를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {patchesData?.content.map((patch: CumulativePatch) => (
                        <SelectItem key={patch.patchId} value={patch.patchId.toString()}>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span>{patch.patchName}</span>
                            <span className="text-xs text-muted-foreground">
                              ({patch.fromVersion} → {patch.toVersion})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patchRemotePath">원격 경로 (선택사항)</Label>
                  <Input
                    id="patchRemotePath"
                    placeholder="기본경로: /release-manager/patches"
                    value={patchRemotePath}
                    onChange={(e) => setPatchRemotePath(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    미입력 시, 기본 경로에 저장됩니다.
                  </p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={deployPatchMutation.isPending}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={deployPatchMutation.isPending}
                    className="flex-1"
                  >
                    {deployPatchMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        배포 중...
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4 mr-2" />
                        패치 전송
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </TabsContent>

          {/* 파일 업로드 탭 */}
          <TabsContent value="file">
            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
              <form onSubmit={handleFileUploadSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="file" required>
                    파일 선택
                  </Label>
                  <input
                    ref={fileInputRef}
                    id="file"
                    type="file"
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
                        <div
                          className={`
                          rounded-full p-3
                          ${isDragging ? 'bg-primary/10' : 'bg-muted'}
                        `}
                        >
                          <Upload
                            className={`h-6 w-6 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {isDragging
                              ? '파일을 여기에 놓아주세요'
                              : '파일을 여기에 끌어다 놓거나 클릭하여 선택하세요'}
                          </p>
                          <p className="text-xs text-muted-foreground">최대 파일 크기: 1GB</p>
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

                <div className="space-y-2">
                  <Label htmlFor="remotePath">원격 경로 (선택사항)</Label>
                  <Input
                    id="remotePath"
                    placeholder="예: /release-manager/files"
                    value={remotePath}
                    onChange={(e) => setRemotePath(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    미입력 시, 기본 경로에 저장됩니다.
                  </p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={uploadMutation.isPending}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={uploadMutation.isPending} className="flex-1">
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <FileUp className="h-4 w-4 mr-2" />
                        업로드
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
