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
  UserX,
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
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
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
  const { canDeletePatchHistory } = usePermission()
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

    // 패치 이력 삭제 시 historyId 사용 (historyId가 없으면 patchId 사용)
    const historyId = deleteTarget.historyId ?? deleteTarget.patchId
    deleteMutation.mutate(historyId, {
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
    <>
      <CollapsibleSection
        icon={Package}
        title="패치 이력"
        subtitle={`총 ${totalElements}건`}
      >
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-right">No</TableHead>
                  <TableHead className="w-72">패치명</TableHead>
                  <TableHead className="w-24">버전</TableHead>
                  <TableHead className="">설명</TableHead>
                  <TableHead className="w-52">담당자</TableHead>
                  <TableHead className="w-52">생성자</TableHead>
                  <TableHead className="w-36 whitespace-nowrap">생성일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patches.map((patch) => (
                  <TableRow key={patch.historyId ?? patch.patchId}>
                    <TableCell className="text-right text-muted-foreground text-sm py-3">
                      {patch.rowNumber}
                    </TableCell>
                    <TableCell className="font-medium py-3">
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-48">{patch.patchName}</span>
                        {canDeletePatchHistory && (
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
                    <TableCell className="text-xs py-3">
                      {patch.fromVersion} → {patch.toVersion}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-3">
                      {patch.description ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate max-w-40 cursor-default">
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
                    <TableCell className="py-3">
                      {patch.assigneeEmail ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-default">
                              {patch.isDeletedAssignee ? (
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                  <UserX className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                              ) : (
                                <DiceBearAvatar
                                  style={(patch.assigneeAvatarStyle as AvatarStyleKey) || 'initials'}
                                  seed={patch.assigneeAvatarSeed || patch.assigneeEmail}
                                  size={24}
                                  name={patch.assigneeName || patch.assigneeEmail}
                                />
                              )}
                              <span className="text-sm truncate max-w-40">
                                {patch.assigneeName || patch.assigneeEmail}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{patch.isDeletedAssignee ? '삭제된 사용자' : patch.assigneeEmail}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-default">
                            {patch.isDeletedCreator ? (
                              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <UserX className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                            ) : (
                              <DiceBearAvatar
                                style={(patch.createdByAvatarStyle as AvatarStyleKey) || 'initials'}
                                seed={patch.createdByAvatarSeed || patch.createdByEmail}
                                size={24}
                                name={patch.createdByName || patch.createdByEmail}
                              />
                            )}
                            <span className="text-sm truncate max-w-40">
                              {patch.createdByName || patch.createdByEmail}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{patch.isDeletedCreator ? '삭제된 사용자' : patch.createdByEmail}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-3">
                      {formatDateTime(patch.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
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
    </>
  )
}
