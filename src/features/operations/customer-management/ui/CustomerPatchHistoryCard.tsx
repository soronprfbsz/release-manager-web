/**
 * Customer Patch History Card Component
 * 고객사 패치 이력 카드 컴포넌트
 */

import { useState } from 'react'

import { Package, FileBox, ChevronLeft, ChevronRight } from 'lucide-react'

import { usePatches } from '@/entities/patches/patch'
import type { Customer } from '@/entities/operations/customer'

import { formatDateTime } from '@/shared/lib/utils/date'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Loader2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

interface CustomerPatchHistoryCardProps {
  customer: Customer
}

const PAGE_SIZE = 5

export function CustomerPatchHistoryCard({ customer }: CustomerPatchHistoryCardProps) {
  const [page, setPage] = useState(0)

  // 해당 고객사의 패치 목록 조회 (페이징)
  const { data: patchesResponse, isLoading } = usePatches(
    {
      page,
      size: PAGE_SIZE,
      projectId: customer.project?.projectId,
      customerCode: customer.customerCode,
      sort: 'createdAt,desc',
    },
    {
      enabled: !!customer.project?.projectId,
    }
  )

  const patches = patchesResponse?.content ?? []
  const totalElements = patchesResponse?.totalElements ?? 0
  const totalPages = patchesResponse?.totalPages ?? 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            패치 이력
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {totalElements}건
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">로딩 중...</span>
          </div>
        ) : patches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileBox className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">패치 이력이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead >패치명</TableHead>
                    <TableHead className="w-[100px]">버전</TableHead>
                    <TableHead className="w-[100px]">담당자</TableHead>
                    <TableHead className="w-[180px] whitespace-nowrap">생성일시</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patches.map((patch) => (
                    <TableRow key={patch.patchId}>
                      <TableCell className="font-medium truncate max-w-[200px]">
                        {patch.patchName}
                      </TableCell>
                      <TableCell className="text-xs">
                        {patch.fromVersion} → {patch.toVersion}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {patch.assigneeName || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(patch.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  {page + 1} / {totalPages} 페이지
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
