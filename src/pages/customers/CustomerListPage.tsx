import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Label } from '@/shared/ui/label'
import { Breadcrumb } from '@/shared/ui/breadcrumb'
import { Switch } from '@/shared/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { customerApi } from '@/shared/api/customerApi'
import type { Customer, CustomerCreateRequest, CustomerUpdateRequest } from '@/shared/api/types'

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

type ModalMode = 'create' | 'edit' | null

export function CustomerListPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    customerCode: '',
    customerName: '',
    description: '',
    isActive: true,
  })

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ['customers', filterActive, searchKeyword],
    queryFn: () => customerApi.getCustomers(filterActive, searchKeyword || undefined),
  })

  const createMutation = useMutation({
    mutationFn: (request: CustomerCreateRequest) => customerApi.createCustomer(request),
    onSuccess: () => {
      toast({ title: '고객사 생성 완료', description: '새 고객사가 등록되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      closeModal()
    },
    onError: (error: Error) => {
      toast({ title: '생성 실패', description: error.message, variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: CustomerUpdateRequest }) =>
      customerApi.updateCustomer(id, request),
    onSuccess: () => {
      toast({ title: '수정 완료', description: '고객사 정보가 수정되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      closeModal()
    },
    onError: (error: Error) => {
      toast({ title: '수정 실패', description: error.message, variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerApi.deleteCustomer(id),
    onSuccess: () => {
      toast({ title: '삭제 완료', description: '고객사가 삭제되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      setDeleteConfirmId(null)
    },
    onError: (error: Error) => {
      toast({ title: '삭제 실패', description: error.message, variant: 'destructive' })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      customerApi.updateCustomerStatus(id, isActive),
    onSuccess: () => {
      toast({ title: '상태 변경 완료', description: '활성화 상태가 변경되었습니다.' })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
    onError: (error: Error) => {
      toast({ title: '상태 변경 실패', description: error.message, variant: 'destructive' })
    },
  })

  const openCreateModal = () => {
    setFormData({ customerCode: '', customerName: '', description: '', isActive: true })
    setEditingCustomer(null)
    setModalMode('create')
  }

  const openEditModal = (customer: Customer) => {
    setFormData({
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      description: customer.description || '',
      isActive: customer.isActive,
    })
    setEditingCustomer(customer)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingCustomer(null)
    setFormData({ customerCode: '', customerName: '', description: '', isActive: true })
  }

  const handleSubmit = () => {
    if (!formData.customerCode.trim() || !formData.customerName.trim()) {
      toast({
        title: '입력 오류',
        description: '고객사 코드와 고객사명은 필수입니다.',
        variant: 'destructive',
      })
      return
    }

    if (modalMode === 'create') {
      createMutation.mutate({
        customerCode: formData.customerCode.trim(),
        customerName: formData.customerName.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      })
    } else if (modalMode === 'edit' && editingCustomer) {
      updateMutation.mutate({
        id: editingCustomer.customerId,
        request: {
          customerName: formData.customerName.trim(),
          description: formData.description.trim() || undefined,
          isActive: formData.isActive,
        },
      })
    }
  }

  const handleToggleStatus = (customer: Customer) => {
    statusMutation.mutate({ id: customer.customerId, isActive: !customer.isActive })
  }

  const customerList = customers || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb items={[{ label: '고객사 관리' }]} />
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button onClick={openCreateModal} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            고객사 등록
          </Button>
        </div>
      </div>

      {/* 필터 영역 */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="고객사명 검색..."
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">상태:</Label>
              <select
                value={filterActive === undefined ? 'all' : String(filterActive)}
                onChange={(e) => {
                  const val = e.target.value
                  setFilterActive(val === 'all' ? undefined : val === 'true')
                }}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="all">전체</option>
                <option value="true">활성</option>
                <option value="false">비활성</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 고객사 목록 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              고객사 목록
            </div>
            {customerList.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                총 {customerList.length}개
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : customerList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 text-center">ID</TableHead>
                  <TableHead className="w-36">고객사 코드</TableHead>
                  <TableHead>고객사명</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead className="w-24 text-center">상태</TableHead>
                  <TableHead className="w-44">등록일</TableHead>
                  <TableHead className="w-32 text-center">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerList.map((customer) => (
                  <TableRow key={customer.customerId}>
                    <TableCell className="text-center text-muted-foreground">
                      {customer.customerId}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{customer.customerCode}</span>
                    </TableCell>
                    <TableCell className="font-medium">{customer.customerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {customer.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          customer.isActive
                            ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'border-gray-500 bg-gray-500/10 text-gray-600 dark:text-gray-400'
                        }
                      >
                        {customer.isActive ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(customer.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Switch
                          checked={customer.isActive}
                          onCheckedChange={() => handleToggleStatus(customer)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(customer)}
                          title="수정"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(customer.customerId)}
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Building2 className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">등록된 고객사가 없습니다.</p>
              <p className="text-sm">고객사 등록 버튼을 눌러 새 고객사를 추가하세요.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 생성/수정 모달 */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {modalMode === 'create' ? '고객사 등록' : '고객사 수정'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>고객사 코드 *</Label>
                <input
                  type="text"
                  value={formData.customerCode}
                  onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                  placeholder="예: CUSTOMER_A"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={modalMode === 'edit'}
                />
                {modalMode === 'edit' && (
                  <p className="text-xs text-muted-foreground">고객사 코드는 수정할 수 없습니다.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>고객사명 *</Label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="예: A회사"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>설명</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="고객사에 대한 설명을 입력하세요"
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <Label>활성 상태</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={closeModal}>
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {modalMode === 'create' ? '등록' : '수정'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-sm mx-4">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">고객사 삭제</h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                정말로 이 고객사를 삭제하시겠습니까?
                <br />
                이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
