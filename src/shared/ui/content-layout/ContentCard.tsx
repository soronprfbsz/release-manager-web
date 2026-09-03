/**
 * Content Card Component
 * 컨텐츠 영역 공통 카드 컴포넌트
 * - 통일된 패딩/마진 적용
 * - 단일 패널 페이지용 (패치관리, 계정관리, 리소스관리 탭 등)
 *
 * 표면은 `surface` 로 정한다. 기본값은 constants 의 DEFAULT_CONTENT_SURFACE
 * 한 곳에서 나오므로, 전 화면을 카드 박스 없이 바꾸려면 그 상수만 고치면 된다.
 */

import * as React from 'react'

import { TableOfContents } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

import { CONTENT_SPACING, DEFAULT_CONTENT_SURFACE, type ContentSurface } from './constants'

/**
 * plain 표면의 데이터 밴드.
 *
 * apple.com 은 테이블에 줄무늬를 쓰지 않는다 — 흰 면 위에 헤어라인 구분선만 두고,
 * 색 교대는 행이 아니라 페이지를 가로지르는 전폭 밴드(#ffffff ↔ #f5f5f7)로 처리한다.
 * 그래서 카드 박스(테두리·라운드·베벨)만 걷어내고 흰 면 자체는 남긴다.
 *
 * `-mx-4` 는 PageLayout 콘텐츠 여백(px-4)을 상쇄해 밴드를 좌우 끝까지 뻗게 한다.
 * 안쪽 `px-4` 가 그 여백을 되돌려 주므로 텍스트는 가장자리에 붙지 않는다.
 * 밴드에 테두리를 두지 않는 것이 핵심이다 — 갇힌 느낌은 테두리에서 온다.
 *
 * `TableHeader` 의 `bg-background` 는 그대로 둔다. 캔버스와 같은 색이라 헤더가
 * 페이지에 얹힌 라벨 줄로 읽히고, 그 아래 border-b 부터 흰 밴드가 시작된다.
 */
const PLAIN_BAND = '-mx-4 bg-card'
const PLAIN_BAND_INNER = 'px-4'

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
  /** 표면 (기본: DEFAULT_CONTENT_SURFACE) */
  surface?: ContentSurface
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
  surface = DEFAULT_CONTENT_SURFACE,
}: ContentCardProps) {
  const hasHeader = title || actions || header

  const headerInner = header || (
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
  )

  if (surface === 'plain') {
    return (
      <div
        className={cn(
          'flex flex-col',
          fullHeight && 'flex-1 min-h-0 overflow-hidden',
          className,
        )}
      >
        {hasHeader && (
          <div
            className={cn(
              CONTENT_SPACING.HEADER_PADDING_PLAIN,
              'flex flex-row items-center justify-between gap-2',
              fullHeight && 'flex-none',
            )}
          >
            {headerInner}
          </div>
        )}
        <div
          className={cn(
            PLAIN_BAND,
            fullHeight && 'flex-1 min-h-0 overflow-auto',
          )}
        >
          <div className={cn(PLAIN_BAND_INNER, contentClassName)}>{children}</div>
        </div>
      </div>
    )
  }

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
          {headerInner}
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
