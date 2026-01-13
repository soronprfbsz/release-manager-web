/**
 * Customer Detail Panel Component
 * 고객사 상세 패널 컴포넌트 (우측 패널)
 */

import { Building2 } from 'lucide-react'

import type { Customer } from '@/entities/operations/customer'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { StatusBadge } from '@/shared/ui/status-badge'

import { CustomerBasicInfoCard } from './CustomerBasicInfoCard'
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
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg truncate">
                {customer.customerName}
              </CardTitle>
              <StatusBadge
                variant={customer.isActive ? 'active' : 'inactive'}
              >
                {customer.isActive ? '활성' : '비활성'}
              </StatusBadge>
              {customer.hasCustomVersion && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  커스텀
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              [{customer.customerCode}]
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* 기본 정보 */}
            <CustomerBasicInfoCard customer={customer} />

            {/* 패치 이력 */}
            <CustomerPatchHistoryCard customer={customer} />

            {/* 특이사항 */}
            <CustomerNotesCard customerId={customer.customerId} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
