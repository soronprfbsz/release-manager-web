import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Download,
  RefreshCw,
  FileCode,
  RotateCcw,
  HardDrive,
  FileText,
  FolderOpen,
  Plus,
  Trash2,
  Upload,
  Loader2,
  X,
  File,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { TypographyLarge, TypographyMuted } from '@/shared/ui/typography'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { resourceApi, type ResourceFile } from '@/entities/resource'
import { codeApi, CODE_TYPE } from '@/entities/code'

/** fileType 및 description 기반 아이콘 매핑 */
function getResourceIcon(resource: ResourceFile) {
  const desc = resource.description?.toLowerCase() || ''
  const fileType = resource.fileType?.toUpperCase()

  if (desc.includes('백업') || desc.includes('backup')) {
    return <HardDrive className="h-8 w-8" />
  }
  if (desc.includes('복원') || desc.includes('restore') || desc.includes('recovery')) {
    return <RotateCcw className="h-8 w-8" />
  }
  if (fileType === 'PDF') {
    return <FileText className="h-8 w-8" />
  }
  return <FileCode className="h-8 w-8" />
}

/** fileType 및 description 기반 색상 클래스 */
function getResourceColorClass(resource: ResourceFile) {
  const desc = resource.description?.toLowerCase() || ''
  const fileType = resource.fileType?.toUpperCase()

  if (desc.includes('백업') || desc.includes('backup')) {
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  }
  if (desc.includes('복원') || desc.includes('restore') || desc.includes('recovery')) {
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  }
  if (fileType === 'PDF') {
    return 'text-red-500 bg-red-500/10 border-red-500/20'
  }
  return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
}

/** fileCategory별 그룹 색상 클래스 */
function getGroupColorClass(category: string) {
  const cat = category.toUpperCase()

  switch (cat) {
    case 'SCRIPT':
      return {
        icon: 'bg-cyan-500/10 text-cyan-500',
      }
    case 'DOCUMENT':
      return {
        icon: 'bg-red-500/10 text-red-500',
      }
    case 'SQL':
      return {
        icon: 'bg-amber-500/10 text-amber-500',
      }
    default:
      return {
        icon: 'bg-slate-500/10 text-slate-500',
      }
  }
}

/** fileCategory별 그룹 아이콘 */
function getGroupIcon(category: string) {
  const cat = category.toUpperCase()

  switch (cat) {
    case 'SCRIPT':
      return <FileCode className="h-4 w-4" />
    case 'DOCUMENT':
      return <FileText className="h-4 w-4" />
    case 'SQL':
      return <HardDrive className="h-4 w-4" />
    default:
      return <FolderOpen className="h-4 w-4" />
  }
}

