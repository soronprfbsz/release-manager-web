/**
 * Terminal Page
 * 웹 터미널 페이지
 */

import { Terminal as TerminalIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { TerminalContainer } from '@/features/terminal-management'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { PageHeader } from '@/shared/ui/page-header'

export function TerminalPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>터미널</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<TerminalIcon className="h-5 w-5 text-primary" />}
        title="웹 터미널"
        description="서버에 직접 연결하여 명령을 실행할 수 있습니다."
      />

      {/* Terminal Container */}
      <TerminalContainer />
    </div>
  )
}
