/**
 * Skeleton Component
 * 로딩 상태 표시용 스켈레톤 컴포넌트
 */

import { cn } from '@/shared/lib/utils'

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}
