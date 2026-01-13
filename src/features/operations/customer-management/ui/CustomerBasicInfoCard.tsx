/**
 * Customer Basic Info Card Component
 * 고객사 기본 정보 카드 컴포넌트
 */

import {
  Building2,
  FileText,
  Calendar,
} from 'lucide-react'

import type { Customer } from '@/entities/operations/customer'

import { formatDateTime } from '@/shared/lib/utils/date'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

interface CustomerBasicInfoCardProps {
  customer: Customer
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <div className="flex items-center justify-center w-6 h-6 rounded bg-muted flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium truncate">{value || '-'}</div>
      </div>
    </div>
  )
}

export function CustomerBasicInfoCard({ customer }: CustomerBasicInfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          기본 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-x-4 gap-y-1">
        <InfoRow
          icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
          label="등록일"
          value={formatDateTime(customer.createdAt)}
        />
        <InfoRow
          icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
          label="수정일"
          value={formatDateTime(customer.updatedAt)}
        />
        <InfoRow
          icon={<FileText className="h-3.5 w-3.5 text-muted-foreground" />}
          label="설명"
          value={customer.description}
        />
      </CardContent>
    </Card>
  )
}
