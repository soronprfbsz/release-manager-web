/**
 * API Log Detail Dialog Component
 * API 로그 상세 조회 다이얼로그
 */

import { Loader2 } from 'lucide-react'

import { useApiLog, type ApiLogListItem } from '@/entities/operations/api-log'

import { formatDateTime } from '@/shared/lib/utils/date'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { StatusBadge } from '@/shared/ui/status-badge'

interface ApiLogDetailDialogProps {
  log: ApiLogListItem | null
  onClose: () => void
}

function getStatusVariant(status: number): 'success' | 'error' | 'warning' | 'info' {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'error'
  return 'info'
}

function getMethodVariant(method: string): 'success' | 'error' | 'warning' | 'info' {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'info'
    case 'POST':
      return 'success'
    case 'PUT':
    case 'PATCH':
      return 'warning'
    case 'DELETE':
      return 'error'
    default:
      return 'info'
  }
}

function formatJson(str: string | null): string {
  if (!str) return ''
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-2 border-b border-border/50 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function ApiLogDetailDialog({ log, onClose }: ApiLogDetailDialogProps) {
  const { data: detail, isLoading } = useApiLog(log?.logId ?? 0, log !== null)

  return (
    <Dialog open={log !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>API 로그 상세</DialogTitle>
          <DialogDescription>
            요청 ID: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log?.requestId}</code>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <h4 className="text-sm font-semibold mb-2">기본 정보</h4>
                <div className="rounded-md border bg-muted/20 px-4">
                  <DetailRow label="요청일시">
                    {formatDateTime(detail.createdAt)}
                  </DetailRow>
                  <DetailRow label="메서드">
                    <StatusBadge variant={getMethodVariant(detail.httpMethod)}>
                      {detail.httpMethod}
                    </StatusBadge>
                  </DetailRow>
                  <DetailRow label="상태코드">
                    <StatusBadge variant={getStatusVariant(detail.responseStatus)}>
                      {detail.responseStatus}
                    </StatusBadge>
                  </DetailRow>
                  <DetailRow label="실행시간">
                    {detail.executionTimeMs != null ? `${detail.executionTimeMs.toLocaleString()}ms` : '-'}
                  </DetailRow>
                  <DetailRow label="사용자">
                    {detail.accountEmail || '-'}
                  </DetailRow>
                  <DetailRow label="클라이언트 IP">
                    {detail.clientIp || '-'}
                  </DetailRow>
                </div>
              </div>

              {/* 요청 정보 */}
              <div>
                <h4 className="text-sm font-semibold mb-2">요청 정보</h4>
                <div className="rounded-md border bg-muted/20 px-4">
                  <DetailRow label="URI">
                    <code className="text-xs break-all">{detail.requestUri}</code>
                  </DetailRow>
                  {detail.queryString && (
                    <DetailRow label="Query String">
                      <code className="text-xs break-all">{detail.queryString}</code>
                    </DetailRow>
                  )}
                  {detail.requestContentType && (
                    <DetailRow label="Content-Type">
                      <code className="text-xs">{detail.requestContentType}</code>
                    </DetailRow>
                  )}
                </div>
                {detail.requestBody && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-muted-foreground">Request Body</span>
                    <pre className="mt-1 p-3 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap max-h-[200px]">
                      {formatJson(detail.requestBody)}
                    </pre>
                  </div>
                )}
              </div>

              {/* 응답 정보 */}
              <div>
                <h4 className="text-sm font-semibold mb-2">응답 정보</h4>
                <div className="rounded-md border bg-muted/20 px-4">
                  {detail.responseContentType && (
                    <DetailRow label="Content-Type">
                      <code className="text-xs">{detail.responseContentType}</code>
                    </DetailRow>
                  )}
                </div>
                {detail.responseBody && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-muted-foreground">Response Body</span>
                    <pre className="mt-1 p-3 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap max-h-[300px]">
                      {formatJson(detail.responseBody)}
                    </pre>
                  </div>
                )}
              </div>

              {/* User Agent */}
              {detail.userAgent && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">User Agent</h4>
                  <pre className="p-3 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap">
                    {detail.userAgent}
                  </pre>
                </div>
              )}
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
