/**
 * Customer Patch History Card Component
 * 고객사 패치 이력 카드 컴포넌트
 */

import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import {
  Package,
  FileBox,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Loader2,
} from 'lucide-react'

import {
  usePatchHistories,
  useDeletePatchHistory,
  patchKeys,
  type CumulativePatch,
} from '@/entities/patches/patch'
import type { Customer } from '@/entities/operations/customer'

import { usePermission } from '@/shared/lib/hooks/use-permission'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { formatDateTime } from '@/shared/lib/utils/date'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
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
  const [deleteTarget, setDeleteTarget] = useState<CumulativePatch | null>(null)

  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { canDeletePatch } = usePermission()
  const deleteMutation = useDeletePatchHistory()

  // 해당 고객사의 패치 이력 조회 (페이징)
  const { data: patchesResponse, isLoading } = usePatchHistories(
    {
      page,
      size: pageSize,
      projectId: customer.project?.projectId ?? '',
      customerId: customer.customerId,
      sort: 'createdAt,desc',
    },
    {
      enabled: !!customer.project?.projectId && !!customer.customerId,
    }
  )

  const patches = patchesResponse?.content ?? []
  const totalElements = patchesResponse?.totalElements ?? 0
  const totalPages = patchesResponse?.totalPages ?? 0

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setPage(0) // 페이지 크기 변경 시 첫 페이지로 이동
  }

  const handleDelete = () => {
    if (!deleteTarget) return

    deleteMutation.mutate(deleteTarget.patchId, {
      onSuccess: () => {
        toast({
          title: '삭제 완료',
          description: '패치 이력이 삭제되었습니다.',
        })
        // 패치 이력 목록 갱신
        queryClient.invalidateQueries({ queryKey: patchKeys.histories() })
        setDeleteTarget(null)
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: '삭제 실패',
          description: '패치 이력 삭제에 실패했습니다.',
        })
      },
    })
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
            총 {totalElements}건
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
                      <TableHead className="w-[120px]">버전</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead className="w-[100px]">담당자</TableHead>
                      <TableHead className="w-[160px] whitespace-nowrap">생성일시</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patches.map((patch) => (
                      <TableRow key={patch.patchId}>
                        <TableCell className="text-center text-muted-foreground text-sm">
                          {patch.rowNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <span className="truncate max-w-[250px]">{patch.patchName}</span>
                            {canDeletePatch && (
                              <button
                                type="button"
                                className="p-1 flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                                onClick={() => setDeleteTarget(patch)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
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

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>패치 이력 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deleteTarget?.patchName}</span>
              {' '}패치 이력을 삭제하시겠습니까?
              <br />
              삭제된 이력은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
