/**
 * Section With Hairline
 * 위쪽에 좌우 끝까지 닿는 hairline 구분선 + 작은 inline 헤더(아이콘 + 라벨 + 카운트 + 우측 액션) +
 * collapsible 컨텐츠. VersionDetailPanel 의 코멘트/파일 영역 스타일을 다른 곳에서도 재사용.
 *
 * 좌우 끝까지 닿는 line 은 ContentSplit.Detail 의 inner padding `px-8` 환경 가정 —
 * `-mx-8 px-8` 로 부모 좌우 padding 을 무효화한다.
 */

import { useState, type ReactNode } from 'react'

import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface SectionWithHairlineProps {
  icon?: LucideIcon
  iconElement?: ReactNode
  title: string
  /** 우측 라벨 옆 카운트 (undefined / 음수면 표시 안 함) */
  count?: number
  /** 카운트 prefix (예: "총 ") */
  countPrefix?: string
  /** 카운트 suffix (예: "건") — 기본 "건" */
  countSuffix?: string
  /** 우측 액션 슬롯 */
  action?: ReactNode
  defaultExpanded?: boolean
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
  defaultExpanded = true,
  contentClassName,
  children,
}: SectionWithHairlineProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="-mx-8 px-8 border-t border-border pt-5">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-w-0"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
          )}
          {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
          {iconElement && <span className="flex-shrink-0">{iconElement}</span>}
          <span className="font-medium truncate">{title}</span>
          {typeof count === 'number' && count > 0 && (
            <span className="text-muted-foreground/70 font-normal flex-shrink-0">
              {countPrefix}
              {count}
              {countSuffix}
            </span>
          )}
        </button>
        {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
      </div>
      {isExpanded && (
        <div className={cn('pb-5', contentClassName)}>{children}</div>
      )}
    </div>
  )
}
