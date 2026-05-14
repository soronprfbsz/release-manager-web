import { ReactNode } from 'react'

import { usePageIcon } from '@/shared/lib/hooks'
import { cn } from '@/shared/lib/utils'

import { PageHeader } from './page-header'

interface PageLayoutProps {
  /** 페이지 아이콘 — Backstage 헤더는 아이콘 미사용 (호환성용 prop) */
  icon?: ReactNode
  /** 페이지 타이틀 (미지정 시 메뉴에서 자동) */
  title?: string
  /** 페이지 설명 (미지정 시 메뉴에서 자동) */
  description?: string
  /** 헤더 우측 액션 영역 */
  actions?: ReactNode
  children: ReactNode
  /** 콘텐츠 영역에 추가 className */
  contentClassName?: string
  /**
   * Viewport-fill 모드.
   *  - **default (false)** = **자연 흐름**: 콘텐츠 자체 높이로 렌더, 페이지가 길어지면 main 이 스크롤
   *    카드 그리드 / 폼 / 테이블 / 대시보드 등 대부분의 페이지가 이쪽
   *  - **true** = viewport-fill: 콘텐츠 영역이 잔여 높이 차지, 자식이 h-full 로 채울 수 있음
   *    Tree+Detail 분할 (ContentSplit) / 터미널 / 큰 차트 보드 등 화면-바운드 페이지만
   *
   * 모던 SaaS 대시보드 (Vercel / GitHub / Stripe / Notion) 가 따르는 패턴:
   *   기본 자연 흐름 + 분할 화면 같은 특수 케이스만 viewport-fill 옵트인.
   */
  fullHeight?: boolean
}

/**
 * Backstage 리디자인 페이지 레이아웃.
 *
 *  ⟡ 기본 (자연 흐름) — 콘텐츠 카드가 자체 높이로 렌더링되고 페이지가 자연 스크롤:
 *  ```tsx
 *  <PageLayout title="계정 관리" actions={<Filters />}>
 *    <ContentCard>
 *      <Table>…</Table>
 *    </ContentCard>
 *  </PageLayout>
 *  ```
 *
 *  ⟡ fullHeight — Tree+Detail 분할 / 터미널 등 viewport-바운드:
 *  ```tsx
 *  <PageLayout fullHeight title="버전 관리">
 *    <ContentSplit>…</ContentSplit>     // h-full 로 잔여 채움
 *  </PageLayout>
 *  ```
 *
 *  좌우 padding `px-12` (48px) — 모든 페이지 일관.
 */
export function PageLayout({
  icon: iconProp,
  title: titleProp,
  description: descriptionProp,
  actions,
  children,
  contentClassName,
  fullHeight = false,
}: PageLayoutProps) {
  const { icon: menuIcon, title: menuTitle, description: menuDescription } = usePageIcon()

  const icon = iconProp ?? menuIcon
  const title = titleProp ?? menuTitle ?? ''
  const description = descriptionProp ?? menuDescription

  return (
    <div
      className={cn(
        'flex flex-col gap-6 px-12 py-7',
        // fullHeight: 정확히 viewport-bound — main 높이 = PageLayout 높이.
        // overflow-hidden 으로 PageLayout 이 main 을 넘어 자라지 못하도록 차단.
        // 결과: 내부 컨텐츠 (ContentSplit) 가 잔여 높이를 모두 차지하고 패널마다
        //       내부 스크롤로 오버플로우 처리. main 자체는 스크롤 안 함.
        fullHeight && 'h-full overflow-hidden',
      )}
    >
      <PageHeader
        icon={icon}
        title={title}
        description={description}
        actions={actions}
      />
      {fullHeight ? (
        <div className={cn('flex-1 min-h-0 flex flex-col gap-6', contentClassName)}>
          {children}
        </div>
      ) : contentClassName ? (
        <div className={contentClassName}>{children}</div>
      ) : (
        children
      )}
    </div>
  )
}
