import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Layers, Download, RefreshCw, Calendar, User, ArrowRight, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Breadcrumb } from '@/shared/ui/breadcrumb'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { patchApi } from '@/shared/api/patchApi'
import type { CumulativePatch } from '@/shared/api/types'

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'SUCCESS':
      return (
        <Badge variant="outline" className="border-green-500 bg-green-500/10 text-green-600 dark:text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />
          성공
        </Badge>
      )
    case 'FAILED':
      return (
        <Badge variant="outline" className="border-red-500 bg-red-500/10 text-red-600 dark:text-red-400">
          <XCircle className="h-3 w-3 mr-1" />
          실패
        </Badge>
      )
    case 'PENDING':
      return (
        <Badge variant="outline" className="border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
          <Clock className="h-3 w-3 mr-1" />
          진행중
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function PatchHistoryPage() {
  const { toast } = useToast()
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const { data: patches, isLoading, refetch } = useQuery({
    queryKey: ['cumulative-patches'],
    queryFn: patchApi.getCumulativePatches,
  })

  const handleDownload = async (patch: CumulativePatch) => {
    setDownloadingId(patch.cumulativePatchId)
    try {
      await patchApi.downloadPatch(patch.cumulativePatchId, `${patch.patchName}.zip`)
      toast({
        title: '다운로드 완료',
        description: `${patch.patchName} 파일이 다운로드되었습니다.`,
      })
    } catch {
      toast({
        title: '다운로드 실패',
        description: '파일 다운로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const patchList = patches || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { label: '패치본 관리' },
            { label: '패치 조회/다운로드' },
          ]}
        />
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              생성된 패치 목록
            </div>
            {patchList.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                총 {patchList.length}개
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : patchList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 text-center">ID</TableHead>
                  <TableHead>버전 범위</TableHead>
                  <TableHead className="w-28 text-center">릴리즈</TableHead>
                  <TableHead>패치명</TableHead>
                  <TableHead className="w-24 text-center">상태</TableHead>
                  <TableHead className="w-32">생성자</TableHead>
                  <TableHead className="w-44">생성일시</TableHead>
                  <TableHead className="w-24 text-center">다운로드</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patchList.map((patch) => (
                  <TableRow key={patch.cumulativePatchId}>
                    <TableCell className="text-center text-muted-foreground">
                      {patch.cumulativePatchId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{patch.fromVersion}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-sm font-medium">{patch.toVersion}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {patch.releaseType === 'STANDARD' ? '표준' : patch.customerCode || '커스텀'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{patch.patchName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(patch.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {patch.generatedBy}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(patch.generatedAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(patch)}
                        disabled={downloadingId === patch.cumulativePatchId || patch.status !== 'SUCCESS'}
                        title={patch.status !== 'SUCCESS' ? '성공한 패치만 다운로드 가능합니다' : '다운로드'}
                      >
                        {downloadingId === patch.cumulativePatchId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Layers className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">생성된 패치가 없습니다.</p>
              <p className="text-sm">누적 패치 생성 메뉴에서 패치를 생성해보세요.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
