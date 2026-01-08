/**
 * File Filters Component
 * 파일 검색 필터 컴포넌트
 */

import { Search } from 'lucide-react'

import { Input } from '@/shared/ui/input'

import type { FileFiltersState } from '../model/types'

interface FileFiltersProps {
  filters: FileFiltersState
  onFiltersChange: (filters: FileFiltersState) => void
}

export function FileFilters({ filters, onFiltersChange }: FileFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={filters.keyword}
          onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
          placeholder="검색..."
          className="pl-8 h-8 w-[180px] text-sm"
        />
      </div>
    </div>
  )
}

