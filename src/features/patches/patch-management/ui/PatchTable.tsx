/**
 * Patch Table Component
 * 패치 목록 테이블 컴포넌트
 */

import { useState } from 'react'

import {
  ArrowRight,
  Download,
  Eye,
  FolderArchive,
  Hammer,
  Info,
  Tag,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

import type { CumulativePatch } from '@/entities/patches/patch'

import { cn } from '@/shared/lib/utils'
import { formatDateTime } from '@/shared/lib/utils/date'
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

  const handleOpenDetail = (patchId: number) => {
    setSelectedDetailPatchId(patchId)
    setDetailSheetOpen(true)
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="ml-1 max-w-[200px] cursor-default"
                        >
                          <Hammer className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{patch.includedBuildsSummary}</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{patch.includedBuildsSummary}</TooltipContent>
                    </Tooltip>
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
    </>
  )
}
