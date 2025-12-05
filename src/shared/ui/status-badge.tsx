/**
 * Status Badge Component
 * 상태 표시용 배지 컴포넌트
 */

import { cn } from '@/shared/lib/utils'

import { Badge } from './badge'

type StatusVariant = 'active' | 'inactive' | 'success' | 'warning' | 'error' | 'info'

interface StatusBadgeProps {
  variant: StatusVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<StatusVariant, string> = {
  active: 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400',
  inactive: 'border-gray-500 bg-gray-500/10 text-gray-600 dark:text-gray-400',
  success: 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400',
  warning: 'border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  error: 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400',
  info: 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(variantStyles[variant], className)}>
      {children}
    </Badge>
  )
}
