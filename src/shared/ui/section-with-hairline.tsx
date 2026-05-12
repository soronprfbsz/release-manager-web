/**
 * Section With Hairline
 * 작은 inline 헤더(아이콘 + 라벨 + 카운트 + 우측 액션) + 컨텐츠.
 * 항상 펼침 상태 (접기 기능 없음).
 */

import { type ReactNode } from 'react'

import { type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface SectionWithHairlineProps {
  icon?: LucideIcon
  iconElement?: ReactNode
  title: string
  /** 우측 라벨 옆 카운트 (undefined / 0 이하면 표시 안 함) */
  count?: number
  /** 카운트 prefix (예: "총 ") */
  countPrefix?: string
  /** 카운트 suffix (예: "건") — 기본 "건" */
  countSuffix?: string
  /** 우측 액션 슬롯 */
  action?: ReactNode
  /** 컨텐츠 영역 className */
  contentClassName?: string
  children: ReactNode
}

export function SectionWithHairline({
  icon: Icon,
  iconElement,
  title,
  count,
  countPrefix = '',
  countSuffix = '건',
  action,
  contentClassName,
  children,
}: SectionWithHairlineProps) {
  return (
    <div className="pt-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-sm text-foreground min-w-0">
          {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
          {iconElement && <span className="flex-shrink-0">{iconElement}</span>}
          <span className="font-semibold truncate">{title}</span>
          {typeof count === 'number' && count > 0 && (
            <span className="text-xs text-muted-foreground font-normal flex-shrink-0">
              {countPrefix}
              {count}
              {countSuffix}
            </span>
          )}
        </div>
        {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
      </div>
      <div className={cn('pb-5', contentClassName)}>{children}</div>
    </div>
  )
}