export function ScriptDownloadPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ResourceFile | null>(null)

  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileCategory, setFileCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [description, setDescription] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    data: resources,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['resources'],
    queryFn: resourceApi.getList,
  })

  // 리소스 파일 대분류 코드 목록 조회
  const { data: fileCategoryList = [] } = useQuery({
    queryKey: ['codes', CODE_TYPE.RESOURCE_FILE_CATEGORY],
    queryFn: () => codeApi.getCodesByType(CODE_TYPE.RESOURCE_FILE_CATEGORY),
  })

  // 대분류에 따른 소분류 코드 타입 결정
  const getSubCategoryCodeType = (category: string) => {
    switch (category) {
      case 'SCRIPT':
        return CODE_TYPE.RESOURCE_SUBCATEGORY_SCRIPT
      case 'DOCUMENT':
        return CODE_TYPE.RESOURCE_SUBCATEGORY_DOCUMENT
      default:
        return null
    }
  }

  // 소분류 코드 목록 조회 (대분류 선택 시)
  const subCategoryCodeType = getSubCategoryCodeType(fileCategory)
  const { data: subCategoryList = [] } = useQuery({
    queryKey: ['codes', subCategoryCodeType],
    queryFn: () => codeApi.getCodesByType(subCategoryCodeType!),
    enabled: !!subCategoryCodeType,
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, fileCategory, subCategory, description }: {
      file: File
      fileCategory: string
      subCategory?: string
      description?: string
    }) =>
      resourceApi.upload(file, fileCategory, subCategory, description, (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      }),
    onSuccess: () => {
      toast({ title: '업로드 완료', description: '리소스 파일이 등록되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      closeUploadModal()
    },
    onError: (error: Error) => {
      toast({ title: '업로드 실패', description: error.message, variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => resourceApi.delete(id),
    onSuccess: () => {
      toast({ title: '삭제 완료', description: '리소스 파일이 삭제되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      setDeleteTarget(null)
    },
    onError: (error: Error) => {
      toast({ title: '삭제 실패', description: error.message, variant: 'destructive' })
    },
  })

  const handleDownload = (resource: ResourceFile) => {
    resourceApi.download(resource.resourceFileId)
  }

  const openUploadModal = () => {
    setSelectedFile(null)
    setFileCategory('')
    setSubCategory('')
    setDescription('')
    setUploadProgress(0)
    setIsUploadOpen(true)
  }

  const closeUploadModal = () => {
    setIsUploadOpen(false)
    setSelectedFile(null)
    setFileCategory('')
    setSubCategory('')
    setDescription('')
    setUploadProgress(0)
  }

  const handleFileCategoryChange = (value: string) => {
    setFileCategory(value)
    setSubCategory('') // 대분류 변경 시 소분류 초기화
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUploadSubmit = () => {
    if (!selectedFile) {
      toast({ title: '파일 선택 필요', description: '업로드할 파일을 선택해주세요.', variant: 'destructive' })
      return
    }
    if (!fileCategory) {
      toast({ title: '카테고리 선택 필요', description: '파일 카테고리를 선택해주세요.', variant: 'destructive' })
      return
    }
    uploadMutation.mutate({
      file: selectedFile,
      fileCategory,
      subCategory: subCategory.trim() || undefined,
      description: description.trim() || undefined,
    })
  }

  // fileCategory 기준으로 그룹핑하고, 카테고리 코드 이름으로 라벨 표시
  const getCategoryLabel = (categoryValue: string) => {
    const category = fileCategoryList.find((c) => c.value === categoryValue)
    return category?.name || categoryValue
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const resourceList = resources || []

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>리소스 관리</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">리소스 관리</h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
          <FileText className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg mb-2">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <p className="text-sm mb-4">{(error as Error).message}</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>리소스 관리</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Download className="h-5 w-5 text-primary" />}
        title="리소스 관리"
        description="데이터베이스 백업 및 복원에 필요한 스크립트를 다운로드할 수 있습니다."
        actions={
          <>
            <Button onClick={() => refetch()} variant="outline" size="icon" title="새로고침">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={openUploadModal} variant="outline">
              <Plus className="h-4 w-4" />
              리소스 추가
            </Button>
          </>
        }
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">리소스 목록을 불러오는 중...</p>
          </div>
        </div>
      ) : resourceList.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FolderOpen className="h-16 w-16 mb-4 opacity-50" />
          <TypographyLarge>등록된 리소스가 없습니다.</TypographyLarge>
          <TypographyMuted>관리자에게 문의하세요.</TypographyMuted>
        </div>
      ) : (
        /* Resource Cards - Grouped by fileCategory */
        <div>
          {Object.entries(
            resourceList.reduce((acc, resource) => {
              const category = resource.fileCategory || 'ETC'
              if (!acc[category]) acc[category] = []
              acc[category].push(resource)
              return acc
            }, {} as Record<string, ResourceFile[]>)
          ).map(([category, files]) => {
            const groupColorClass = getGroupColorClass(category)

            return (
              <div key={category} className="space-y-4 py-8 first:pt-0 last:pb-0 border-t first:border-t-0">
                {/* 그룹 헤더 */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${groupColorClass.icon}`}>
                    {getGroupIcon(category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{getCategoryLabel(category)}</h3>
                    <p className="text-xs text-muted-foreground">{files.length}개의 파일</p>
                  </div>
                </div>

                {/* 카드 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {files.map((resource) => {
                    const colorClass = getResourceColorClass(resource)

                    return (
                      <Card
                        key={resource.resourceFileId}
                        className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-xl border ${colorClass}`}>
                              {getResourceIcon(resource)}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(resource)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardTitle className="text-base mt-3">{resource.description || resource.fileName}</CardTitle>
                          <CardDescription className="text-xs font-mono text-muted-foreground">
                            {resource.fileName}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Button
                            className="w-full"
                            onClick={() => handleDownload(resource)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            다운로드
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 업로드 모달 */}
      <Dialog open={isUploadOpen} onOpenChange={(open) => !open && closeUploadModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              리소스 추가
            </DialogTitle>
            <DialogDescription>
              새로운 리소스 파일을 업로드합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 대분류 선택 */}
            <div className="space-y-2">
              <Label required>대분류</Label>
              <Select value={fileCategory} onValueChange={handleFileCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="대분류를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {fileCategoryList.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 소분류 선택 (대분류가 SCRIPT 또는 DOCUMENT인 경우) */}
            {subCategoryList.length > 0 && (
              <div className="space-y-2">
                <Label>소분류</Label>
                <Select value={subCategory} onValueChange={setSubCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="소분류를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategoryList.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 파일 선택 영역 */}
            <div className="space-y-2">
              <Label required>파일</Label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                  <File className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">클릭하여 파일을 선택하세요</p>
                </div>
              )}
            </div>

            {/* 설명 입력 */}
            <div className="space-y-2">
              <Label>설명</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="리소스에 대한 설명을 입력하세요"
              />
            </div>

            {/* 업로드 진행률 */}
            {uploadMutation.isPending && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>업로드 중...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeUploadModal} disabled={uploadMutation.isPending}>
              취소
            </Button>
            <Button onClick={handleUploadSubmit} disabled={uploadMutation.isPending || !selectedFile || !fileCategory}>
              {uploadMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              업로드
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>리소스 삭제</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{deleteTarget?.description || deleteTarget?.fileName}</span>
              {' '}파일을 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.resourceFileId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
