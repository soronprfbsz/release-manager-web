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
}

/**
 * Backstage redesign 페이지 레이아웃.
 *
 *  ⟡ Flex chain — `min-h-full flex flex-col`. 부모(`<main>`) 가 overflow-auto 이고
 *    이 컴포넌트가 최소 뷰포트 높이를 차지하므로:
 *      - 콘텐츠가 짧으면 → 페이지가 viewport 하단까지 자연스럽게 채워짐
 *      - 콘텐츠가 길면  → main 이 스크롤
 *  ⟡ children 은 `flex-1 min-h-0` 영역 안에 렌더 → 내부 컴포넌트에 `h-full` 만 주면
 *    자동으로 viewport-남은-공간 만큼 채워짐 (ContentSplit, DataTable 등).
 *  ⟡ 좌우 padding `px-10` (40px) — Backstage 시안의 res-content 와 동등.
 *
 *  사용 패턴:
 *  ```tsx
 *  <PageLayout title="버전 관리" actions={<Buttons />}>
 *    <ContentSplit className="h-full">…</ContentSplit>   // viewport 채움
 *  </PageLayout>
 *
 *  // 또는 자연 흐름 (대시보드 등):
 *  <PageLayout title="홈">
 *    <div className="grid grid-cols-3 gap-4">…</div>      // 자연 높이
 *  </PageLayout>
 *  ```
 */
export function PageLayout({
  icon: iconProp,
  title: titleProp,
  description: descriptionProp,
  actions,
  children,
  contentClassName,
}: PageLayoutProps) {
  const { icon: menuIcon, title: menuTitle, description: menuDescription } = usePageIcon()

  const icon = iconProp ?? menuIcon
  const title = titleProp ?? menuTitle ?? ''
  const description = descriptionProp ?? menuDescription

  return (
    <div className="min-h-full flex flex-col gap-6 px-10 py-7">
      <PageHeader
        icon={icon}
        title={title}
        description={description}
        actions={actions}
      />
      <div className={cn('flex-1 min-h-0 flex flex-col', contentClassName)}>
        {children}
      </div>
    </div>
  )
}
