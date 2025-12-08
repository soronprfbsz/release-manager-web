/**
 * Account List Page
 * 계정 목록 페이지
 */

import { useState } from 'react'

import { User, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  AccountTable,
  AccountForm,
  AccountDeleteDialog,
  type AccountFormData,
  createAccountFormData,
} from '@/features/account-management'

import {
  useAccounts,
  useUpdateAccount,
  useDeleteAccount,
  type Account,
  type AccountUpdateRequest,
} from '@/entities/account'

import { useToast } from '@/shared/lib/hooks/use-toast'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { PageHeader } from '@/shared/ui/page-header'

interface PaginationState {
  pageIndex: number
  pageSize: number
}

export function AccountListPage() {
  const { toast } = useToast()

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Sort state
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState<AccountFormData>(createAccountFormData())

  // Delete state
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<Account | null>(null)

  // Query
  const { data: accountData, isLoading, refetch } = useAccounts({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sort ? `${sort.key},${sort.direction}` : undefined,
  })

  // Mutations
  const updateMutation = useUpdateAccount()
  const deleteMutation = useDeleteAccount()

  // Handlers
  const openEditModal = (account: Account) => {
    setFormData(createAccountFormData(account))
    setEditingAccount(account)
    setIsFormOpen(true)
  }

  const closeModal = () => {
    setIsFormOpen(false)
    setEditingAccount(null)
    setFormData(createAccountFormData())
  }

  const handleSubmit = () => {
    if (!editingAccount) return

    const request: AccountUpdateRequest = {
      email: formData.email.trim() || undefined,
      role: formData.role || undefined,
      isActive: formData.isActive,
    }

    updateMutation.mutate(
      { id: editingAccount.accountId, data: request },
      {
        onSuccess: () => {
          toast({ title: '수정 완료', description: '계정 정보가 수정되었습니다.' })
          closeModal()
        },
        onError: (error: Error) => {
          toast({ title: '수정 실패', description: error.message, variant: 'destructive' })
        },
      }
    )
  }

  const handleDelete = () => {
    if (!deleteConfirmAccount) return

    deleteMutation.mutate(deleteConfirmAccount.accountId, {
      onSuccess: () => {
        toast({ title: '삭제 완료', description: '계정이 삭제되었습니다.' })
        setDeleteConfirmAccount(null)
      },
      onError: (error: Error) => {
        toast({ title: '삭제 실패', description: error.message, variant: 'destructive' })
      },
    })
  }

  const handleSort = (key: string) => {
    setSort((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const accountList = accountData?.content || []

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
            <BreadcrumbPage>계정 관리</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<User className="h-5 w-5 text-primary" />}
        title="계정 관리"
        description="계정 정보를 조회하고 관리합니다."
        actions={
          <Button onClick={() => refetch()} variant="outline" size="icon" title="새로고침">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {/* Account List Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            계정 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <AccountTable
                accounts={accountList}
                sort={sort}
                onSort={handleSort}
                onEdit={openEditModal}
                onDelete={(id) => {
                  const account = accountList.find((a) => a.accountId === id)
                  if (account) setDeleteConfirmAccount(account)
                }}
              />
              {accountList.length > 0 && (
                <div className="pt-4">
                  <DataTablePagination
                    pageIndex={pagination.pageIndex}
                    pageSize={pagination.pageSize}
                    totalElements={accountData?.totalElements || 0}
                    onPaginationChange={setPagination}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Sheet */}
      {isFormOpen && editingAccount && (
        <AccountForm
          username={editingAccount.username}
          formData={formData}
          isSubmitting={updateMutation.isPending}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {/* Delete Dialog */}
      <AccountDeleteDialog
        open={deleteConfirmAccount !== null}
        accountUsername={deleteConfirmAccount?.username || null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmAccount(null)}
      />
    </div>
  )
}
