/**
 * API Log Page
 * API 로그(운영 이력) 페이지
 */

import { useState } from 'react'

import {
  ApiLogTable,
  ApiLogFilters,
  ApiLogDetailDialog,
  INITIAL_API_LOG_FILTERS,
  type ApiLogFiltersState,
  type SortConfig,
} from '@/features/operations/api-log-management'

import { useApiLogs, type ApiLogListItem } from '@/entities/operations/api-log'

import { ContentCard } from '@/shared/ui/content-layout'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { PageLayout } from '@/shared/ui/page-layout'

interface PaginationState {
  pageIndex: number
  pageSize: number
}

export function ApiLogPage() {
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  // Sort state
  const [sort, setSort] = useState<SortConfig | null>({
    key: 'createdAt',
    direction: 'desc',
  })

  // Filter state
  const [filters, setFilters] = useState<ApiLogFiltersState>(INITIAL_API_LOG_FILTERS)

  // Detail dialog state
  const [selectedLog, setSelectedLog] = useState<ApiLogListItem | null>(null)

  // Build query params
  const getResponseStatusParam = (): number | undefined => {
    if (!filters.responseStatus || filters.responseStatus === 'ALL') return undefined
    const status = parseInt(filters.responseStatus, 10)
    // 200 -> 2xx, 400 -> 4xx, 500 -> 5xx
    return status
  }

  const getHttpMethodParam = (): string | undefined => {
    if (!filters.httpMethod || filters.httpMethod === 'ALL') return undefined
    return filters.httpMethod
  }

  // Query
  const { data: logData, isLoading } = useApiLogs({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sort ? `${sort.key},${sort.direction}` : undefined,
    keyword: filters.keyword || undefined,
    responseStatus: getResponseStatusParam(),
    httpMethod: getHttpMethodParam(),
  })

  // Handlers
  const handleSort = (key: string) => {
    setSort((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handleViewDetail = (log: ApiLogListItem) => {
    setSelectedLog(log)
  }

  const logList = logData?.content || []

  return (
    <PageLayout>
      <ContentCard actions={<ApiLogFilters filters={filters} onFiltersChange={setFilters} />}>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <ApiLogTable
              logs={logList}
              sort={sort}
              onSort={handleSort}
              onViewDetail={handleViewDetail}
              viewportHeight="calc(100vh - 28rem)"
            />
            {logList.length > 0 && (
              <div className="pt-6">
                <DataTablePagination
                  pageIndex={pagination.pageIndex}
                  pageSize={pagination.pageSize}
                  totalElements={logData?.totalElements || 0}
                  onPaginationChange={setPagination}
                />
              </div>
            )}
          </>
        )}
      </ContentCard>

      {/* Detail Dialog */}
      <ApiLogDetailDialog
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </PageLayout>
  )
}
