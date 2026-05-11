/**
 * Patch Table Component
 * 패치 목록 테이블 컴포넌트
 */

import { useState } from 'react'

import {
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  FolderArchive,
  Info,
  Loader2,
  Tag,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

import { useCompletePatch, type CumulativePatch } from '@/entities/patches/patch'

import { cn } from '@/shared/lib/utils'
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
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTable } from '@/shared/ui/data-table'
import { EmptyState } from '@/shared/ui/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  SortableTableHead,
} from '@/shared/ui/table'
import {
  TableActionMenu,
  TableActionMenuItem,
  TableActionMenuSeparator,
} from '@/shared/ui/table-action-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TruncatedCell } from '@/shared/ui/truncated-cell'
import { TypographyInlineCode, TypographyMuted } from '@/shared/ui/typography'
import { UserAvatar } from '@/shared/ui/user-avatar'
import { useToast } from '@/shared/lib/hooks/use-toast'

import { PatchDetailSheet } from './PatchDetailSheet'
import type { SortConfig } from '../model/types'

interface PatchTableProps {
  patches: CumulativePatch[]
  sort: SortConfig | null
  isDeleting?: boolean
  showDelete?: boolean
  onSort: (key: string) => void
  onViewFiles: (patch: CumulativePatch) => void
  onDownload: (patch: CumulativePatch) => void
  onDelete: (patch: CumulativePatch) => void
  /** 뷰포트 기반 동적 높이 (e.g. "calc(100vh - 28rem)") */
  viewportHeight?: string
  /** EmptyState에 사용할 아이콘 */
  emptyIcon?: LucideIcon
  /** 선택 모드 활성화 여부 */
  selectable?: boolean
  /** 선택된 패치 ID 목록 */
  selectedIds?: number[]
  /** 선택 변경 핸들러 */
  onSelectionChange?: (ids: number[]) => void
}

