/**
 * Service Filters
 * 서비스 필터
 */

import { Search } from 'lucide-react'

import { useCodesByType, CODE_TYPE } from '@/entities/_shared/code'

import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import type { ServiceFiltersState } from '../model/types'

interface ServiceFiltersProps {
  filters: ServiceFiltersState
  onFiltersChange: (filters: ServiceFiltersState) => void
}

export function ServiceFilters({ filters, onFiltersChange }: ServiceFiltersProps) {
  const { data: serviceTypes = [] } = useCodesByType(CODE_TYPE.SERVICE_TYPE)

  return (
    <div className="flex w-full items-center gap-4">
      {/* 서비스 타입 필터 */}
      <Select
        value={filters.serviceType}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, serviceType: value as ServiceFiltersState['serviceType'] })
        }
      >
        <SelectTrigger className="h-9 w-[140px] text-sm shrink-0">
          <SelectValue placeholder="서비스 타입" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {serviceTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 키워드 검색 */}
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
