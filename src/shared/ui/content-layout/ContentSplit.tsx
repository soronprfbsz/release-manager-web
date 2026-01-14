/**
 * Content Split Layout Component
 * 좌/우 분할 레이아웃 컴포넌트
 * - 버전관리, 고객사, 부서 관리 등 트리+상세 구조용
 */

import * as React from 'react'

import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ScrollArea } from '@/shared/ui/scroll-area'

import { CONTENT_SPACING } from './constants'

// ============================================================================
// ContentSplit (Root Container)
// ============================================================================

interface ContentSplitProps {
  children: React.ReactNode
  className?: string
}

function ContentSplitRoot({ children, className }: ContentSplitProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-5',
        CONTENT_SPACING.SPLIT_GAP,
        CONTENT_SPACING.SPLIT_HEIGHT,
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================================================
// ContentSplit.Tree (Left Panel)
// ============================================================================

interface ContentSplitTreeProps {
  /** 패널 제목 */
  title: string
  /** 헤더 우측 액션 */
  actions?: React.ReactNode
  /** 자식 요소 */
  children: React.ReactNode
  /** 추가 className */
  className?: string
}

function ContentSplitTree({
  title,
  actions,
  children,
  className,
}: ContentSplitTreeProps) {
  return (
    <Card className={cn(CONTENT_SPACING.TREE_SPAN, 'flex flex-col overflow-hidden', className)}>
      <CardHeader className="pb-3 flex-shrink-0 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 pt-0">
            {children}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// ContentSplit.Detail (Right Panel)
// ============================================================================

interface ContentSplitDetailProps {
  /** 패널 제목 */
  title?: string
  /** 부제목 */
  subtitle?: string
  /** 헤더 우측 액션 */
  actions?: React.ReactNode
  /** 헤더 영역 커스텀 컨텐츠 */
  header?: React.ReactNode
  /** 자식 요소 */
  children: React.ReactNode
  /** 추가 className */
  className?: string
  /** 빈 상태 표시 여부 */
  isEmpty?: boolean
  /** 빈 상태 메시지 */
  emptyMessage?: string
}

function ContentSplitDetail({
  title,
  subtitle,
  actions,
  header,
  children,
  className,
  isEmpty = false,
  emptyMessage = '항목을 선택해주세요.',
}: ContentSplitDetailProps) {
  const hasHeader = title || subtitle || actions || header

  return (
    <Card className={cn(CONTENT_SPACING.DETAIL_SPAN, 'flex flex-col overflow-hidden', className)}>
      {hasHeader && (
        <div className="px-6 py-3 border-b flex-shrink-0 flex items-center justify-between">
          {header || (
            <>
              <div>
                {title && <h3 className="text-base font-semibold">{title}</h3>}
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </>
          )}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {isEmpty ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className={CONTENT_SPACING.CARD_PADDING}>
              {children}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  )
}

// ============================================================================
// Export Compound Component
// ============================================================================

export const ContentSplit = Object.assign(ContentSplitRoot, {
  Tree: ContentSplitTree,
  Detail: ContentSplitDetail,
})
