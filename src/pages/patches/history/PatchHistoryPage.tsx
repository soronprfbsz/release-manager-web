/**
 * Patch History Page
 * 패치 이력 조회 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Layers, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PatchHistoryTable } from '@/features/patch-management'

import { patchApi, type CumulativePatch } from '@/entities/patch'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
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
  } = useQuery({
    queryKey: ['cumulative-patches', pagination],
    queryFn: () =>
      patchApi.getList({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        sort: 'createdAt,desc',
      }),
  })

  const handleDownload = (patch: CumulativePatch) => {
    patchApi.download(patch.patchId, `${patch.patchName}.zip`)
  }

  const patchList = patchData?.content || []
  const totalCount = patchData?.totalElements || 0

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
            <span>패치 관리</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>패치 조회/다운로드</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Layers className="h-5 w-5 text-primary" />}
        title="패치 조회/다운로드"
        description="생성된 모든 패치 이력을 조회하고 다운로드할 수 있습니다."
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
