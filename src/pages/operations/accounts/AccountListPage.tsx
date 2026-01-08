/**
 * Account List Page
 * 계정 목록 페이지
 */

import { useState } from 'react'

import { User } from 'lucide-react'

import { usePageIcon } from '@/shared/lib/hooks'

import {
  AccountTable,
  AccountForm,
  AccountDeleteDialog,
  AccountFilters,
  type AccountFormData,
  type AccountFiltersState,
  createAccountFormData,
} from '@/features/operations/account-management'

import {
  useAccounts,
  useUpdateAccount,
  useDeleteAccount,
  type Account,
  type AccountUpdateRequest,
} from '@/entities/operations/account'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { DataTableCard } from '@/shared/ui/data-table-card'
import { PageLayout } from '@/shared/ui/page-layout'

interface PaginationState {
  pageIndex: number
  pageSize: number
}

export function AccountListPage() {
  const { icon: pageIcon } = usePageIcon()
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

  // Filter state
  const [filters, setFilters] = useState<AccountFiltersState>({ keyword: '' })

  // Query
  const { data: accountData, isLoading } = useAccounts({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sort ? `${sort.key},${sort.direction}` : undefined,
    keyword: filters.keyword || undefined,
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
      accountName: formData.accountName || undefined,
      role: formData.role || undefined,
      status: formData.status,
    }

    updateMutation.mutate(
      { id: editingAccount.accountId, data: request },
      {
        onSuccess: () => {
          toast({ title: '수정 완료', description: '계정 정보가 수정되었습니다.' })
          closeModal()
        },
        onError: createErrorHandler(toast, '수정 실패'),
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
      onError: createErrorHandler(toast, '삭제 실패'),
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
    <PageLayout
      icon={pageIcon}
      title="계정 관리"
    >
      {/* Account List Card */}
      <DataTableCard
        icon={User}
        title="계정 목록"
        filters={<AccountFilters filters={filters} onFiltersChange={setFilters} />}
        isLoading={isLoading}
        hasData={accountList.length > 0}
        totalElements={accountData?.totalElements || 0}
        pagination={pagination}
        onPaginationChange={setPagination}
      >
        <AccountTable
          accounts={accountList}
          sort={sort}
          onSort={handleSort}
          onEdit={openEditModal}
          onDelete={(id) => {
            const account = accountList.find((a) => a.accountId === id)
            if (account) setDeleteConfirmAccount(account)
          }}
          viewportHeight="calc(100vh - 27rem)"
        />
      </DataTableCard>

      {/* Form Sheet */}
      {isFormOpen && editingAccount && (
        <AccountForm
          email={editingAccount.email}
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
        accountUsername={deleteConfirmAccount?.accountName || null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmAccount(null)}
      />
    </PageLayout>
  )
}
