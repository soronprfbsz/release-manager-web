/**
 * Empty State Component
 * 빈 상태 표시 컴포넌트 - 데이터가 없을 때 사용
 */

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

import { TypographyMuted } from './typography'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
  /** 클릭 이벤트 핸들러 (설정 시 클릭 가능한 상태로 변경) */
  onClick?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  onClick,
}: EmptyStateProps) {
  const isClickable = !!onClick

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center h-48 text-muted-foreground',
        isClickable && 'cursor-pointer hover:bg-accent/40 transition-colors',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      <Icon className="h-12 w-12 mb-3 opacity-50" />
      <TypographyMuted>{title}</TypographyMuted>
      {description && <TypographyMuted>{description}</TypographyMuted>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
