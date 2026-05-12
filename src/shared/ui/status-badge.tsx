/**
 * Status Badge Component
 * 상태 표시용 배지 컴포넌트
 *
 * @deprecated 신규 코드에서는 Badge variant="success|warning|info|neutral" 를 직접 사용하세요.
 *             이 컴포넌트는 하위 호환성을 위해 유지됩니다.
 */

import { cn } from '@/shared/lib/utils'

import { Badge } from './badge'

type StatusVariant = 'active' | 'inactive' | 'success' | 'warning' | 'error' | 'info'
  | 'theme-1' | 'theme-2' | 'theme-3' | 'theme-4' | 'theme-5'

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
  // 테마 기반 색상 (chart 변수 사용)
  'theme-1': 'border-chart-1 bg-chart-1/10 text-chart-1',
  'theme-2': 'border-chart-2 bg-chart-2/10 text-chart-2',
  'theme-3': 'border-chart-3 bg-chart-3/10 text-chart-3',
  'theme-4': 'border-chart-4 bg-chart-4/10 text-chart-4',
  'theme-5': 'border-chart-5 bg-chart-5/10 text-chart-5',
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(variantStyles[variant], className)}>
      {children}
    </Badge>
  )
}
