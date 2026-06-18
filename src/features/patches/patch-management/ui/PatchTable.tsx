/**
 * Patch Table Component
 * 패치 목록 테이블 컴포넌트
 */

import { useState } from 'react'

import {
  CheckCircle2,
  Download,
  Info,
  Loader2,
  Package,
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
  emptyIcon: EmptyIcon = Tag,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}: PatchTableProps) {
  /** 완료 처리 확인 다이얼로그 대상 patch */
  const [completeTarget, setCompleteTarget] = useState<CumulativePatch | null>(null)

  const { toast } = useToast()
  const completeMutation = useCompletePatch()
  // 모든 인증된 역할(USER 포함)이 패치 완료/삭제 가능
  const canActOnPatch = (_patch: CumulativePatch): boolean => true

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
    <DataTable autoHeight>
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
            <TableHead className="w-56">설명</TableHead>
            <TableHead className="w-40">버전 범위</TableHead>
            <SortableTableHead
              className="w-56"
              id="customerName"
              currentSort={sort}
              onSort={onSort}
            >
              고객사
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
              <TableCell className="text-right">
                <span className="font-mono text-xs text-muted-foreground">
                  {patch.rowNumber}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <TypographyInlineCode className="bg-transparent font-mono text-sm font-normal leading-none truncate">
                    {patch.patchName}
                  </TypographyInlineCode>
                  {patch.isBuildIncluded && patch.includedBuildsSummary &&
                    patch.includedBuildsSummary.split(',').map((token) => {
                      const trimmed = token.trim().toUpperCase()
                      if (!trimmed) return null
                      const variantMap: Record<string, 'web' | 'engine' | 'database' | 'etc'> = {
                        WEB: 'web',
                        ENGINE: 'engine',
                        DB: 'database',
                        DATABASE: 'database',
                      }
                      const variant = variantMap[trimmed] ?? 'etc'
                      return (
                        <Badge
                          key={trimmed}
                          variant={variant}
                          size="sm"
                          className="shrink-0"
                        >
                          {trimmed}
                        </Badge>
                      )
                    })}
                  {patch.isBuildOnly && (
                    <Badge variant="etc" size="sm" className="shrink-0">
                      Build-only
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {patch.description ? (
                  <TruncatedCell
                    tooltipText={patch.description}
                    maxLines={2}
                    className="text-sm text-muted-foreground"
                  >
                    {patch.description}
                  </TruncatedCell>
                ) : (
                  <TypographyMuted className="text-sm">—</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                {patch.fromVersion} → {patch.toVersion}
              </TableCell>
              <TableCell>
                {patch.customerName ? (
                  <div className="space-y-0.5">
                    <div className="text-sm">{patch.customerName}</div>
                    <TypographyMuted className="text-xs">
                      {patch.customerCode}
                    </TypographyMuted>
                  </div>
                ) : (
                  <TypographyMuted className="text-sm">—</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-default">
                      <UserAvatar
                        email={patch.createdByEmail}
                        accountName={patch.createdByName}
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
                <span className="font-mono text-xs">{formatDateTime(patch.createdAt)}</span>
              </TableCell>
              <TableCell>
                <TableActionMenu>
                  <TableActionMenuItem onClick={() => onViewFiles(patch)}>
                    <Info className="mr-2 h-4 w-4" />
                    상세 보기
                  </TableActionMenuItem>
                  <TableActionMenuItem onClick={() => onDownload(patch)}>
                    <Download className="mr-2 h-4 w-4" />
                    다운로드
                  </TableActionMenuItem>
                  {/* 패치 완료: 본인 생성(또는 OPERATOR↑) + 고객사가 지정된 패치만 */}
                  {canActOnPatch(patch) && patch.customerCode && (
                    <>
                      <TableActionMenuSeparator />
                      <TableActionMenuItem
                        onClick={() => setCompleteTarget(patch)}
                        disabled={completeMutation.isPending}
                        className="text-green-600 focus:text-green-600"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        패치 완료
                      </TableActionMenuItem>
                    </>
                  )}
                  {/* 삭제: showDelete prop (페이지 권한) + 본인 생성(또는 OPERATOR↑) */}
                  {showDelete && canActOnPatch(patch) && (
                    <>
                      {!patch.customerCode && <TableActionMenuSeparator />}
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
              <p>
                이 패치 파일을{' '}
                {completeTarget?.customerName && (
                  <>
                    <span className="text-foreground font-medium">{completeTarget.customerName}</span>{' '}
                  </>
                )}
                사이트에 실제로 적용하셨습니까?
                <br />
                적용이 완료된 경우에만 <span className="text-foreground font-medium">‘완료 처리’</span> 를 진행해 주세요.
              </p>
              <div className="rounded-md border bg-muted/50 px-4 py-3 space-y-1.5">
                <p className="text-foreground font-medium">완료 처리 시 다음이 진행됩니다:</p>
                <ul className="list-disc list-inside space-y-1">
                  {completeTarget?.customerName && (
                    <li>
                      사이트의 최신 버전이{' '}
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
            onClick={(e) => {
              // Radix 기본 동작(클릭 즉시 모달 닫힘)을 막아 완료 처리까지 모달을 유지한다.
              e.preventDefault()
              handleCompleteConfirm()
            }}
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
