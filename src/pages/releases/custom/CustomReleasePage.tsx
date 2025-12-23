import { GitBranch, Construction } from 'lucide-react'

import { getPageIconById } from '@/shared/config/menu-icons'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DynamicBreadcrumb } from '@/shared/ui/dynamic-breadcrumb'
import { PageHeader } from '@/shared/ui/page-header'

export function CustomReleasePage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <DynamicBreadcrumb />

      {/* Page Header */}
      <PageHeader
        icon={getPageIconById('version_custom')}
        title="버전 관리 (Custom)"
      />

      {/* 준비 중 안내 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Custom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Construction className="h-16 w-16 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">준비 중입니다</h3>
            <p className="text-sm text-center max-w-md">
              커스텀 버전 관리 기능은 개발 중입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
