import { ReactNode, Fragment } from 'react'

import { Link } from 'react-router-dom'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb'
import { PageHeader } from './page-header'

export interface BreadcrumbItemType {
  label: string
  href?: string
  isCurrentPage?: boolean
}

interface PageLayoutProps {
  breadcrumbs: BreadcrumbItemType[]
  icon: ReactNode
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

export function PageLayout({
  breadcrumbs,
  icon,
  title,
  description,
  actions,
  children,
}: PageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.isCurrentPage ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : item.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span>{item.label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

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
