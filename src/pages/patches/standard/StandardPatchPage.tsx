import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Layers, Download, RefreshCw, Calendar, User, ArrowRight, FileText,
  Plus, Package, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TypographyInlineCode, TypographyMuted } from '@/shared/ui/typography'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useAuth } from '@/app/providers/AuthProvider'
import { releaseApi, type VersionNode } from '@/entities/release'
import { patchApi, type CumulativePatch, type CumulativePatchGenerateRequest } from '@/entities/patch'
import { customerApi } from '@/entities/customer'
import { PaginationState } from '@tanstack/react-table'

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

import { DataTablePagination } from '@/shared/ui/data-table-pagination'



function getVersionsFromTree(data: { majorMinorGroups: { versions: VersionNode[] }[] } | undefined): string[] {
  if (!data) return []
  const versions: string[] = []
  data.majorMinorGroups.forEach(group => {
    group.versions.forEach(v => {
      versions.push(v.version)
    })
  })
  return versions.sort((a, b) => {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i]
    }
    return 0
  })
}

export function StandardPatchPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Sheet 상태
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // 패치 생성 폼 상태
  const [fromVersion, setFromVersion] = useState('')
  const [toVersion, setToVersion] = useState('')
  const [customerCode, setCustomerCode] = useState('')
  const [assignedEngineer, setAssignedEngineer] = useState('')
  const [description, setDescription] = useState('')

  // 패치 목록 조회
  const { data: patchesData, isLoading, refetch } = useQuery({
    queryKey: ['cumulative-patches', 'STANDARD', pagination],
    queryFn: () => patchApi.getList({
      page: pagination.pageIndex,
      size: pagination.pageSize,
      releaseType: 'STANDARD',
      sort: 'generatedAt,desc',
    }),
  })

  // 버전 트리 조회 (패치 생성용)
  const { data: treeData, isLoading: isTreeLoading } = useQuery({
    queryKey: ['standard-release-tree'],
    queryFn: releaseApi.getStandardTree,
    enabled: isSheetOpen,
  })

  // 고객사 목록 조회
  const { data: customers } = useQuery({
    queryKey: ['customers-active'],
    queryFn: () => customerApi.getList({ isActive: true, size: 1000 }),
    enabled: isSheetOpen,
  })

  const versions = getVersionsFromTree(treeData)

  // 패치 생성 뮤테이션
  const generateMutation = useMutation({
    mutationFn: (request: CumulativePatchGenerateRequest) => patchApi.generate(request),
    onSuccess: (data) => {
      toast({
        title: '패치 생성 완료',
        description: `${data.patchName} 패치가 생성되었습니다.`,
      })
      queryClient.invalidateQueries({ queryKey: ['cumulative-patches'] })
      resetForm()
      setIsSheetOpen(false)
    },
    onError: (error: Error) => {
      toast({
        title: '패치 생성 실패',
        description: error.message || '패치 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const resetForm = () => {
    setFromVersion('')
    setToVersion('')
    setCustomerCode('')
    setAssignedEngineer('')
    setDescription('')
  }

  const handleGenerate = () => {
    if (!fromVersion || !toVersion) {
      toast({
        title: '입력 오류',
        description: '시작 버전과 종료 버전을 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (fromVersion >= toVersion) {
      toast({
        title: '입력 오류',
        description: '종료 버전은 시작 버전보다 높아야 합니다.',
        variant: 'destructive',
      })
      return
    }

    // customerCode로 customerId 찾기
    const selectedCustomer = customers?.content.find(c => c.customerCode === customerCode)

    const request: CumulativePatchGenerateRequest = {
      type: 'STANDARD',
      customerId: selectedCustomer?.customerId,
      fromVersion,
      toVersion,
      generatedBy: user?.email || '',
      patchedBy: assignedEngineer || undefined,
      description: description || undefined,
    }

    generateMutation.mutate(request)
  }

  const handleFromVersionChange = (value: string) => {
    setFromVersion(value)
    if (toVersion && value >= toVersion) {
      setToVersion('')
    }
  }

  const handleDownload = async (patch: CumulativePatch) => {
    setDownloadingId(patch.patchId)
    try {
      await patchApi.download(patch.patchId, `${patch.patchName}.zip`)
      toast({
        title: '다운로드 완료',
        description: `${patch.patchName} 파일이 다운로드되었습니다.`,
      })
    } catch {
      toast({
        title: '다운로드 실패',
        description: '파일 다운로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const patchList = patchesData?.content || []

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
            <span>패치 관리</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Standard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Package className="h-5 w-5 text-primary" />}
        title="Standard 패치"
        description="표준 릴리즈 기반 패치를 생성하고 관리합니다."
        actions={
          <>
            <Button onClick={() => refetch()} variant="outline" size="icon" title="새로고침">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsSheetOpen(true)} variant="outline">
              <Plus className="h-4 w-4" />
              패치 생성
            </Button>
          </>
        }
      />

      {/* 패치 목록 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              표준 패치 목록
            </div>
            {patchList.length > 0 && (
              <TypographyMuted>
                총 {patchesData?.totalElements || 0}개
              </TypographyMuted>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : patchList.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">ID</TableHead>
                    <TableHead className="w-48">패치명</TableHead>
                    <TableHead className="w-48">버전 범위</TableHead>
                    <TableHead className="w-32">생성자</TableHead>
                    <TableHead className="w-56">생성일시</TableHead>
                    <TableHead className="w-20 text-center">다운로드</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patchList.map((patch) => (
                    <TableRow key={patch.patchId}>
                      <TableCell className="text-center text-muted-foreground">
                        {patch.patchId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <TypographyInlineCode className="bg-transparent">{patch.patchName}</TypographyInlineCode>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypographyInlineCode className="bg-transparent">{patch.fromVersion}</TypographyInlineCode>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <TypographyInlineCode className="bg-transparent font-medium">{patch.toVersion}</TypographyInlineCode>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {patch.generatedBy}
                        </div>
                      </TableCell>
                      <TableCell>
                        <TypographyMuted className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(patch.generatedAt)}
                        </TypographyMuted>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(patch)}
                          disabled={downloadingId === patch.patchId}
                          title="다운로드"
                        >
                          {downloadingId === patch.patchId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="pt-4">
                <DataTablePagination
                  pageIndex={pagination.pageIndex}
                  pageSize={pagination.pageSize}
                  totalElements={patchesData?.totalElements || 0}
                  onPaginationChange={setPagination}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Layers className="h-12 w-12 mb-3 opacity-50" />
              <TypographyMuted>생성된 표준 패치가 없습니다.</TypographyMuted>
              <TypographyMuted>"패치 생성" 버튼을 눌러 새 패치를 생성해보세요.</TypographyMuted>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 패치 생성 Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              패치 생성
            </SheetTitle>
            <SheetDescription>
              선택한 버전 범위 내의 모든 변경사항이 하나의 패치 파일로 생성됩니다.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
            <div className="space-y-5">
              {/* 버전 선택 */}
              <div className="space-y-2">
                <Label>버전 범위 *</Label>
                <div className="flex items-center gap-3">
                  <Select
                    value={fromVersion}
                    onValueChange={handleFromVersionChange}
                    disabled={isTreeLoading || versions.length === 0}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="시작 버전" />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <Select
                    value={toVersion}
                    onValueChange={setToVersion}
                    disabled={isTreeLoading || versions.length === 0 || !fromVersion}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="종료 버전" />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.filter(v => fromVersion && v > fromVersion).map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isTreeLoading && (
                  <TypographyMuted>버전 목록을 불러오는 중...</TypographyMuted>
                )}
                {!isTreeLoading && versions.length === 0 && (
                  <TypographyMuted>등록된 버전이 없습니다.</TypographyMuted>
                )}
              </div>

              {/* 고객사 */}
              <div className="space-y-2">
                <Label>고객사 (선택)</Label>
                <Select
                  value={customerCode || '__none__'}
                  onValueChange={(value) => setCustomerCode(value === '__none__' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="선택 안함" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">선택 안함</SelectItem>
                    {customers?.content.map((c) => (
                      <SelectItem key={c.customerId} value={c.customerCode}>
                        {c.customerName} ({c.customerCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 담당 엔지니어 */}
              <div className="space-y-2">
                <Label>담당 엔지니어 (선택)</Label>
                <Input
                  value={assignedEngineer}
                  onChange={(e) => setAssignedEngineer(e.target.value)}
                  placeholder="패치 담당 엔지니어 이름"
                />
              </div>

              {/* 설명 */}
              <div className="space-y-2">
                <Label>설명 (선택)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="패치에 대한 설명"
                  className="min-h-[80px]"
                />
              </div>

              {/* 생성 정보 미리보기 */}
              {fromVersion && toVersion && (
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>{fromVersion}</strong> 초과 ~ <strong>{toVersion}</strong> 이하 버전의
                    모든 DB 변경사항이 포함된 패치가 생성됩니다.
                  </p>
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setIsSheetOpen(false)
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!fromVersion || !toVersion || generateMutation.isPending}
                  className="flex-1"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Layers className="h-4 w-4 mr-2" />
                      패치 생성
                    </>
                  )}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
