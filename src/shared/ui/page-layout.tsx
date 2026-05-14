import { ReactNode } from 'react'

import { usePageIcon } from '@/shared/lib/hooks'

import { PageHeader } from './page-header'

interface PageLayoutProps {
  /** 페이지 아이콘 (Backstage 리디자인 이후 헤더에 미렌더링되나, 호환성 위해 prop 유지) */
  icon?: ReactNode
  /** 페이지 타이틀 (미지정 시 메뉴에서 자동으로 가져옴) */
  title?: string
  /** 페이지 설명 (미지정 시 메뉴에서 자동으로 가져옴) */
  description?: string
  /** 헤더 우측 액션 버튼 영역 */
  actions?: ReactNode
  children: ReactNode
}

/**
 * Backstage 리디자인 페이지 레이아웃.
 *  - Breadcrumb 은 Topbar (MainLayout) 가 책임 — 페이지에서 직접 렌더하지 않음
 *  - PageHeader 만 렌더 (테두리 없는 큰 타이틀 + 설명 + 액션)
 */
export function PageLayout({
  icon: iconProp,
  title: titleProp,
  description: descriptionProp,
  actions,
  children,
}: PageLayoutProps) {
  const { icon: menuIcon, title: menuTitle, description: menuDescription } = usePageIcon()

  // props 우선, 없으면 메뉴에서 자동 채움
  const icon = iconProp ?? menuIcon
  const title = titleProp ?? menuTitle ?? ''
  const description = descriptionProp ?? menuDescription

  return (
    <div className="space-y-6">
      <PageHeader
        icon={icon}
        title={title}
        description={description}
        actions={actions}
      />
      {children}
    </div>
  )
}
