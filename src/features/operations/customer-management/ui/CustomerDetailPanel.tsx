/**
 * Customer Detail Panel Component
 * 고객사 상세 패널 컴포넌트 (우측 패널)
 * ContentSplit.Detail 내부에서 사용 (header와 ScrollArea는 ContentSplit.Detail이 제공)
 */

import type { Customer } from '@/entities/operations/customer'

import { CustomerPatchHistoryCard } from './CustomerPatchHistoryCard'
import { CustomerNotesCard } from './CustomerNotesCard'

interface CustomerDetailPanelProps {
  customer: Customer
}

export function CustomerDetailPanel({
  customer,
}: CustomerDetailPanelProps) {
  return (
    <div className="space-y-16 pt-2">
      {/* 특이사항 */}
      <CustomerNotesCard customerId={customer.customerId} />

      {/* 패치 이력 */}
      <CustomerPatchHistoryCard customer={customer} />
    </div>
  )
}
