import { useState, useMemo } from 'react'

import {
    RotateCw,
    Database,
    RefreshCw,
    Plus,
    Trash2,
    FileX,
    Ban,
    FileCheck,
    ChevronDown,
    ScanSearch,
    ListX,
    RotateCcw,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import {
    useAnalyzeFileSync,
    useApplyFileSync,
    useIgnoredFiles,
    useRestoreIgnoredFile,
    useRegisterResourceFiles,
    useRegisterBackupFiles,
    useRegisterPatchFiles,
    useRegisterReleaseFiles,
    ResourceRegisterForm,
    BackupRegisterForm,
    PatchRegisterForm,
    ReleaseRegisterForm,
    type FileSyncResult,
    type FileSyncActionType,
    type FileSyncStatus,
    type FileSyncTarget,
    type ResourceRegisterItem,
    type BackupRegisterItem,
    type PatchRegisterItem,
    type ReleaseRegisterItem,
} from '@/features/operations/file-sync'

import { useCodesByType, CODE_TYPE } from '@/entities/_shared/code'

import { formatDateTime } from '@/shared/lib/utils/date'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { TabbedContentCard } from '@/shared/ui/content-layout'
import { DataTable } from '@/shared/ui/data-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageLayout } from '@/shared/ui/page-layout'
import { StatusBadge } from '@/shared/ui/status-badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TruncatedText,
} from '@/shared/ui/table'
import {
    TableActionMenu,
    TableActionMenuItem,
    TableActionMenuSeparator,
} from '@/shared/ui/table-action-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyMuted } from '@/shared/ui/typography'



// 바이트 포맷팅
const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}


// Status 한글 변환 및 variant (테마 기반 색상 사용)
type ThemeVariant = 'theme-1' | 'theme-2' | 'theme-3' | 'theme-4' | 'theme-5'
const getStatusConfig = (status: FileSyncStatus): { label: string; variant: ThemeVariant } => {
    switch (status) {
        case 'UNREGISTERED':
            return { label: '미등록', variant: 'theme-1' }
        case 'SIZE_MISMATCH':
            return { label: 'SIZE_MISMATCH', variant: 'theme-2' }
        case 'CHECKSUM_MISMATCH':
            return { label: '체크섬 불일치', variant: 'theme-2' }
        case 'FILE_MISSING':
            return { label: '파일 누락', variant: 'theme-3' }
        case 'DB_MISSING':
            return { label: 'DB 누락', variant: 'theme-4' }
        case 'METADATA_MISMATCH':
            return { label: '메타데이터 불일치', variant: 'theme-5' }
        default:
            return { label: status, variant: 'theme-1' }
    }
}

// 상태에 따라 사용 가능한 액션 목록 반환
const getAvailableActions = (status: FileSyncStatus): FileSyncActionType[] => {
    switch (status) {
        case 'UNREGISTERED':
        case 'DB_MISSING':
            return ['REGISTER', 'DELETE_FILE', 'IGNORE']
        case 'SIZE_MISMATCH':
        case 'CHECKSUM_MISMATCH':
        case 'METADATA_MISMATCH':
            return ['UPDATE_METADATA', 'IGNORE']
        case 'FILE_MISSING':
            return ['DELETE_METADATA', 'IGNORE']
        default:
            return ['IGNORE']
    }
}

// 액션별 아이콘 및 스타일 설정 (라벨은 API에서 동적으로 가져옴)
const actionIconConfig: Record<FileSyncActionType, { icon: typeof Plus; destructive?: boolean }> = {
    REGISTER: { icon: Plus },
    UPDATE_METADATA: { icon: RefreshCw },
    DELETE_METADATA: { icon: Trash2, destructive: true },
    DELETE_FILE: { icon: FileX, destructive: true },
    IGNORE: { icon: Ban },
}

type TabType = 'analysis' | 'ignored'

