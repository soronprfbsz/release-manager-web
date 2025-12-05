/**
 * Customer Filters Component
 * 고객사 목록 필터링 컴포넌트
 */

import { Search } from 'lucide-react'

import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import type { CustomerFiltersState } from '../model/types'

interface CustomerFiltersProps {
  filters: CustomerFiltersState
  onFiltersChange: (filters: CustomerFiltersState) => void
}

export function CustomerFilters({ filters, onFiltersChange }: CustomerFiltersProps) {
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
      <Select
        value={filters.isActive}
        onValueChange={(value: 'all' | 'true' | 'false') =>
          onFiltersChange({ ...filters, isActive: value })
        }
      >
        <SelectTrigger className="h-8 w-[90px] text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          <SelectItem value="true">활성</SelectItem>
          <SelectItem value="false">비활성</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
