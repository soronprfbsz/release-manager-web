import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Mail,
  Phone,
  Building
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/shared/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, SortableTableHead } from '@/shared/ui/table'
import { DataTable } from '@/shared/ui/data-table'
import { TypographyMuted } from '@/shared/ui/typography'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { formatPhoneNumber } from '@/shared/lib/utils/phone'
import { PhoneInput } from '@/shared/ui/phone-input'
import { engineerApi, type Engineer, type EngineerCreateRequest, type EngineerUpdateRequest } from '@/entities/engineer'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '-').replace('.', '')
}

type ModalMode = 'create' | 'edit' | null

interface PaginationState {
  pageIndex: number
  pageSize: number
}

export function EngineerListPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingEngineer, setEditingEngineer] = useState<Engineer | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    engineerName: '',
    engineerEmail: '',
    engineerPhone: '',
    department: '',
    description: '',
  })

  const { data: engineerData, isLoading, refetch } = useQuery({
    queryKey: ['engineers', searchKeyword, pagination, sort],
    queryFn: () => {
      return engineerApi.getList({
        keyword: searchKeyword || undefined,
        page: pagination.pageIndex,
        size: pagination.pageSize,
        sort: sort ? `${sort.key},${sort.direction}` : undefined,
      })
    },
  })

  const createMutation = useMutation({
    mutationFn: (request: EngineerCreateRequest) => engineerApi.create(request),
    onSuccess: () => {
      toast({ title: '엔지니어 등록 완료', description: '새 엔지니어가 등록되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['engineers'] })
      closeModal()
    },
    onError: (error: Error) => {
      toast({ title: '등록 실패', description: error.message, variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: EngineerUpdateRequest }) =>
      engineerApi.update(id, request),
    onSuccess: () => {
      toast({ title: '수정 완료', description: '엔지니어 정보가 수정되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['engineers'] })
      closeModal()
    },
    onError: (error: Error) => {
      toast({ title: '수정 실패', description: error.message, variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => engineerApi.delete(id),
    onSuccess: () => {
      toast({ title: '삭제 완료', description: '엔지니어가 삭제되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['engineers'] })
      setDeleteConfirmId(null)
    },
    onError: (error: Error) => {
      toast({ title: '삭제 실패', description: error.message, variant: 'destructive' })
    },
  })

  const openCreateModal = () => {
    setFormData({ engineerName: '', engineerEmail: '', engineerPhone: '', department: '', description: '' })
    setEditingEngineer(null)
    setModalMode('create')
  }

  const openEditModal = (engineer: Engineer) => {
    setFormData({
      engineerName: engineer.engineerName,
      engineerEmail: engineer.engineerEmail,
      engineerPhone: engineer.engineerPhone || '',
      department: engineer.department || '',
      description: engineer.description || '',
    })
    setEditingEngineer(engineer)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingEngineer(null)
    setFormData({ engineerName: '', engineerEmail: '', engineerPhone: '', department: '', description: '' })
  }

  const handleSubmit = () => {
    if (!formData.engineerName.trim() || !formData.engineerEmail.trim()) {
      toast({
        title: '입력 오류',
        description: '이름과 이메일은 필수입니다.',
        variant: 'destructive',
      })
      return
    }

    if (modalMode === 'create') {
      createMutation.mutate({
        engineerName: formData.engineerName.trim(),
        engineerEmail: formData.engineerEmail.trim(),
        engineerPhone: formData.engineerPhone || undefined,
        department: formData.department.trim() || undefined,
        description: formData.description.trim() || undefined,
      })
    } else if (modalMode === 'edit' && editingEngineer) {
      updateMutation.mutate({
        id: editingEngineer.engineerId,
        request: {
          engineerName: formData.engineerName.trim(),
          engineerEmail: formData.engineerEmail.trim(),
          engineerPhone: formData.engineerPhone || undefined,
          department: formData.department.trim() || undefined,
          description: formData.description.trim() || undefined,
        },
      })
    }
  }

  const handleSort = (key: string) => {
    setSort((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const engineerList = engineerData?.content || []

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
            <span>운영 관리</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>엔지니어 관리</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Users className="h-5 w-5 text-primary" />}
        title="엔지니어 관리"
        description="패치 담당 엔지니어 정보를 등록하고 관리합니다."
        actions={
          <>
            <Button onClick={() => refetch()} variant="outline" size="icon" title="새로고침">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={openCreateModal} variant="outline">
              <Plus className="h-4 w-4" />
              엔지니어 등록
            </Button>
          </>
        }
      />

      {/* 엔지니어 목록 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              엔지니어 목록
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="이름 검색..."
                  className="pl-8 h-8 w-[180px] text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : engineerList.length > 0 ? (
            <>
              <DataTable>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        id="engineerId"
                        currentSort={sort}
                        onSort={handleSort}
                        className="w-16 text-center"
                      >
                        ID
                      </SortableTableHead>
                      <SortableTableHead
                        id="engineerName"
                        currentSort={sort}
                        onSort={handleSort}
                      >
                        이름
                      </SortableTableHead>
                      <SortableTableHead
                        id="engineerEmail"
                        currentSort={sort}
                        onSort={handleSort}
                      >
                        이메일
                      </SortableTableHead>
                      <TableHead>연락처</TableHead>
                      <SortableTableHead
                        id="department"
                        currentSort={sort}
                        onSort={handleSort}
                      >
                        소속팀
                      </SortableTableHead>
                      <SortableTableHead
                        id="createdAt"
                        currentSort={sort}
                        onSort={handleSort}
                        className="w-28"
                      >
                        등록일
                      </SortableTableHead>
                      <TableHead className="w-12 text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {engineerList.map((engineer) => (
                      <TableRow key={engineer.engineerId}>
                        <TableCell className="text-center text-muted-foreground">
                          {engineer.engineerId}
                        </TableCell>
                        <TableCell className="font-medium">{engineer.engineerName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            {engineer.engineerEmail}
                          </div>
                        </TableCell>
                        <TableCell>
                          {engineer.engineerPhone ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatPhoneNumber(engineer.engineerPhone)}
                            </div>
                          ) : (
                            <TypographyMuted>-</TypographyMuted>
                          )}
                        </TableCell>
                        <TableCell>
                          {engineer.department ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Building className="h-3.5 w-3.5 text-muted-foreground" />
                              {engineer.department}
                            </div>
                          ) : (
                            <TypographyMuted>-</TypographyMuted>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <TypographyMuted>{formatDateTime(engineer.createdAt)}</TypographyMuted>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">메뉴 열기</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditModal(engineer)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteConfirmId(engineer.engineerId)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataTable>
              <div className="pt-4">
                <DataTablePagination
                  pageIndex={pagination.pageIndex}
                  pageSize={pagination.pageSize}
                  totalElements={engineerData?.totalElements || 0}
                  onPaginationChange={setPagination}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Users className="h-12 w-12 mb-3 opacity-50" />
              <TypographyMuted>등록된 엔지니어가 없습니다.</TypographyMuted>
              <TypographyMuted>엔지니어 등록 버튼을 눌러 새 엔지니어를 추가하세요.</TypographyMuted>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 생성/수정 슬라이드 패널 */}
      <Sheet open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
        <SheetContent className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {modalMode === 'create' ? '엔지니어 등록' : '엔지니어 수정'}
            </SheetTitle>
            <SheetDescription>
              {modalMode === 'create'
                ? '새 엔지니어 정보를 입력하세요.'
                : '엔지니어 정보를 수정하세요.'}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label required>이름</Label>
                <Input
                  value={formData.engineerName}
                  onChange={(e) => setFormData({ ...formData, engineerName: e.target.value })}
                  placeholder="예: 홍길동"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label required>이메일</Label>
                <Input
                  type="email"
                  value={formData.engineerEmail}
                  onChange={(e) => setFormData({ ...formData, engineerEmail: e.target.value })}
                  placeholder="예: engineer@company.com"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label>연락처</Label>
                <PhoneInput
                  value={formData.engineerPhone}
                  onChange={(value) => setFormData({ ...formData, engineerPhone: value })}
                />
              </div>
              <div className="space-y-2">
                <Label>소속팀</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="예: 기술지원팀"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label>설명</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="엔지니어에 대한 설명을 입력하세요"
                  maxLength={500}
                  rows={3}
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={closeModal} className="flex-1">
                  취소
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {modalMode === 'create' ? '등록' : '수정'}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* 삭제 확인 모달 */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>엔지니어 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 엔지니어를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
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
