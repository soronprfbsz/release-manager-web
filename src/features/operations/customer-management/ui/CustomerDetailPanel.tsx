/**
 * Customer Detail Panel Component
 * 고객사 상세 패널 컴포넌트 (우측 패널)
 *
 * Hero + Meta Rail 헤더:
 *  - 좌측: CUSTOMER + 고객사 코드 eyebrow, 회사명 큰 글씨, 활성 pill
 *  - 가운데(vertical line): 적용 버전 + WEB/ENGINE 빌드 정보
 *  - 우측: 마지막 수정일
 * 그 아래에 특이사항 / 패치 이력 섹션
 */

import { Calendar } from 'lucide-react'

import { useCustomerSiteVersions } from '@/entities/operations/customer-site-version'
import type { Customer } from '@/entities/operations/customer'

import { resolveGlyph, getGlyphFontSizeClass } from '@/shared/lib/glyph'
import { cn } from '@/shared/lib/utils'
import { formatDateTime } from '@/shared/lib/utils/date'
import { Badge } from '@/shared/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import { CustomerNotesCard } from './CustomerNotesCard'
import { CustomerPatchHistoryCard } from './CustomerPatchHistoryCard'

interface CustomerDetailPanelProps {
  customer: Customer
}

export function CustomerDetailPanel({ customer }: CustomerDetailPanelProps) {
  const projectId = customer.project?.projectId
  const { data: siteVersions = [], isLoading } = useCustomerSiteVersions(
    customer.customerId,
    projectId
  )

  const byComponent = Object.fromEntries(
    siteVersions.map((sv) => [sv.component, sv.currentVersion])
  )
  const baseVersion = byComponent.BASE
  const webVersion = byComponent.WEB
  const engineVersion = byComponent.ENGINE

  // 글리프 배지
  const { text: glyphText, glyphClass } = resolveGlyph({
    name: customer.customerName,
    glyphText: customer.glyphText,
    glyphBackgroundColor: customer.glyphBackgroundColor,
  })
  const glyphFontSize = getGlyphFontSizeClass(glyphText)

  return (
    <div className="pt-6">
      {/* Hero + Meta Rail */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-[18px] pb-7">
        {/* 좌측: 고객사 정체성 */}
        <div className="flex items-center gap-4 min-w-0">
          {/* 글리프 배지 */}
          <div
            className={cn(
              'flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center',
              'font-mono font-semibold select-none',
              glyphFontSize,
              glyphClass
            )}
          >
            {glyphText}
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <code className="font-mono text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">
              {customer.customerCode}
            </code>
            {customer.description ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <h2 className="text-[34px] font-semibold tracking-[-0.8px] leading-none truncate cursor-default">
                    {customer.customerName}
                  </h2>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[300px]">{customer.description}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <h2 className="text-[34px] font-semibold tracking-[-0.8px] leading-none truncate">
                {customer.customerName}
              </h2>
            )}
          </div>
        </div>

        {/* 가운데: 적용 버전 + 빌드 정보 (좌측 vertical line) */}
        <div className="self-stretch min-w-0 pl-6 border-l border-border flex flex-col justify-center gap-2">
          {isLoading ? (
            <span className="text-sm text-muted-foreground">확인 중...</span>
          ) : !baseVersion ? (
            <span className="text-sm text-muted-foreground">패치 미적용</span>
          ) : (
            <>
              <AttributeRow label="VERSION" value={baseVersion} large />
              {webVersion && <AttributeRow label="BUILD · WEB" value={webVersion} />}
              {engineVersion && <AttributeRow label="BUILD · ENGINE" value={engineVersion} />}
            </>
          )}
        </div>

        {/* 우측: 활성/비활성 pill + 마지막 수정일 */}
        <div className="flex flex-col items-end gap-2.5">
          {customer.isActive ? (
            <Badge variant="success" size="pill" dot>활성</Badge>
          ) : (
            <Badge variant="neutral" size="pill" dot>비활성</Badge>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground cursor-default">
                <Calendar className="h-3.5 w-3.5" />
                {formatDateTime(customer.updatedAt || customer.createdAt)}
              </span>
            </TooltipTrigger>
            <TooltipContent>최종 수정일</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="space-y-10">
        {/* 특이사항 */}
        <CustomerNotesCard customerId={customer.customerId} />

        {/* 패치 이력 — 완료된 패치만 */}
        <CustomerPatchHistoryCard customer={customer} />
      </div>
    </div>
  )
}

function AttributeRow({
  label,
  value,
  large = false,
}: {
  label: string
  value: string
  large?: boolean
}) {
  return (
    <div className="flex items-baseline gap-3 min-w-0">
      <span className="text-[10px] font-medium tracking-widest text-muted-foreground/70 uppercase flex-shrink-0 w-28">
        {label}
      </span>
      <span
        className={
          large
            ? 'font-mono text-xl font-semibold text-foreground truncate'
            : 'font-mono text-sm text-foreground truncate'
        }
      >
        {value}
      </span>
    </div>
  )
}
