/**
 * Department Page
 * 부서 관리 페이지 - 트리 뷰 기반 조직도 + 계정 관리
 */

import { useState } from 'react'

import { Plus, Users, UserX } from 'lucide-react'

import { usePageIcon } from '@/shared/lib/hooks'
import { getMenuIcon } from '@/shared/config/menu-icons'

import {
  DepartmentTree,
  DepartmentForm,
  DepartmentDeleteDialog,
  AccountListPanel,
  AccountMoveDialog,
  AccountAssignDialog,
  validateDepartmentForm,
  INITIAL_DEPARTMENT_FORM_DATA,
  type DepartmentFormData,
  type DepartmentFormMode,
  type DropPosition,
  type DropInfo,
} from '@/features/operations/department-management'

import {
  useDepartments,
  useDepartmentTree,
  useDepartmentDetail,
  useCreateDepartment,
  useUpdateDepartment,
  useMoveDepartment,
  useDeleteDepartment,
  departmentKeys,
  type DepartmentTree as DepartmentTreeType,
} from '@/entities/_shared/department'

import {
  useAccountsByDepartment,
  useAccounts,
  useUpdateAccount,
  accountKeys,
  type Account,
} from '@/entities/operations/account'

import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { PageLayout } from '@/shared/ui/page-layout'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Switch } from '@/shared/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

