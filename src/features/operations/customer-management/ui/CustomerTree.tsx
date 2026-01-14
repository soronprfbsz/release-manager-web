/**
 * Customer Tree Component
 * 고객사 트리 뷰 컴포넌트 (표준/커스텀 분류)
 */

import { useState, useMemo } from 'react'

import {
  ChevronRight,
  ChevronDown,
  Building2,
  Tag,
  GitBranch,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react'

import type { Customer } from '@/entities/operations/customer'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Loader2 } from 'lucide-react'

interface CustomerTreeProps {
  customers: Customer[]
  selectedId: number | null
  isLoading?: boolean
  searchTerm?: string
  onSelect: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

interface TreeRootNodeProps {
  label: string
  icon: React.ReactNode
  count: number
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onClick: () => void
  children?: React.ReactNode
}

interface CustomerNodeProps {
  customer: Customer
  isSelected: boolean
  onSelect: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

function TreeRootNode({
  label,
  icon,
  count,
  isExpanded,
  isSelected,
  onToggle,
  onClick,
  children,
}: TreeRootNodeProps) {
  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer transition-all select-none',
          isSelected
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-accent'
        )}
        onClick={onClick}
      >
        {/* Expand/Collapse Button */}
        <button
          className="p-0.5 rounded hover:bg-accent"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Icon */}
        {icon}

        {/* Label */}
        <span className="truncate text-sm font-medium">{label}</span>

        {/* Count */}
        <span className="text-xs text-muted-foreground flex-shrink-0">
          ({count})
        </span>
      </div>

      {/* Children */}
      {isExpanded && children && (
        <div className="ml-4 mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">{children}</div>
      )}
    </div>
  )
}

function CustomerNode({
  customer,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: CustomerNodeProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 py-2.5 px-3 rounded-md cursor-pointer transition-all select-none',
        isSelected
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-accent',
        !customer.isActive && 'opacity-60'
      )}
      onClick={() => onSelect(customer)}
    >
      {/* Customer Icon */}
      <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

      {/* Customer Name */}
      <span className="truncate text-sm">
        {customer.customerName}
      </span>

      {/* Customer Code */}
      <span className="text-[11px] text-muted-foreground/70 flex-shrink-0">
        {customer.customerCode}
      </span>

      {/* Inactive Badge */}
      {!customer.isActive && (
        <span className="text-[10px] text-orange-500 flex-shrink-0">
          비활성
        </span>
      )}

      {/* Spacer */}
      <span className="flex-1" />

      {/* Action Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(customer)}>
            <Pencil className="h-4 w-4 mr-2" />
            수정
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(customer)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function CustomerTree({
  customers,
  selectedId,
  isLoading,
  searchTerm = '',
  onSelect,
  onEdit,
  onDelete,
}: CustomerTreeProps) {
  const [expandedRoots, setExpandedRoots] = useState<Set<string>>(
    () => new Set(['standard', 'custom'])
  )

  // 검색어로 필터링된 고객사
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers
    const term = searchTerm.toLowerCase()
    return customers.filter(
      (c) =>
        c.customerName.toLowerCase().includes(term) ||
        c.customerCode.toLowerCase().includes(term)
    )
  }, [customers, searchTerm])

  // 고객사를 Standard/Custom으로 분류
  const { standardCustomers, customCustomers } = useMemo(() => {
    const standard: Customer[] = []
    const custom: Customer[] = []

    filteredCustomers.forEach((customer) => {
      if (customer.hasCustomVersion) {
        custom.push(customer)
      } else {
        standard.push(customer)
      }
    })

    // 이름순 정렬
    standard.sort((a, b) => a.customerName.localeCompare(b.customerName))
    custom.sort((a, b) => a.customerName.localeCompare(b.customerName))

    return { standardCustomers: standard, customCustomers: custom }
  }, [filteredCustomers])

  const handleToggleRoot = (rootId: string) => {
    setExpandedRoots((prev) => {
      const next = new Set(prev)
      if (next.has(rootId)) {
        next.delete(rootId)
      } else {
        next.add(rootId)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm">로딩 중...</span>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-400px)] text-muted-foreground">
        <p className="text-sm">등록된 고객사가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="py-2 px-1">
      {/* No Results */}
      {filteredCustomers.length === 0 && searchTerm && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Search className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">"{searchTerm}" 검색 결과가 없습니다.</p>
        </div>
      )}

      {/* Standard Root */}
      {filteredCustomers.length > 0 && (
        <>
          <TreeRootNode
            label="Standard"
            icon={<Tag className="h-4 w-4 shrink-0" />}
            count={standardCustomers.length}
            isExpanded={expandedRoots.has('standard')}
            isSelected={false}
            onToggle={() => handleToggleRoot('standard')}
            onClick={() => handleToggleRoot('standard')}
          >
            {standardCustomers.map((customer) => (
              <CustomerNode
                key={customer.customerId}
                customer={customer}
                isSelected={selectedId === customer.customerId}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </TreeRootNode>

          {/* Custom Root */}
          <div className="mt-2" />
          <TreeRootNode
            label="Custom"
            icon={<GitBranch className="h-4 w-4 shrink-0" />}
            count={customCustomers.length}
            isExpanded={expandedRoots.has('custom')}
            isSelected={false}
            onToggle={() => handleToggleRoot('custom')}
            onClick={() => handleToggleRoot('custom')}
          >
            {customCustomers.map((customer) => (
              <CustomerNode
                key={customer.customerId}
                customer={customer}
                isSelected={selectedId === customer.customerId}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </TreeRootNode>
        </>
      )}
    </div>
  )
}
