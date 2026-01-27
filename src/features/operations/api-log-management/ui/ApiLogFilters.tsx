/**
 * API Log Filters Component
 * API 로그 필터 컴포넌트
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

import {
  type ApiLogFiltersState,
  HTTP_METHOD_OPTIONS,
  RESPONSE_STATUS_OPTIONS,
} from '../model/types'

interface ApiLogFiltersProps {
  filters: ApiLogFiltersState
  onFiltersChange: (filters: ApiLogFiltersState) => void
}

export function ApiLogFilters({ filters, onFiltersChange }: ApiLogFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      {/* HTTP 메서드 필터 */}
      <Select
        value={filters.httpMethod}
        onValueChange={(value) => onFiltersChange({ ...filters, httpMethod: value })}
      >
        <SelectTrigger className="w-[100px] h-7 text-xs">
          <SelectValue placeholder="메서드" />
        </SelectTrigger>
        <SelectContent>
          {HTTP_METHOD_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 응답 상태 필터 */}
      <Select
        value={filters.responseStatus}
        onValueChange={(value) => onFiltersChange({ ...filters, responseStatus: value })}
      >
        <SelectTrigger className="w-[140px] h-7 text-xs">
          <SelectValue placeholder="상태코드" />
        </SelectTrigger>
        <SelectContent>
          {RESPONSE_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 통합 검색 (URI, 사용자) */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={filters.keyword}
          onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
          placeholder="URI, 사용자 검색..."
          className="pl-8 h-7 w-[180px] text-xs"
        />
      </div>
    </div>
  )
}
