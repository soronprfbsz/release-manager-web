/**
 * Link Filters Component
 * 링크 검색 필터 컴포넌트
 */

import { Search } from 'lucide-react'

import { Input } from '@/shared/ui/input'

import type { LinkFiltersState } from '../model/types'

interface LinkFiltersProps {
  filters: LinkFiltersState
  onFiltersChange: (filters: LinkFiltersState) => void
}

export function LinkFilters({ filters, onFiltersChange }: LinkFiltersProps) {
  return (
    <div className="flex w-full items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={filters.keyword}
          onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
          placeholder="검색..."
          className="pl-8 h-9 w-full text-sm"
        />
      </div>
    </div>
  )
}

