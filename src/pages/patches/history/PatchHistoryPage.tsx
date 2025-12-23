/**
 * Patch History Page
 * 패치 이력 조회 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState } from 'react'

import { RefreshCw, Layers } from 'lucide-react'

import { getPageIconById } from '@/shared/config/menu-icons'

import { PatchHistoryTable } from '@/features/patch-management'

import { patchApi, usePatches, type CumulativePatch } from '@/entities/patch'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DynamicBreadcrumb } from '@/shared/ui/dynamic-breadcrumb'
import { PageHeader } from '@/shared/ui/page-header'
import { TypographyMuted } from '@/shared/ui/typography'

interface PaginationState {
  pageIndex: number
  pageSize: number
}

export function PatchHistoryPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const {
    data: patchData,
    isLoading,
    refetch,
  } = usePatches({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: 'createdAt,desc',
  })

  const handleDownload = (patch: CumulativePatch) => {
    patchApi.download(patch.patchId, `${patch.patchName}.zip`)
  }

  const patchList = patchData?.content || []
  const totalCount = patchData?.totalElements || 0

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <DynamicBreadcrumb />

      {/* Page Header */}
      <PageHeader
        icon={getPageIconById('patch_history')}
        title="패치 조회/다운로드"
        actions={
          <Button onClick={() => refetch()} variant="outline" size="icon" title="새로고침">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {/* Patch History Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              생성된 패치 목록
            </div>
            {totalCount > 0 && <TypographyMuted>총 {totalCount}개</TypographyMuted>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PatchHistoryTable
            patches={patchList}
            totalElements={totalCount}
            pagination={pagination}
            isLoading={isLoading}
            onPaginationChange={setPagination}
            onDownload={handleDownload}
          />
        </CardContent>
      </Card>
    </div>
  )
}