export function PatchTable({
  patches,
  sort,
  isDeleting,
  showDelete = true,
  onSort,
  onViewFiles,
  onDownload,
  onDelete,
  viewportHeight,
  emptyIcon: EmptyIcon = Tag,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: PatchTableProps) {
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [selectedDetailPatchId, setSelectedDetailPatchId] = useState<number | null>(null)
  /** 완료 처리 확인 다이얼로그 대상 patch */
  const [completeTarget, setCompleteTarget] = useState<CumulativePatch | null>(null)

  const { toast } = useToast()
  const completeMutation = useCompletePatch()

  const handleOpenDetail = (patchId: number) => {
    setSelectedDetailPatchId(patchId)
    setDetailSheetOpen(true)
  }

  /** 패치 완료 처리 확인 */
  const handleCompleteConfirm = () => {
    if (!completeTarget) return
    completeMutation.mutate(completeTarget.patchId, {
      onSuccess: () => {
        toast({
          title: '패치 완료 처리 완료',
          description: `${completeTarget.patchName} 패치가 완료 처리되었습니다.`,
        })
        setCompleteTarget(null)
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: '패치 완료 처리 실패',
          description: error instanceof Error ? error.message : '완료 처리 중 오류가 발생했습니다.',
        })
      },
    })
  }

  const allSelected = selectable && patches.length > 0 && selectedIds.length === patches.length
  const someSelected = selectable && selectedIds.length > 0 && selectedIds.length < patches.length

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange(patches.map((p) => p.patchId))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectOne = (patchId: number, checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange([...selectedIds, patchId])
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== patchId))
    }
  }

  if (patches.length === 0) {
    return (
      <EmptyState
        icon={EmptyIcon}
        title="생성된 패치가 없습니다."
        description="패치 생성 버튼을 눌러 새 패치를 생성하세요."
      />
    )
  }

  return (
    <>
    <DataTable viewportHeight={viewportHeight}>
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-8">
                <div className="flex justify-center">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={handleSelectAll}
                    aria-label="모두 선택"
                  />
                </div>
              </TableHead>
            )}
            <TableHead className="w-16 text-right">No</TableHead>
            <SortableTableHead
              className="w-[32rem]"
              id="patchName"
              currentSort={sort}
              onSort={onSort}
            >
              패치명
            </SortableTableHead>
            <TableHead className="">설명</TableHead>
            <TableHead className="w-28">버전 범위</TableHead>
            <SortableTableHead
              className="w-40"
              id="customerName"
              currentSort={sort}
              onSort={onSort}
            >
              고객사
            </SortableTableHead>
            <SortableTableHead
              className="w-44"
              id="assigneeName"
              currentSort={sort}
              onSort={onSort}
            >
              담당자
            </SortableTableHead>
            <SortableTableHead
              className="w-44"
              id="createdBy"
              currentSort={sort}
              onSort={onSort}
            >
              생성자
            </SortableTableHead>
            <SortableTableHead
              className="w-40"
              id="createdAt"
              currentSort={sort}
              onSort={onSort}
            >
              생성일시
            </SortableTableHead>
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patches.map((patch) => (
            <TableRow key={patch.patchId}>
              {selectable && (
                <TableCell>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={selectedIds.includes(patch.patchId)}
                      onCheckedChange={(checked) => handleSelectOne(patch.patchId, checked === true)}
                      aria-label={`${patch.patchName} 선택`}
                    />
                  </div>
                </TableCell>
              )}
              <TableCell className="text-right text-muted-foreground">
                {patch.rowNumber}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <FolderArchive className="h-4 w-4 text-muted-foreground" />
                    <TypographyInlineCode className="bg-transparent font-normal">
                      {patch.patchName}
                    </TypographyInlineCode>
                  </div>
                  {patch.isBuildIncluded && patch.includedBuildsSummary && (
                    <div className="flex gap-1 ml-1 items-center">
                      {patch.includedBuildsSummary.split(',').map((token) => {
                        const trimmed = token.trim()
                        if (!trimmed) return null
                        return (
                          <Badge
                            key={trimmed}
                            variant={trimmed.toLowerCase() as 'web' | 'engine'}
                            className="text-[10px] px-1 py-0 h-4 leading-none"
                          >
                            {trimmed}
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                  {patch.isBuildOnly && (
                    <Badge variant="secondary" className="ml-1">Build-only</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {patch.description ? (
                  <TruncatedCell
                    tooltipText={patch.description}
                    maxLines={2}
                    className="text-muted-foreground"
                  >
                    {patch.description}
                  </TruncatedCell>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <TypographyInlineCode className="bg-transparent text-xs">
                    {patch.fromVersion}
                  </TypographyInlineCode>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <TypographyInlineCode className="bg-transparent text-xs font-medium">
                    {patch.toVersion}
                  </TypographyInlineCode>
                </div>
              </TableCell>
              <TableCell>
                {patch.customerName ? (
                  <div>
                    <div>{patch.customerName}</div>
                    <TypographyMuted className="text-sm">
                      ({patch.customerCode})
                    </TypographyMuted>
                  </div>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                {patch.assigneeEmail ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-default">
                        <UserAvatar
                          email={patch.assigneeEmail}
                          avatarStyle={patch.assigneeAvatarStyle}
                          avatarSeed={patch.assigneeAvatarSeed}
                          isDeleted={patch.isDeletedAssignee}
                          size={24}
                        />
                        <span className={cn('text-sm', patch.isDeletedAssignee && 'text-muted-foreground')}>
                          {patch.assigneeName || patch.assigneeEmail}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {patch.isDeletedAssignee ? '삭제된 사용자' : patch.assigneeEmail}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-default">
                      <UserAvatar
                        email={patch.createdByEmail}
                        avatarStyle={patch.createdByAvatarStyle}
                        avatarSeed={patch.createdByAvatarSeed}
                        isDeleted={patch.isDeletedCreator}
                        size={24}
                      />
                      <span className={cn('text-sm', patch.isDeletedCreator && 'text-muted-foreground')}>
                        {patch.createdByName || patch.createdByEmail}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {patch.isDeletedCreator ? '삭제된 사용자' : patch.createdByEmail}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <TypographyMuted>{formatDateTime(patch.createdAt)}</TypographyMuted>
              </TableCell>
              <TableCell>
                <TableActionMenu>
                  <TableActionMenuItem onClick={() => handleOpenDetail(patch.patchId)}>
                    <Info className="mr-2 h-4 w-4" />
                    상세 보기
                  </TableActionMenuItem>
                  <TableActionMenuSeparator />
                  <TableActionMenuItem onClick={() => onViewFiles(patch)}>
                    <Eye className="mr-2 h-4 w-4" />
                    파일 보기
                  </TableActionMenuItem>
                  <TableActionMenuItem onClick={() => onDownload(patch)}>
                    <Download className="mr-2 h-4 w-4" />
                    다운로드
                  </TableActionMenuItem>
                  <TableActionMenuSeparator />
                  <TableActionMenuItem
                    onClick={() => setCompleteTarget(patch)}
                    disabled={completeMutation.isPending}
                    className="text-green-600 focus:text-green-600"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    패치 완료
                  </TableActionMenuItem>
                  {showDelete && (
                    <>
                      <TableActionMenuSeparator />
                      <TableActionMenuItem
                        onClick={() => onDelete(patch)}
                        disabled={isDeleting}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </TableActionMenuItem>
                    </>
                  )}
                </TableActionMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTable>

    <PatchDetailSheet
      open={detailSheetOpen}
      onOpenChange={setDetailSheetOpen}
      patchId={selectedDetailPatchId}
    />

    {/* 패치 완료 처리 확인 다이얼로그 */}
    <AlertDialog
      open={!!completeTarget}
      onOpenChange={(open) => {
        if (!open && !completeMutation.isPending) setCompleteTarget(null)
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>패치 완료 처리</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>이 패치를 완료 처리하시겠습니까?</p>
              <div className="rounded-md border bg-muted/50 px-4 py-3 space-y-1.5">
                <p className="text-foreground font-medium">완료 후 다음이 진행됩니다:</p>
                <ul className="list-disc list-inside space-y-1">
                  {completeTarget?.customerName && (
                    <li>
                      사이트 (<span className="text-foreground font-medium">{completeTarget.customerName}</span>)의
                      최신 버전이{' '}
                      <span className="font-mono text-foreground">{completeTarget?.toVersion}</span>
                      {' '}으로 갱신
                    </li>
                  )}
                  <li>패치 파일이 자동 삭제 (패치 관리에서 사라짐)</li>
                  <li>패치 이력 / 버전 이력에 영구 보존</li>
                </ul>
              </div>
              <p className="text-destructive font-medium">되돌릴 수 없습니다.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={completeMutation.isPending}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCompleteConfirm}
            disabled={completeMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {completeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리중...
              </>
            ) : (
              '완료 처리'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