export function DepartmentPage() {
  const { icon: pageIcon, iconName: pageIconName } = usePageIcon()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 선택된 부서 및 특수 모드 (전체 계정, 미배치 계정)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null)
  const [showAllAccounts, setShowAllAccounts] = useState(false)
  const [showUnassigned, setShowUnassigned] = useState(false)

  // 조직도 옵션
  const [includeChildAccounts, setIncludeChildAccounts] = useState(false)

  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<DepartmentFormMode>('create')
  const [formData, setFormData] = useState<DepartmentFormData>(INITIAL_DEPARTMENT_FORM_DATA)
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<DepartmentTreeType | null>(null)

  // Account dialogs
  const [accountToMove, setAccountToMove] = useState<Account | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  // Drag state (Account)
  const [draggedAccount, setDraggedAccount] = useState<Account | null>(null)
  const [dropTargetDeptId, setDropTargetDeptId] = useState<number | null>(null)
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null)

  // Drag state (Department)
  const [draggedDepartment, setDraggedDepartment] = useState<DepartmentTreeType | null>(null)

  // Queries
  const { data: treeData = [], isLoading: isTreeLoading } = useDepartmentTree()
  const { data: departments = [] } = useDepartments()
  const { data: selectedDetail, isLoading: isDetailLoading } = useDepartmentDetail(
    selectedDepartmentId
  )
  // 부서별 계정 조회 (미배치 모드일 때는 departmentId를 null로 요청)
  const { data: accountsData, isLoading: isAccountsLoading } = useAccountsByDepartment(
    showUnassigned ? null : selectedDepartmentId,
    {
      enabled: showUnassigned || selectedDepartmentId !== null,
      includeSubDepartments: includeChildAccounts,
    }
  )
  // 미배치 계정 수 조회 (항상)
  const { data: unassignedAccountsData } = useAccountsByDepartment(null)
  // 배치 다이얼로그용: 전체 계정 조회
  const { data: allAccountsData, isLoading: isAllAccountsLoading } = useAccounts(
    { size: 10000 }
  )

  // Mutations
  const createMutation = useCreateDepartment()
  const updateMutation = useUpdateDepartment()
  const moveMutation = useMoveDepartment()
  const deleteMutation = useDeleteDepartment()
  const updateAccountMutation = useUpdateAccount()

  const departmentAccounts = accountsData?.content || []
  const allAccounts = allAccountsData?.content || []

  // Handlers
  const handleSelect = (department: DepartmentTreeType) => {
    setSelectedDepartmentId(department.departmentId)
    setShowAllAccounts(false)
    setShowUnassigned(false)
  }

  const handleSelectAllAccounts = () => {
    setSelectedDepartmentId(null)
    setShowAllAccounts(true)
    setShowUnassigned(false)
  }

  const handleSelectUnassigned = () => {
    setSelectedDepartmentId(null)
    setShowAllAccounts(false)
    setShowUnassigned(true)
  }

  const openCreateForm = (parentId?: number) => {
    setFormData({
      ...INITIAL_DEPARTMENT_FORM_DATA,
      parentDepartmentId: parentId ?? null,
    })
    setFormMode('create')
    setEditingDepartmentId(null)
    setFormOpen(true)
  }

  const openEditForm = (department: DepartmentTreeType) => {
    setFormData({
      departmentName: department.departmentName,
      description: department.description || '',
      parentDepartmentId: null,
    })
    setFormMode('edit')
    setEditingDepartmentId(department.departmentId)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setFormData(INITIAL_DEPARTMENT_FORM_DATA)
    setEditingDepartmentId(null)
  }

  const handleSubmit = () => {
    const validation = validateDepartmentForm(formData)
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(' ')
      toast({ title: '입력 오류', description: errorMessage, variant: 'destructive' })
      return
    }

    if (formMode === 'create') {
      createMutation.mutate(
        {
          departmentName: formData.departmentName.trim(),
          description: formData.description.trim() || undefined,
          parentDepartmentId: formData.parentDepartmentId,
        },
        {
          onSuccess: () => {
            toast({ title: '부서 생성 완료', description: '새 부서가 등록되었습니다.' })
            closeForm()
          },
          onError: createErrorHandler(toast, '생성 실패'),
        }
      )
    } else if (formMode === 'edit' && editingDepartmentId) {
      updateMutation.mutate(
        {
          id: editingDepartmentId,
          request: {
            departmentName: formData.departmentName.trim(),
            description: formData.description.trim() || undefined,
          },
        },
        {
          onSuccess: () => {
            toast({ title: '수정 완료', description: '부서 정보가 수정되었습니다.' })
            closeForm()
          },
          onError: createErrorHandler(toast, '수정 실패'),
        }
      )
    }
  }

  const handleDelete = (department: DepartmentTreeType) => {
    setDeleteTarget(department)
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return

    deleteMutation.mutate(deleteTarget.departmentId, {
      onSuccess: () => {
        toast({ title: '삭제 완료', description: '부서가 삭제되었습니다.' })
        setDeleteTarget(null)
        if (selectedDepartmentId === deleteTarget.departmentId) {
          setSelectedDepartmentId(null)
        }
      },
      onError: createErrorHandler(toast, '삭제 실패'),
    })
  }

  // Account handlers
  const handleAssignAccount = (departmentId: number) => {
    setSelectedDepartmentId(departmentId)
    setShowAllAccounts(false)
    setShowUnassigned(false)
    setAssignDialogOpen(true)
  }

  const handleMoveAccount = (account: Account) => {
    setAccountToMove(account)
  }

  const handleAccountMoveConfirm = (newDepartmentId: number | null) => {
    if (!accountToMove) return

    updateAccountMutation.mutate(
      { id: accountToMove.accountId, data: { departmentId: newDepartmentId } },
      {
        onSuccess: () => {
          toast({
            title: '이동 완료',
            description: `${accountToMove.accountName}님이 이동되었습니다.`,
          })
          setAccountToMove(null)
          // Invalidate all account queries (including unassigned) and department tree
          queryClient.invalidateQueries({ queryKey: accountKeys.all })
          queryClient.invalidateQueries({ queryKey: departmentKeys.tree() })
        },
        onError: createErrorHandler(toast, '이동 실패'),
      }
    )
  }

  const handleAssignConfirm = (accountIds: number[]) => {
    if (selectedDepartmentId === null || accountIds.length === 0) return

    // 선택된 계정들을 현재 부서에 배치
    const promises = accountIds.map((accountId) =>
      updateAccountMutation.mutateAsync({ id: accountId, data: { departmentId: selectedDepartmentId } })
    )

    Promise.all(promises)
      .then(() => {
        toast({
          title: '배치 완료',
          description: `${accountIds.length}명의 계정이 배정되었습니다.`,
        })
        setAssignDialogOpen(false)
        // Invalidate all account queries (including unassigned) and department tree
        queryClient.invalidateQueries({ queryKey: accountKeys.all })
        queryClient.invalidateQueries({ queryKey: departmentKeys.tree() })
      })
      .catch(() => {
        toast({ title: '배치 실패', description: '일부 계정 배정에 실패했습니다.', variant: 'destructive' })
      })
  }

  // Account Drag & Drop handlers
  const handleAccountDragStart = (account: Account) => {
    setDraggedAccount(account)
  }

  const handleAccountDragEnd = () => {
    setDraggedAccount(null)
    setDropTargetDeptId(null)
    setDropPosition(null)
  }

  // Department Drag & Drop handlers
  const handleDepartmentDragStart = (department: DepartmentTreeType) => {
    // 루트 부서는 드래그 불가
    if (department.depth === 0) return
    setDraggedDepartment(department)
  }

  const handleDepartmentDragEnd = () => {
    setDraggedDepartment(null)
    setDropTargetDeptId(null)
    setDropPosition(null)
  }

  // 공통 드래그 오버/리브/드롭 핸들러
  const handleDragOverDepartment = (departmentId: number, position: DropPosition) => {
    // 계정 드래그 중
    if (draggedAccount && draggedAccount.departmentId !== departmentId) {
      // 상태가 변경될 때만 업데이트 (불필요한 리렌더 방지)
      if (dropTargetDeptId !== departmentId || dropPosition !== position) {
        setDropTargetDeptId(departmentId)
        setDropPosition(position)
      }
    }
    // 부서 드래그 중 (자기 자신으로는 이동 불가)
    if (draggedDepartment && draggedDepartment.departmentId !== departmentId) {
      // 상태가 변경될 때만 업데이트 (불필요한 리렌더 방지)
      if (dropTargetDeptId !== departmentId || dropPosition !== position) {
        setDropTargetDeptId(departmentId)
        setDropPosition(position)
      }
    }
  }

  const handleDragLeaveDepartment = () => {
    setDropTargetDeptId(null)
    setDropPosition(null)
  }

  const handleDropOnDepartment = (dropInfo: DropInfo) => {
    // 계정 드래그 앤 드롭 - position이 'child'일 때만 부서에 배치
    if (draggedAccount) {
      const targetDepartmentId = dropInfo.position === 'child' ? dropInfo.targetId : dropInfo.parentId
      if (targetDepartmentId !== null && draggedAccount.departmentId !== targetDepartmentId) {
        updateAccountMutation.mutate(
          { id: draggedAccount.accountId, data: { departmentId: targetDepartmentId } },
          {
            onSuccess: () => {
              toast({
                title: '이동 완료',
                description: `${draggedAccount.accountName}님이 이동되었습니다.`,
              })
              // Invalidate all account queries (including unassigned) and department tree
              queryClient.invalidateQueries({ queryKey: accountKeys.all })
              queryClient.invalidateQueries({ queryKey: departmentKeys.tree() })
            },
            onError: createErrorHandler(toast, '이동 실패'),
          }
        )
      }
      setDraggedAccount(null)
      setDropTargetDeptId(null)
      setDropPosition(null)
      return
    }

    // 부서 드래그 앤 드롭 (부모 변경 + 순서 변경)
    if (draggedDepartment && draggedDepartment.departmentId !== dropInfo.targetId) {
      moveMutation.mutate(
        {
          id: draggedDepartment.departmentId,
          request: {
            newParentId: dropInfo.parentId,
            sortOrder: dropInfo.sortOrder,
          },
        },
        {
          onSuccess: () => {
            toast({
              title: '이동 완료',
              description: `${draggedDepartment.departmentName} 부서가 이동되었습니다.`,
            })
          },
          onError: createErrorHandler(toast, '이동 실패'),
        }
      )
      setDraggedDepartment(null)
      setDropTargetDeptId(null)
      setDropPosition(null)
    }
  }

  return (
    <PageLayout
      icon={pageIcon}
      title="부서 관리"
      description="조직도 및 부서별 계정을 관리합니다."
      actions={
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => openCreateForm()} variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>부서 생성</p>
          </TooltipContent>
        </Tooltip>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-18rem)]">
        {/* 부서 트리 (2/5) */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getMenuIcon(pageIconName, 'h-5 w-5')}
                조직도
              </CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="includeChildAccounts" className="text-xs text-muted-foreground cursor-pointer">
                  하위 부서 포함
                </Label>
                <Switch
                  id="includeChildAccounts"
                  checked={includeChildAccounts}
                  onCheckedChange={setIncludeChildAccounts}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {isTreeLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  {/* 부서 트리 */}
                  <DepartmentTree
                    data={treeData}
                    selectedId={(showAllAccounts || showUnassigned) ? null : selectedDepartmentId}
                    dropTargetId={dropTargetDeptId}
                    dropPosition={dropPosition}
                    draggedDepartmentId={draggedDepartment?.departmentId ?? null}
                    onSelect={handleSelect}
                    onCreateChild={openCreateForm}
                    onAssignAccount={handleAssignAccount}
                    onEdit={openEditForm}
                    onDelete={handleDelete}
                    onDepartmentDragStart={handleDepartmentDragStart}
                    onDepartmentDragEnd={handleDepartmentDragEnd}
                    onDragOver={handleDragOverDepartment}
                    onDragLeave={handleDragLeaveDepartment}
                    onDrop={handleDropOnDepartment}
                  />

                  {/* 구분선 + 전체 계정 / 미배치 계정 (트리와 같은 레벨) */}
                  <div className="mx-3 my-2 border-t border-border/50" />
                  <div className="px-1 pb-2 space-y-0.5">
                    {/* 전체 계정 */}
                    <div
                      className={`flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
                        showAllAccounts
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      style={{ paddingLeft: '8px' }}
                      onClick={handleSelectAllAccounts}
                    >
                      <div className="w-4" /> {/* Spacer for alignment with tree */}
                      <div className="w-5" /> {/* Spacer for expand button */}
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-base font-medium">전체 계정</span>
                      <span className="text-sm text-muted-foreground">
                        ({allAccountsData?.content?.length ?? 0})
                      </span>
                    </div>
                    {/* 미배치 계정 */}
                    <div
                      className={`flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${
                        showUnassigned
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      style={{ paddingLeft: '8px' }}
                      onClick={handleSelectUnassigned}
                    >
                      <div className="w-4" /> {/* Spacer for alignment with tree */}
                      <div className="w-5" /> {/* Spacer for expand button */}
                      <UserX className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-base font-medium">미배치 계정</span>
                      <span className="text-sm text-muted-foreground">
                        ({unassignedAccountsData?.content?.length ?? 0})
                      </span>
                    </div>
                  </div>
                </>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 계정 목록 (3/5) */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <AccountListPanel
            department={(showAllAccounts || showUnassigned) ? null : (selectedDetail ?? null)}
            accounts={showAllAccounts ? allAccounts : departmentAccounts}
            isLoading={showAllAccounts ? isAllAccountsLoading : (showUnassigned ? isAccountsLoading : (isDetailLoading || isAccountsLoading))}
            showAllAccounts={showAllAccounts}
            showUnassigned={showUnassigned}
            onMoveAccount={handleMoveAccount}
            onDragStart={handleAccountDragStart}
            onDragEnd={handleAccountDragEnd}
          />
        </div>
      </div>

      {/* Form Sheet */}
      <DepartmentForm
        open={formOpen}
        mode={formMode}
        formData={formData}
        departments={departments}
        editingDepartmentId={editingDepartmentId}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeForm}
      />

      {/* Delete Dialog */}
      <DepartmentDeleteDialog
        open={deleteTarget !== null}
        department={deleteTarget}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Account Move Dialog */}
      <AccountMoveDialog
        open={accountToMove !== null}
        account={accountToMove}
        departments={departments}
        isMoving={updateAccountMutation.isPending}
        onConfirm={handleAccountMoveConfirm}
        onCancel={() => setAccountToMove(null)}
      />

      {/* Account Assign Dialog */}
      <AccountAssignDialog
        open={assignDialogOpen}
        departmentName={selectedDetail?.departmentName || ''}
        accounts={allAccounts}
        isLoading={isAllAccountsLoading}
        isAssigning={updateAccountMutation.isPending}
        onConfirm={handleAssignConfirm}
        onCancel={() => setAssignDialogOpen(false)}
      />
    </PageLayout>
  )
}
