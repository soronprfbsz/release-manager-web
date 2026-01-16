import { ReactNode } from 'react'

import { usePageIcon } from '@/shared/lib/hooks'

import { DynamicBreadcrumb } from './dynamic-breadcrumb'
import { PageHeader } from './page-header'

interface PageLayoutProps {
  /** 페이지 아이콘 (미지정 시 메뉴에서 자동으로 가져옴) */
  icon?: ReactNode
  /** 페이지 타이틀 (미지정 시 메뉴에서 자동으로 가져옴) */
  title?: string
  /** 페이지 설명 (미지정 시 메뉴에서 자동으로 가져옴) */
  description?: string
  /** 헤더 우측 액션 버튼 영역 */
  actions?: ReactNode
  children: ReactNode
}

export function PageLayout({
  icon: iconProp,
  title: titleProp,
  description: descriptionProp,
  actions,
  children,
}: PageLayoutProps) {
  const { icon: menuIcon, title: menuTitle, description: menuDescription } = usePageIcon()

  // props가 있으면 props 사용, 없으면 메뉴에서 가져온 값 사용
  const icon = iconProp ?? menuIcon
  const title = titleProp ?? menuTitle ?? ''
  const description = descriptionProp ?? menuDescription

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <DynamicBreadcrumb />

      {/* Page Header */}
      <PageHeader
        icon={icon}
        title={title}
        description={description}
        actions={actions}
      />

      {/* Content */}
      {children}
    </div>
  )
}
