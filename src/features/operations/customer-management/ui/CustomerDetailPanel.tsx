/**
 * Customer Detail Panel Component
 * 고객사 상세 패널 컴포넌트 (우측 패널)
 */

import { Building2, Calendar } from 'lucide-react'

import type { Customer } from '@/entities/operations/customer'

import { formatDateTime } from '@/shared/lib/utils/date'
import { Card, CardContent } from '@/shared/ui/card'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { StatusBadge } from '@/shared/ui/status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import { CustomerPatchHistoryCard } from './CustomerPatchHistoryCard'
import { CustomerNotesCard } from './CustomerNotesCard'

interface CustomerDetailPanelProps {
  customer: Customer | null
}

export function CustomerDetailPanel({
  customer,
}: CustomerDetailPanelProps) {
  // 선택된 고객사가 없는 경우
  if (!customer) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">고객사를 선택하면 상세 정보가 표시됩니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 flex-shrink-0 border-b">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 flex-shrink-0">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <StatusBadge
            variant={customer.isActive ? 'active' : 'inactive'}
          >
            {customer.isActive ? '활성' : '비활성'}
          </StatusBadge>
          <div className="flex items-center gap-2 min-w-0">
            {customer.description ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <h2 className="text-base font-semibold truncate cursor-default">
                    {customer.customerName}
                  </h2>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[300px]">{customer.description}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <h2 className="text-base font-semibold truncate">
                {customer.customerName}
              </h2>
            )}
            <span className="text-muted-foreground text-sm">
              [{customer.customerCode}]
            </span>
          </div>
          <span className="flex-1" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 text-xs text-muted-foreground cursor-default flex-shrink-0">
                <Calendar className="h-3 w-3" />
                {formatDateTime(customer.updatedAt || customer.createdAt)}
              </span>
            </TooltipTrigger>
            <TooltipContent>최종 수정일</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="px-8 pb-8 pt-6 space-y-10">
            {/* 특이사항 */}
            <CustomerNotesCard customerId={customer.customerId} />

            {/* 구분선 */}
            <hr className="border-border" />

            {/* 패치 이력 */}
            <CustomerPatchHistoryCard customer={customer} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
