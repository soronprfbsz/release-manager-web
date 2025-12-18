import { ReactNode } from 'react'

import { DynamicBreadcrumb } from './dynamic-breadcrumb'
import { PageHeader } from './page-header'

interface PageLayoutProps {
  icon: ReactNode
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function PageLayout({
  icon,
  title,
  description,
  actions,
  children,
}: PageLayoutProps) {
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
