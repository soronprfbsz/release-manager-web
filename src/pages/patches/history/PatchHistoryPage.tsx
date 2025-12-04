import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layers, Download, RefreshCw, Calendar, User, ArrowRight, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DataTable } from '@/shared/ui/data-table'
import { TypographyInlineCode, TypographyMuted } from '@/shared/ui/typography'
import { patchApi, type CumulativePatch } from '@/entities/patch'

interface PaginationState {
  pageIndex: number
  pageSize: number
}


function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

import { DataTablePagination } from '@/shared/ui/data-table-pagination'

export function PatchHistoryPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data: patchData, isLoading, refetch } = useQuery({
    queryKey: ['cumulative-patches', pagination],
    queryFn: () => patchApi.getList({
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sort: 'createdAt,desc'
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              생성된 패치 목록
            </div>
            {totalCount > 0 && (
              <TypographyMuted>
                총 {totalCount}개
              </TypographyMuted>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : patchList.length > 0 ? (
            <>
              <DataTable>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">ID</TableHead>
                      <TableHead className="w-48">패치명</TableHead>
                      <TableHead className="w-48">버전 범위</TableHead>
                      <TableHead className="w-24 text-center">릴리즈</TableHead>
                      <TableHead className="w-32">생성자</TableHead>
                      <TableHead className="w-56">생성일시</TableHead>
                      <TableHead className="w-20 text-center">다운로드</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patchList.map((patch) => (
                      <TableRow key={patch.patchId}>
                        <TableCell className="text-center text-muted-foreground">
                          {patch.patchId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <TypographyInlineCode className="bg-transparent">{patch.patchName}</TypographyInlineCode>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypographyInlineCode className="bg-transparent">{patch.fromVersion}</TypographyInlineCode>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <TypographyInlineCode className="bg-transparent font-medium">{patch.toVersion}</TypographyInlineCode>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {patch.releaseType === 'STANDARD' ? '표준' : patch.customerCode || '커스텀'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {patch.createdBy}
                          </div>
                        </TableCell>
                        <TableCell>
                          <TypographyMuted className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(patch.createdAt)}
                          </TypographyMuted>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(patch)}
                            title="다운로드"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataTable>
              <div className="pt-4">
                <DataTablePagination
                  pageIndex={pagination.pageIndex}
                  pageSize={pagination.pageSize}
                  totalElements={totalCount}
                  onPaginationChange={setPagination}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Layers className="h-12 w-12 mb-3 opacity-50" />
              <TypographyMuted>생성된 패치가 없습니다.</TypographyMuted>
              <TypographyMuted>패치 생성 메뉴에서 패치를 생성해보세요.</TypographyMuted>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
