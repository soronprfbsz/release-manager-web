/**
 * Service Filters
 * 서비스 필터
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Label } from '@/shared/ui/label'
import type { ServiceFiltersState } from '../model/types'

interface ServiceFiltersProps {
  filters: ServiceFiltersState
  onFiltersChange: (filters: ServiceFiltersState) => void
}

export function ServiceFilters({ filters, onFiltersChange }: ServiceFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* 서비스 타입 필터 */}
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="serviceType" className="text-sm font-medium">
          서비스 타입
        </Label>
        <Select
          value={filters.serviceType}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, serviceType: value as ServiceFiltersState['serviceType'] })
          }
        >
          <SelectTrigger id="serviceType" className="mt-1.5">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="infraeye1">InfraEye 1</SelectItem>
            <SelectItem value="infraeye2">InfraEye 2</SelectItem>
            <SelectItem value="infra">Infra</SelectItem>
            <SelectItem value="etc">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 활성 상태 필터 */}
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="isActive" className="text-sm font-medium">
          활성 상태
        </Label>
        <Select
          value={filters.isActive}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, isActive: value as ServiceFiltersState['isActive'] })
          }
        >
          <SelectTrigger id="isActive" className="mt-1.5">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="true">활성</SelectItem>
            <SelectItem value="false">비활성</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
