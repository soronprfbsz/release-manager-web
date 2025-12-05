import { useState, useCallback } from 'react'

export interface PaginationState {
  pageIndex: number
  pageSize: number
}

export interface UsePaginationReturn {
  pagination: PaginationState
  setPagination: (state: PaginationState) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  resetPagination: () => void
}

export function usePagination(
  initialPage = 0,
  initialSize = 10
): UsePaginationReturn {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPage,
    pageSize: initialSize,
  })

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, pageIndex: page }))
  }, [])

  const setPageSize = useCallback((size: number) => {
    setPagination({ pageIndex: 0, pageSize: size })
  }, [])

  const resetPagination = useCallback(() => {
    setPagination({ pageIndex: initialPage, pageSize: initialSize })
  }, [initialPage, initialSize])

  return {
    pagination,
    setPagination,
    setPage,
    setPageSize,
    resetPagination,
  }
}
