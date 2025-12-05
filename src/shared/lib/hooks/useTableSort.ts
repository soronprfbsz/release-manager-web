import { useState, useCallback } from 'react'

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export interface UseTableSortReturn {
  sort: SortConfig | null
  setSort: (config: SortConfig | null) => void
  handleSort: (key: string) => void
  getSortString: () => string | undefined
}

export function useTableSort(initialSort?: SortConfig): UseTableSortReturn {
  const [sort, setSort] = useState<SortConfig | null>(initialSort || null)

  const handleSort = useCallback((key: string) => {
    setSort(current => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }, [])

  const getSortString = useCallback(() => {
    if (!sort) return undefined
    return `${sort.key},${sort.direction}`
  }, [sort])

  return {
    sort,
    setSort,
    handleSort,
    getSortString,
  }
}
