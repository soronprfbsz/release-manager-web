/**
 * Content Card Component
 * 컨텐츠 영역 공통 카드 컴포넌트
 * - 통일된 패딩/마진 적용
 * - 단일 패널 페이지용 (패치관리, 계정관리, 리소스관리 탭 등)
 */

import * as React from 'react'

import { TableOfContents } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

import { CONTENT_SPACING } from './constants'

interface ContentCardProps {
  /** 카드 제목 (선택) */
  title?: string
  /** 헤더 우측 액션 영역 */
  actions?: React.ReactNode
  /** 헤더 영역 커스텀 컨텐츠 (title, actions 대신 사용) */
  header?: React.ReactNode
  /** 자식 요소 */
  children: React.ReactNode
  /** 추가 className */
  className?: string
  /** CardContent 추가 className */
  contentClassName?: string
  /** 패딩 없이 사용 (ScrollArea 등에서 직접 제어 시) */
  noPadding?: boolean
  /** 아이콘 숨김 (기본: false) */
  hideIcon?: boolean
  /**
   * 부모(PageLayout content area) 의 남은 높이를 채우는 fill 모드.
   *  - Card = flex-1 + flex flex-col + overflow-hidden
   *  - CardContent 가 단일 스크롤 컨테이너 (overflow-auto)
   *  - 내부 DataTable 은 `autoHeight` 로 두면 됨 (자체 스크롤 불필요)
   */
  fullHeight?: boolean
}

export function ContentCard({
  title,
  actions,
  header,
  children,
  className,
  contentClassName,
  noPadding = false,
  hideIcon = false,
  fullHeight = false,
}: ContentCardProps) {
  const hasHeader = title || actions || header

  // 헤더가 있으면 컨텐츠 상단 패딩 없음, 없으면 상단 패딩 포함
  const contentPadding = noPadding
    ? 'p-0'
    : hasHeader
      ? CONTENT_SPACING.CARD_PADDING_WITH_HEADER
      : CONTENT_SPACING.CARD_PADDING

  return (
    <Card
      className={cn(
        fullHeight && 'flex-1 min-h-0 flex flex-col overflow-hidden',
        className,
      )}
    >
      {hasHeader && (
        <CardHeader
          className={cn(
            CONTENT_SPACING.HEADER_PADDING,
            'flex-row items-center justify-between space-y-0',
            fullHeight && 'flex-none',
          )}
        >
          {header || (
            <>
              {title ? (
                <CardTitle className="flex items-center gap-2 text-sm min-h-7">
                  {!hideIcon && <TableOfContents className="h-5 w-5" />}
                  {title}
                </CardTitle>
              ) : (
                <span />
              )}
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </>
          )}
        </CardHeader>
      )}
      <CardContent
        className={cn(
          contentPadding,
          fullHeight && 'flex-1 min-h-0 overflow-auto',
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  )
}