export function FileSyncPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const currentTab = (searchParams.get('tab') as TabType) || 'analysis'

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value })
    }

    // 액션 코드값 조회
    const { data: actionCodes = [] } = useCodesByType(CODE_TYPE.FILE_SYNC_ACTION)

    // 액션 라벨 맵 생성 (코드값 -> 라벨)
    const actionLabels = useMemo(() => {
        const labels: Record<string, string> = {}
        actionCodes.forEach(code => {
            labels[code.value] = code.name
        })
        return labels
    }, [actionCodes])

    // 액션 라벨 가져오기 (폴백 포함)
    const getActionLabel = (action: FileSyncActionType): string => {
        return actionLabels[action] || action
    }

    // Analysis tab state
    const analyzeMutation = useAnalyzeFileSync()
    const applyMutation = useApplyFileSync()

    // Register mutations (target별 분리)
    const registerResourceMutation = useRegisterResourceFiles()
    const registerBackupMutation = useRegisterBackupFiles()
    const registerPatchMutation = useRegisterPatchFiles()
    const registerReleaseMutation = useRegisterReleaseFiles()

    // 등록 중 상태 확인
    const isRegistering =
        registerResourceMutation.isPending ||
        registerBackupMutation.isPending ||
        registerPatchMutation.isPending ||
        registerReleaseMutation.isPending

    // Ignored files tab state
    const { data: ignoredFiles = [], isLoading: isIgnoredLoading } = useIgnoredFiles()
    const restoreMutation = useRestoreIgnoredFile()

    const [results, setResults] = useState<FileSyncResult[]>([])
    const [hasAnalyzed, setHasAnalyzed] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Register sheet states
    const [registerSheetOpen, setRegisterSheetOpen] = useState<FileSyncTarget | null>(null)
    const [registerItem, setRegisterItem] = useState<FileSyncResult | null>(null)

    // 선택된 항목들의 공통 상태 계산
    const selectedItemsInfo = useMemo(() => {
        if (selectedIds.size === 0) {
            return { count: 0, commonStatus: null, availableActions: [] as FileSyncActionType[] }
        }

        const selectedItems = results.filter(item => selectedIds.has(item.id))
        const statuses = new Set(selectedItems.map(item => item.status))

        // 모든 선택된 항목이 같은 상태인지 확인
        if (statuses.size === 1) {
            const commonStatus = selectedItems[0].status
            return {
                count: selectedItems.length,
                commonStatus,
                availableActions: getAvailableActions(commonStatus),
            }
        }

        return { count: selectedItems.length, commonStatus: null, availableActions: [] as FileSyncActionType[] }
    }, [selectedIds, results])

    // Handlers
    const handleAnalyze = () => {
        analyzeMutation.mutate({}, {
            onSuccess: (data) => {
                setHasAnalyzed(true)
                const discrepancies = data.discrepancies || []
                setResults(discrepancies)
                setSelectedIds(new Set()) // 분석 시 선택 초기화
            },
        })
    }

    const handleAction = (item: FileSyncResult, action: FileSyncActionType) => {
        // REGISTER 액션은 등록 시트 열기
        if (action === 'REGISTER') {
            setRegisterItem(item)
            setRegisterSheetOpen(item.target)
            return
        }

        // 기타 액션은 기존 apply API 사용
        applyMutation.mutate({
            actions: [{
                id: item.id,
                action,
            }]
        }, {
            onSuccess: () => {
                setResults(prev => prev.filter(r => r.id !== item.id))
                setSelectedIds(prev => {
                    const next = new Set(prev)
                    next.delete(item.id)
                    return next
                })
            },
        })
    }

    // Register sheet close handler
    const handleRegisterSheetClose = () => {
        setRegisterSheetOpen(null)
        setRegisterItem(null)
    }

    // Register sheet success handler
    const handleRegisterSuccess = () => {
        if (registerItem) {
            setResults(prev => prev.filter(r => r.id !== registerItem.id))
            setSelectedIds(prev => {
                const next = new Set(prev)
                next.delete(registerItem.id)
                return next
            })
        }
        handleRegisterSheetClose()
    }

    // Resource register handler
    const handleResourceRegister = (data: ResourceRegisterItem) => {
        registerResourceMutation.mutate(
            { items: [data] },
            { onSuccess: handleRegisterSuccess }
        )
    }

    // Backup register handler
    const handleBackupRegister = (data: BackupRegisterItem) => {
        registerBackupMutation.mutate(
            { items: [data] },
            { onSuccess: handleRegisterSuccess }
        )
    }

    // Patch register handler
    const handlePatchRegister = (data: PatchRegisterItem) => {
        registerPatchMutation.mutate(
            { items: [data] },
            { onSuccess: handleRegisterSuccess }
        )
    }

    // Release register handler
    const handleReleaseRegister = (data: ReleaseRegisterItem) => {
        registerReleaseMutation.mutate(
            { items: [data] },
            { onSuccess: handleRegisterSuccess }
        )
    }

    const handleBulkAction = (action: FileSyncActionType) => {
        // 일괄 등록은 지원하지 않음 (개별 등록만 가능)
        // REGISTER 액션은 드롭다운에서 필터링되어 이 함수에 도달하지 않음

        // apply API 사용
        const actions = Array.from(selectedIds).map(id => ({
            id,
            action,
        }))

        applyMutation.mutate({ actions }, {
            onSuccess: () => {
                setResults(prev => prev.filter(r => !selectedIds.has(r.id)))
                setSelectedIds(new Set())
            },
        })
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(results.map(item => item.id)))
        } else {
            setSelectedIds(new Set())
        }
    }

    const handleSelectItem = (id: string, checked: boolean) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (checked) {
                next.add(id)
            } else {
                next.delete(id)
            }
            return next
        })
    }

    const handleRestore = (ignoreId: number) => {
        restoreMutation.mutate(ignoreId)
    }

    const isAllSelected = results.length > 0 && selectedIds.size === results.length
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < results.length

    // Empty State Content
    const renderEmptyState = () => {
        if (analyzeMutation.isPending) {
            return (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <RotateCw className="h-8 w-8 animate-spin mb-4" />
                    <p>시스템을 분석하고 있습니다...</p>
                </div>
            )
        }

        if (!hasAnalyzed) {
            return (
                <EmptyState
                    icon={Database}
                    title="분석이 실행되지 않았습니다."
                    description="상단 '분석 실행' 버튼을 눌러 파일 시스템과 DB 간의 무결성을 점검하세요."
                />
            )
        }

        if (results.length === 0) {
            return (
                <EmptyState
                    icon={FileCheck}
                    title="불일치 항목이 없습니다."
                    description="파일 시스템과 DB 데이터가 동기화되어 있습니다."
                />
            )
        }

        return null
    }

    // 분석 탭 헤더 액션
    const getAnalysisHeaderActions = () => (
        <>
            {/* 일괄 액션 드롭다운 */}
            {selectedIds.size > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            disabled={applyMutation.isPending || isRegistering || selectedItemsInfo.availableActions.length === 0}
                        >
                            액션 ({selectedIds.size}개 선택)
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {selectedItemsInfo.commonStatus ? (
                            <>
                                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                    상태: {getStatusConfig(selectedItemsInfo.commonStatus).label}
                                </div>
                                <DropdownMenuSeparator />
                                {selectedItemsInfo.availableActions
                                    .filter(action => action !== 'REGISTER') // 일괄 등록은 지원하지 않음 (개별 등록만 가능)
                                    .map((action, index) => {
                                        const iconConfig = actionIconConfig[action]
                                        const Icon = iconConfig.icon
                                        const showSeparator = index > 0 && iconConfig.destructive

                                        return (
                                            <div key={action}>
                                                {showSeparator && <DropdownMenuSeparator />}
                                                <DropdownMenuItem
                                                    onClick={() => handleBulkAction(action)}
                                                    className={iconConfig.destructive ? 'text-red-600 focus:text-red-600' : ''}
                                                >
                                                    <Icon className="mr-2 h-4 w-4" />
                                                    {getActionLabel(action)}
                                                </DropdownMenuItem>
                                            </div>
                                        )
                                    })}
                            </>
                        ) : (
                            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                                선택된 항목들의 상태가 다릅니다.<br />
                                같은 상태의 항목만 선택해주세요.
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={handleAnalyze}
                        variant="outline"
                        size="icon"
                        disabled={analyzeMutation.isPending || applyMutation.isPending || isRegistering}
                    >
                        {analyzeMutation.isPending ? (
                            <RotateCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <ScanSearch className="h-4 w-4" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>분석 실행</p>
                </TooltipContent>
            </Tooltip>
        </>
    )

    // 무시된 파일 탭 헤더 액션 (현재 없음)
    const getIgnoredHeaderActions = () => null

    // 분석 결과 탭 content
    const analysisContent = (
        results.length === 0 || analyzeMutation.isPending ? (
            renderEmptyState()
        ) : (
            <DataTable viewportHeight="calc(100vh - 30rem)">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead style={{ width: '3%' }} className="text-center">
                                <Checkbox
                                    checked={isIndeterminate ? 'indeterminate' : isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="전체 선택"
                                />
                            </TableHead>
                            <TableHead className="w-16 text-right">No</TableHead>
                            <TableHead style={{ width: '7%' }}>분류</TableHead>
                            <TableHead style={{ width: '12%' }}>파일</TableHead>
                            <TableHead>경로</TableHead>
                            <TableHead style={{ width: '7%' }} className="text-center">상태</TableHead>
                            <TableHead style={{ width: '12%' }}>파일 정보</TableHead>
                            <TableHead style={{ width: '12%' }}>DB 정보</TableHead>
                            <TableHead style={{ width: '14%' }}>메시지</TableHead>
                            <TableHead style={{ width: '3%' }} className="text-center"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map((item, index) => {
                            const statusConfig = getStatusConfig(item.status)
                            const availableActions = getAvailableActions(item.status)
                            const isSelected = selectedIds.has(item.id)

                            return (
                                <TableRow key={item.id} data-state={isSelected ? 'selected' : undefined}>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                                            aria-label={`${item.filePath} 선택`}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-muted">
                                            {item.targetName}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <TruncatedText>{item.fileName}</TruncatedText>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs max-w-0">
                                        <TruncatedText>{item.filePath}</TruncatedText>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge variant={statusConfig.variant}>
                                            {statusConfig.label}
                                        </StatusBadge>
                                    </TableCell>
                                    <TableCell>
                                        {item.fileInfo ? (
                                            <div className="text-xs space-y-0.5">
                                                <div className="flex gap-1">
                                                    <span className="text-muted-foreground w-10">크기:</span>
                                                    <span className="font-mono">{formatBytes(item.fileInfo.size)}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="text-muted-foreground w-10">체크섬:</span>
                                                    <span className="font-mono max-w-[100px]">
                                                        <TruncatedText>{item.fileInfo.checksum}</TruncatedText>
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <TypographyMuted>-</TypographyMuted>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {item.dbInfo ? (
                                            <div className="text-xs space-y-0.5">
                                                <div className="flex gap-1">
                                                    <span className="text-muted-foreground w-10">크기:</span>
                                                    <span className="font-mono">{formatBytes(item.dbInfo.size)}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="text-muted-foreground w-10">체크섬:</span>
                                                    <span className="font-mono max-w-[100px]">
                                                        <TruncatedText>{item.dbInfo.checksum}</TruncatedText>
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <TypographyMuted>-</TypographyMuted>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs max-w-[160px]">
                                        {item.message ? (
                                            <TruncatedText>{item.message}</TruncatedText>
                                        ) : (
                                            <TypographyMuted>-</TypographyMuted>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <TableActionMenu>
                                            {availableActions.map((action, actionIndex) => {
                                                const iconConfig = actionIconConfig[action]
                                                const Icon = iconConfig.icon
                                                const showSeparator = actionIndex > 0 && iconConfig.destructive

                                                return (
                                                    <div key={action}>
                                                        {showSeparator && <TableActionMenuSeparator />}
                                                        <TableActionMenuItem
                                                            onClick={() => handleAction(item, action)}
                                                            disabled={applyMutation.isPending || isRegistering}
                                                            className={iconConfig.destructive ? 'text-red-600 focus:text-red-600' : ''}
                                                        >
                                                            <Icon className="mr-2 h-4 w-4" />
                                                            {getActionLabel(action)}
                                                        </TableActionMenuItem>
                                                    </div>
                                                )
                                            })}
                                        </TableActionMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </DataTable>
        )
    )

    // 제외된 파일 탭 content
    const ignoredContent = (
        isIgnoredLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <RotateCw className="h-8 w-8 animate-spin mb-4" />
                <p>제외된 파일 목록을 불러오는 중...</p>
            </div>
        ) : ignoredFiles.length === 0 ? (
            <EmptyState
                icon={FileCheck}
                title="제외된 파일이 없습니다."
                description="분석 결과에서 '분석 제외' 액션을 사용하면 해당 파일이 이 목록에 추가됩니다."
            />
        ) : (
            <DataTable viewportHeight="calc(100vh - 28rem)">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16 text-right">No</TableHead>
                            <TableHead className="w-28">분류</TableHead>
                            <TableHead>경로</TableHead>
                            <TableHead className="w-32 text-center">제외 당시 상태</TableHead>
                            <TableHead className="w-32">처리자</TableHead>
                            <TableHead className="w-40 text-center">제외 일시</TableHead>
                            <TableHead className="w-12 text-center"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ignoredFiles.map((item, index) => {
                            const statusConfig = getStatusConfig(item.status)
                            return (
                                <TableRow key={item.ignoreId}>
                                    <TableCell className="text-right text-muted-foreground">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-muted">
                                            {item.targetTypeName}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs max-w-[300px]">
                                        <TruncatedText>{item.filePath}</TruncatedText>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge variant={statusConfig.variant}>
                                            {statusConfig.label}
                                        </StatusBadge>
                                    </TableCell>
                                    <TableCell>
                                        <TypographyMuted>
                                            {item.ignoredBy || '-'}
                                        </TypographyMuted>
                                    </TableCell>
                                    <TableCell className="text-center text-muted-foreground text-sm">
                                        {formatDateTime(item.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <TableActionMenu>
                                            <TableActionMenuItem
                                                onClick={() => handleRestore(item.ignoreId)}
                                                disabled={restoreMutation.isPending}
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                제외 취소
                                            </TableActionMenuItem>
                                        </TableActionMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </DataTable>
        )
    )

    return (
        <PageLayout
            actions={currentTab === 'analysis' ? getAnalysisHeaderActions() : getIgnoredHeaderActions()}
        >
            <TabbedContentCard
                value={currentTab}
                onValueChange={handleTabChange}
                tabs={[
                    {
                        value: 'analysis',
                        label: `분석 결과${results.length > 0 ? ` (${results.length})` : ''}`,
                        icon: ScanSearch,
                        content: analysisContent,
                    },
                    {
                        value: 'ignored',
                        label: `제외된 파일${ignoredFiles.length > 0 ? ` (${ignoredFiles.length})` : ''}`,
                        icon: ListX,
                        content: ignoredContent,
                    },
                ]}
            />

            {/* Register Forms */}
            <ResourceRegisterForm
                open={registerSheetOpen === 'RESOURCE_FILE'}
                onOpenChange={(open) => !open && handleRegisterSheetClose()}
                item={registerItem}
                isSubmitting={registerResourceMutation.isPending}
                onSubmit={handleResourceRegister}
            />
            <BackupRegisterForm
                open={registerSheetOpen === 'BACKUP_FILE'}
                onOpenChange={(open) => !open && handleRegisterSheetClose()}
                item={registerItem}
                isSubmitting={registerBackupMutation.isPending}
                onSubmit={handleBackupRegister}
            />
            <PatchRegisterForm
                open={registerSheetOpen === 'PATCH_FILE'}
                onOpenChange={(open) => !open && handleRegisterSheetClose()}
                item={registerItem}
                isSubmitting={registerPatchMutation.isPending}
                onSubmit={handlePatchRegister}
            />
            <ReleaseRegisterForm
                open={registerSheetOpen === 'RELEASE_FILE'}
                onOpenChange={(open) => !open && handleRegisterSheetClose()}
                item={registerItem}
                isSubmitting={registerReleaseMutation.isPending}
                onSubmit={handleReleaseRegister}
            />
        </PageLayout>
    )
}
