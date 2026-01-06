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
    <div className="flex items-center gap-2">
      {/* Category Filter */}
      <Select
        value={filters.publishingCategory}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, publishingCategory: value === 'all' ? '' : value })
        }
      >
        <SelectTrigger className="h-8 w-[140px] text-sm">
          <SelectValue placeholder="전체 카테고리" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 카테고리</SelectItem>
          {PUBLISHING_CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Keyword Search */}
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
