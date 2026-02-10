/**
 * Post Filters Component
 * 게시글 목록 필터/정렬 컴포넌트
 */

import { Search, TrendingUp, Clock } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

import type { PostFiltersState } from '../model/types'

interface PostFiltersProps {
  filters: PostFiltersState
  onFiltersChange: (filters: PostFiltersState) => void
  showSearch?: boolean
}

export function PostFilters({
  filters,
  onFiltersChange,
  showSearch = true,
}: PostFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* 정렬 버튼 */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 px-3 gap-1.5',
            filters.sort === 'top' && 'bg-background shadow-sm'
          )}
          onClick={() => onFiltersChange({ ...filters, sort: 'top' })}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          인기
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 px-3 gap-1.5',
            filters.sort === 'newest' && 'bg-background shadow-sm'
          )}
          onClick={() => onFiltersChange({ ...filters, sort: 'newest' })}
        >
          <Clock className="h-3.5 w-3.5" />
          최신
        </Button>
      </div>

      {/* 검색 */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.keyword}
            onChange={(e) =>
              onFiltersChange({ ...filters, keyword: e.target.value })
            }
            placeholder="검색..."
            className="pl-8 h-8 w-[200px] text-sm"
          />
        </div>
      )}
    </div>
  )
}
