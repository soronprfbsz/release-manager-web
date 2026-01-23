/**
 * Publishing Filters Component
 * 퍼블리싱 필터 컴포넌트
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

import { PUBLISHING_CATEGORIES } from '../lib/publishingHelpers'
import type { PublishingFiltersState } from '../model/types'

interface PublishingFiltersProps {
  filters: PublishingFiltersState
  onFiltersChange: (filters: PublishingFiltersState) => void
}

export function PublishingFilters({ filters, onFiltersChange }: PublishingFiltersProps) {
  return (
    <div className="flex w-full items-center gap-4">
      {/* Category Filter */}
      <Select
        value={filters.publishingCategory || 'all'}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, publishingCategory: value === 'all' ? '' : value })
        }
      >
        <SelectTrigger className="h-9 w-[140px] text-sm shrink-0">
          <SelectValue placeholder="전체" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {PUBLISHING_CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Keyword Search */}
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
