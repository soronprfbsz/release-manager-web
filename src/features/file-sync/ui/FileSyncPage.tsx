import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    RotateCw,
    FileDiff,
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

import { Button } from '@/shared/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card'
import { StatusBadge } from '@/shared/ui/status-badge'
import { DataTable } from '@/shared/ui/data-table'
import { PageHeader } from '@/shared/ui/page-header'
import { DynamicBreadcrumb } from '@/shared/ui/dynamic-breadcrumb'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { EmptyState } from '@/shared/ui/empty-state'
import {
    TableActionMenu,
    TableActionMenuItem,
    TableActionMenuSeparator,
} from '@/shared/ui/table-action-menu'
import { TypographyMuted } from '@/shared/ui/typography'
import { Checkbox } from '@/shared/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import { useAnalyzeFileSync, useApplyFileSync, useIgnoredFiles, useRestoreIgnoredFile } from '../api/queries'
import { FileSyncResult, FileSyncActionType, FileSyncStatus, FileSyncTarget } from '../api/types'

// Target 한글 변환
const getTargetLabel = (target: FileSyncTarget): string => {
    switch (target) {
        case 'VERSION':
            return '버전'
        case 'PATCH':
            return '패치'
        case 'RESOURCE':
            return '리소스'
        case 'BACKUP':
            return '백업'
        case 'CUSTOM':
            return '커스텀'
        case 'RELEASE_FILE':
            return '릴리즈 파일'
        default:
            return target
    }
}

// Status 한글 변환 및 variant
const getStatusConfig = (status: FileSyncStatus): { label: string; variant: 'error' | 'warning' | 'info' | 'success' } => {
    switch (status) {
        case 'UNREGISTERED':
            return { label: '미등록', variant: 'warning' }
        case 'CHECKSUM_MISMATCH':
            return { label: '체크섬 불일치', variant: 'error' }
        case 'FILE_MISSING':
            return { label: '파일 누락', variant: 'error' }
        case 'DB_MISSING':
            return { label: 'DB 누락', variant: 'warning' }
        case 'METADATA_MISMATCH':
            return { label: '메타데이터 불일치', variant: 'info' }
        default:
            return { label: status, variant: 'info' }
    }
}

// 상태에 따라 사용 가능한 액션 목록 반환
const getAvailableActions = (status: FileSyncStatus): FileSyncActionType[] => {
    switch (status) {
        case 'UNREGISTERED':
        case 'DB_MISSING':
            return ['REGISTER', 'DELETE_FILE', 'IGNORE']
        case 'CHECKSUM_MISMATCH':
        case 'METADATA_MISMATCH':
            return ['UPDATE_METADATA', 'IGNORE']
        case 'FILE_MISSING':
            return ['DELETE_METADATA', 'IGNORE']
        default:
            return ['IGNORE']
    }
}

// 액션별 설정
const actionConfig: Record<FileSyncActionType, { label: string; icon: typeof Plus; destructive?: boolean }> = {
    REGISTER: { label: 'DB 등록', icon: Plus },
    UPDATE_METADATA: { label: '메타데이터 갱신', icon: RefreshCw },
    DELETE_METADATA: { label: 'DB 레코드 삭제', icon: Trash2, destructive: true },
    DELETE_FILE: { label: '파일 삭제', icon: FileX, destructive: true },
    IGNORE: { label: '제외', icon: Ban },
}

type TabType = 'analysis' | 'ignored'

