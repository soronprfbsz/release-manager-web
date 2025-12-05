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
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center h-48 text-muted-foreground',
        className
      )}
    >
      <Icon className="h-12 w-12 mb-3 opacity-50" />
      <TypographyMuted>{title}</TypographyMuted>
      {description && <TypographyMuted>{description}</TypographyMuted>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
