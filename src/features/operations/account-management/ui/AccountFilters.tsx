/**
 * Account Filters Component
 * 계정 목록 필터링 컴포넌트
 */

import { Search } from 'lucide-react'

import { Input } from '@/shared/ui/input'

interface AccountFiltersState {
    keyword: string
}

interface AccountFiltersProps {
    filters: AccountFiltersState
    onFiltersChange: (filters: AccountFiltersState) => void
}

export function AccountFilters({ filters, onFiltersChange }: AccountFiltersProps) {
    return (
        <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
                value={filters.keyword}
                onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
                placeholder="검색..."
                className="pl-8 h-7 w-[160px] text-xs"
            />
        </div>
    )
}

export type { AccountFiltersState }