export function FileSyncPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const currentTab = (searchParams.get('tab') as TabType) || 'analysis'

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value })
    }

    // Analysis tab state
    const analyzeMutation = useAnalyzeFileSync()
    const applyMutation = useApplyFileSync()

    // Ignored files tab state
    const { data: ignoredFiles = [], isLoading: isIgnoredLoading, refetch: refetchIgnored } = useIgnoredFiles()
    const restoreMutation = useRestoreIgnoredFile()

    const [results, setResults] = useState<FileSyncResult[]>([])
    const [hasAnalyzed, setHasAnalyzed] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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

    const handleBulkAction = (action: FileSyncActionType) => {
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
                    description="파일 시스템과 데이터베이스가 완벽하게 동기화되어 있습니다."
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
                            disabled={applyMutation.isPending || selectedItemsInfo.availableActions.length === 0}
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
                                {selectedItemsInfo.availableActions.map((action, index) => {
                                    const config = actionConfig[action]
                                    const Icon = config.icon
                                    const showSeparator = index > 0 && config.destructive

                                    return (
                                        <div key={action}>
                                            {showSeparator && <DropdownMenuSeparator />}
                                            <DropdownMenuItem
                                                onClick={() => handleBulkAction(action)}
                                                className={config.destructive ? 'text-red-600 focus:text-red-600' : ''}
                                            >
                                                <Icon className="mr-2 h-4 w-4" />
                                                {config.label}
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
                        disabled={analyzeMutation.isPending || applyMutation.isPending}
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

    // 무시된 파일 탭 헤더 액션
    const getIgnoredHeaderActions = () => (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={() => refetchIgnored()}
                    variant="outline"
                    size="icon"
                    disabled={isIgnoredLoading}
                >
                    <RefreshCw className={`h-4 w-4 ${isIgnoredLoading ? 'animate-spin' : ''}`} />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>새로고침</p>
            </TooltipContent>
        </Tooltip>
    )

    return (
        <div className="space-y-6">
            <DynamicBreadcrumb />

            <div className="space-y-6">
                <PageHeader
                    icon={<FileDiff className="h-5 w-5 text-primary" />}
                    title="파일 동기화"
                    actions={currentTab === 'analysis' ? getAnalysisHeaderActions() : getIgnoredHeaderActions()}
                />

                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                        <TabsTrigger
                            value="analysis"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
                        >
                            <ScanSearch className="w-4 h-4 mr-2" />
                            분석 결과
                        </TabsTrigger>
                        <TabsTrigger
                            value="ignored"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
                        >
                            <ListX className="w-4 h-4 mr-2" />
                            제외된 파일
                        </TabsTrigger>
                    </TabsList>

                    {/* 분석 결과 탭 */}
                    <TabsContent value="analysis" className="mt-8">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileDiff className="h-5 w-5" />
                                        분석 결과
                                        {results.length > 0 && (
                                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                                {results.length}개의 문제가 발견되었습니다.
                                            </span>
                                        )}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {results.length === 0 || analyzeMutation.isPending ? (
                                    renderEmptyState()
                                ) : (
                                    <DataTable>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12 text-center">
                                                        <Checkbox
                                                            checked={isIndeterminate ? 'indeterminate' : isAllSelected}
                                                            onCheckedChange={handleSelectAll}
                                                            aria-label="전체 선택"
                                                        />
                                                    </TableHead>
                                                    <TableHead className="w-16 text-center">No</TableHead>
                                                    <TableHead className="w-28">대상</TableHead>
                                                    <TableHead>경로</TableHead>
                                                    <TableHead className="w-32 text-center">상태</TableHead>
                                                    <TableHead className="w-80">메시지</TableHead>
                                                    <TableHead className="w-12 text-center"></TableHead>
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
                                                            <TableCell className="text-center text-muted-foreground">
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-muted">
                                                                    {getTargetLabel(item.target)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">
                                                                {item.filePath}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <StatusBadge variant={statusConfig.variant}>
                                                                    {statusConfig.label}
                                                                </StatusBadge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TypographyMuted>
                                                                    {item.message || '-'}
                                                                </TypographyMuted>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TableActionMenu>
                                                                    {availableActions.map((action, actionIndex) => {
                                                                        const config = actionConfig[action]
                                                                        const Icon = config.icon
                                                                        const showSeparator = actionIndex > 0 && config.destructive

                                                                        return (
                                                                            <div key={action}>
                                                                                {showSeparator && <TableActionMenuSeparator />}
                                                                                <TableActionMenuItem
                                                                                    onClick={() => handleAction(item, action)}
                                                                                    disabled={applyMutation.isPending}
                                                                                    className={config.destructive ? 'text-red-600 focus:text-red-600' : ''}
                                                                                >
                                                                                    <Icon className="mr-2 h-4 w-4" />
                                                                                    {config.label}
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
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 제외된 파일 탭 */}
                    <TabsContent value="ignored" className="mt-8">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <ListX className="h-5 w-5" />
                                        제외된 파일
                                        {ignoredFiles.length > 0 && (
                                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                                {ignoredFiles.length}개의 파일이 제외되어 있습니다.
                                            </span>
                                        )}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isIgnoredLoading ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                        <RotateCw className="h-8 w-8 animate-spin mb-4" />
                                        <p>제외된 파일 목록을 불러오는 중...</p>
                                    </div>
                                ) : ignoredFiles.length === 0 ? (
                                    <EmptyState
                                        icon={FileCheck}
                                        title="제외된 파일이 없습니다."
                                        description="분석 결과에서 '제외' 액션을 사용하면 해당 파일이 이 목록에 추가됩니다."
                                    />
                                ) : (
                                    <DataTable>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-16 text-center">No</TableHead>
                                                    <TableHead className="w-28">대상</TableHead>
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
                                                            <TableCell className="text-center text-muted-foreground">
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-muted">
                                                                    {getTargetLabel(item.targetType)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-xs">
                                                                {item.filePath}
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
                                                                {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
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
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
