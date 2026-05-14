import * as React from 'react'

import { useMenuDescription } from '@/shared/lib/hooks/use-menu-description'
import { cn } from '@/shared/lib/utils'

interface PageHeaderProps {
  /** 아이콘 — Backstage rm-page-head 는 아이콘 미사용. props 는 호환성 위해 유지(미렌더링). */
  icon?: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

/**
 * Backstage rm-page-head 스타일 페이지 헤더.
 *  - 테두리/배경/아이콘 없음, 큰 타이틀 + muted 설명 + 우측 액션
 *  - 타이틀: 26px / line 32px / weight 600 / tracking -0.01em
 *  - 설명: 13px muted, mt-1
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  const menuDescription = useMenuDescription()
  const displayDescription = description || menuDescription

  return (
    <div className={cn('flex items-end justify-between gap-6', className)}>
      <div className="min-w-0">
        <h1 className="text-[26px] leading-[32px] font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </h1>
        {displayDescription && (
          <p className="mt-1 text-[13px] text-muted-foreground">{displayDescription}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
