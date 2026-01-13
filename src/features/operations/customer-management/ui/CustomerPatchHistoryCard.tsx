/**
 * Customer Patch History Card Component
 * 고객사 패치 이력 카드 컴포넌트
 */

import { useState } from 'react'

import {
  Package,
  FileBox,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { usePatches } from '@/entities/patches/patch'
import type { Customer } from '@/entities/operations/customer'

import { formatDateTime } from '@/shared/lib/utils/date'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface CustomerPatchHistoryCardProps {
  customer: Customer
}

const PAGE_SIZE_OPTIONS = [5, 10, 20]
const DEFAULT_PAGE_SIZE = 5

export function CustomerPatchHistoryCard({ customer }: CustomerPatchHistoryCardProps) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // 해당 고객사의 패치 목록 조회 (페이징)
  const { data: patchesResponse, isLoading } = usePatches(
    {
      page,
      size: pageSize,
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

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setPage(0) // 페이지 크기 변경 시 첫 페이지로 이동
  }

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
              <ScrollArea className="max-h-[250px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px] text-center">No</TableHead>
                      <TableHead className="w-[300px]">패치명</TableHead>
                      <TableHead className="w-[100px]">버전</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead className="w-[80px]">담당자</TableHead>
                      <TableHead className="w-[160px] whitespace-nowrap">생성일시</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patches.map((patch) => (
                      <TableRow key={patch.patchId}>
                        <TableCell className="text-center text-muted-foreground text-sm">
                          {patch.rowNumber}
                        </TableCell>
                        <TableCell className="font-medium truncate max-w-[180px]">
                          {patch.patchName}
                        </TableCell>
                        <TableCell className="text-xs">
                          {patch.fromVersion} → {patch.toVersion}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {patch.description ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block truncate max-w-[150px] cursor-default">
                                  {patch.description}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-[300px] whitespace-pre-wrap">{patch.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            '-'
                          )}
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
              </ScrollArea>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  페이지 당 항목 수
                </span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="h-7 w-[70px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Page {page + 1} of {totalPages || 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
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
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
