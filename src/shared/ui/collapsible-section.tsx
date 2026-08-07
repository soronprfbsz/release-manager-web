/**
 * Collapsible Section Component
 * 접기/펼치기 가능한 섹션 컴포넌트
 */

import { useState, type ReactNode } from 'react'

import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

interface CollapsibleSectionProps {
  /** 섹션 아이콘 (LucideIcon 컴포넌트) */
  icon?: LucideIcon
  /** 섹션 아이콘 (ReactNode - JSX로 렌더링된 아이콘) */
  iconElement?: ReactNode
  /** 섹션 타이틀 */
  title: string
  /** 부가 정보 (우측 또는 타이틀 아래 표시) */
  subtitle?: ReactNode
  /** 타이틀 우측 액션 버튼들 */
  actions?: ReactNode
  /** 초기 펼침 상태 - uncontrolled mode (기본: true) */
  defaultExpanded?: boolean
  /** 펼침 상태 - controlled mode */
  expanded?: boolean
  /** 펼침 상태 변경 콜백 - controlled mode */
  onExpandedChange?: (expanded: boolean) => void
  /** 컨텐츠 */
  children: ReactNode
  /** 스타일 variant */
  variant?: 'default' | 'boxed-icon'
  /** 추가 className */
  className?: string
  /** 헤더 className */
  headerClassName?: string
  /** 컨텐츠 영역 className */
  contentClassName?: string
}

export function CollapsibleSection({
  icon: Icon,
  iconElement,
  title,
  subtitle,
  actions,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onExpandedChange,
  children,
  variant = 'default',
  className,
  headerClassName,
  contentClassName,
}: CollapsibleSectionProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded)

  // Controlled vs Uncontrolled 모드 결정
  const isControlled = controlledExpanded !== undefined
  const isExpanded = isControlled ? controlledExpanded : uncontrolledExpanded

  const toggleExpanded = () => {
    const newValue = !isExpanded
    if (isControlled) {
      onExpandedChange?.(newValue)
    } else {
      setUncontrolledExpanded(newValue)
    }
  }

  // boxed-icon variant (리소스 관리 스타일)
  if (variant === 'boxed-icon') {
    return (
      <div className={cn('mb-4', className)}>
        {/* Header — 구분선 없는 띠 영역 (외곽 박스 아님) */}
        <div
          className={cn(
            'flex items-center gap-3 w-full py-3',
            headerClassName
          )}
        >
          {/* Toggle Button (아이콘 + 타이틀) */}
          <button
            type="button"
            onClick={toggleExpanded}
            className="flex items-center gap-3 flex-1 min-w-0 text-left group"
          >
            {(Icon || iconElement) && (
              <div className="p-2 rounded-lg bg-[hsl(var(--header-bg))] border border-border flex-shrink-0">
                {Icon ? (
                  <Icon className="h-5 w-5 text-foreground" />
                ) : (
                  <div className="h-5 w-5 text-foreground flex items-center justify-center">
                    {iconElement}
                  </div>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{title}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </button>

          {/* Actions (접기 버튼 좌측) */}
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}

          {/* Chevron Toggle — 옆 + 추가 버튼과 동일한 square outline icon-xs 스타일 */}
          <Button
            variant="outline"
            size="icon-xs"
            onClick={toggleExpanded}
            aria-label={isExpanded ? '접기' : '펼치기'}
          >
            {isExpanded ? <ChevronDown /> : <ChevronRight />}
          </Button>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className={cn('pt-4', contentClassName)}>
            {children}
          </div>
        )}
      </div>
    )
  }

  // default variant
  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 w-full pb-2.5 border-b border-border/50',
          headerClassName
        )}
      >
        {/* Toggle Button (아이콘 + 타이틀 + 뱃지) */}
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex items-center gap-1.5 text-left group flex-1 min-w-0"
        >
          <div className="text-muted-foreground/60 group-hover:text-muted-foreground transition-colors flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </div>
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
          <span className="text-sm font-medium truncate">{title}</span>
          {/* Subtitle (타이틀 바로 옆 — muted small) */}
          {subtitle && (
            <span className="text-xs text-muted-foreground/70 flex-shrink-0 font-normal">
              {subtitle}
            </span>
          )}
        </button>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className={cn('pt-3', contentClassName)}>
          {children}
        </div>
      )}
    </div>
  )
}
