/**
 * Customer Version History Card Component
 * 고객사 버전 이력 카드 컴포넌트 — 패치 완료 시 갱신된 버전 이력을 표시
 */

import { useState } from 'react'

import {
  History,
  FileBox,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react'

import type { Customer } from '@/entities/operations/customer'
import { usePatchHistories } from '@/entities/patches/patch'

import { formatDateTime } from '@/shared/lib/utils/date'
import { Button } from '@/shared/ui/button'
import { CollapsibleSection } from '@/shared/ui/collapsible-section'
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

interface CustomerVersionHistoryCardProps {
  customer: Customer
}

const PAGE_SIZE_OPTIONS = [5, 10, 20]
const DEFAULT_PAGE_SIZE = 5

export function CustomerVersionHistoryCard({ customer }: CustomerVersionHistoryCardProps) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // 패치 완료 일시 기준 내림차순 정렬로 버전 이력 조회
  const { data: historiesResponse, isLoading } = usePatchHistories(
    {
      page,
      size: pageSize,
      projectId: customer.project?.projectId ?? '',
      customerId: customer.customerId,
      sort: 'completedAt,desc',
    },
    {
      enabled: !!customer.project?.projectId && !!customer.customerId,
    }
  )

  const histories = historiesResponse?.content ?? []
  const totalElements = historiesResponse?.totalElements ?? 0
  const totalPages = historiesResponse?.totalPages ?? 0

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setPage(0) // 페이지 크기 변경 시 첫 페이지로 이동
  }

  return (
    <CollapsibleSection
      icon={History}
      title="버전 이력"
      subtitle={`총 ${totalElements}건`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm">로딩 중...</span>
        </div>
      ) : histories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <FileBox className="h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">버전 이력이 없습니다.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 whitespace-nowrap">적용 일시</TableHead>
                <TableHead className="">적용 버전</TableHead>
                <TableHead className="w-52">적용 담당자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {histories.map((history) => (
                <TableRow key={history.historyId ?? history.patchId}>
                  {/* 적용 일시 (completedAt) — KST 포맷 */}
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-3">
                    {history.completedAt ? formatDateTime(history.completedAt) : '-'}
                  </TableCell>

                  {/* 적용 버전 (toVersion, fullVersion 그대로) */}
                  <TableCell className="font-mono text-sm py-3">
                    {history.toVersion}
                  </TableCell>

                  {/* 적용 담당자 (completedBy) */}
                  <TableCell className="text-sm text-muted-foreground py-3">
                    {history.completedBy ?? '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between mt-4">
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
    </CollapsibleSection>
  )
}
