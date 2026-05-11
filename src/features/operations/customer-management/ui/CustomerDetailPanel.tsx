/**
 * Customer Detail Panel Component
 * 고객사 상세 패널 컴포넌트 (우측 패널)
 * ContentSplit.Detail 내부에서 사용 (header와 ScrollArea는 ContentSplit.Detail이 제공)
 */

import type { Customer } from '@/entities/operations/customer'

import { CustomerNotesCard } from './CustomerNotesCard'
import { CustomerPatchHistoryCard } from './CustomerPatchHistoryCard'
import { CustomerVersionInfo } from './CustomerVersionInfo'

interface CustomerDetailPanelProps {
  customer: Customer
}

export function CustomerDetailPanel({
  customer,
}: CustomerDetailPanelProps) {
  return (
    <div className="pt-2">
      {/* 버전 정보 — 고객사 속성 (사이트 현재 버전 / 빌드 요약) */}
      <CustomerVersionInfo customer={customer} />

      <div className="space-y-16 pt-8">
        {/* 특이사항 */}
        <CustomerNotesCard customerId={customer.customerId} />

        {/* 패치 이력 — 완료된 패치만 (생성 시점 ≠ 완료 시점 워크플로) */}
        <CustomerPatchHistoryCard customer={customer} />
      </div>
    </div>
  )
}
