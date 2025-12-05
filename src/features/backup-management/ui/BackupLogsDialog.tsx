/**
 * Backup Logs Dialog Component
 * 백업 파일 로그 목록 조회 다이얼로그
 */

import { Download, FileText, ScrollText } from 'lucide-react'

import type { LogFile } from '@/entities/job'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'

interface BackupLogsDialogProps {
  isOpen: boolean
  fileName: string
  logFiles: LogFile[]
  isLoading: boolean
  error: Error | null
  onLogClick: (log: LogFile) => void
  onLogDownload: (log: LogFile) => void
  onClose: () => void
}

export function BackupLogsDialog({
  isOpen,
  fileName,
  logFiles,
  isLoading,
  error,
  onLogClick,
  onLogDownload,
  onClose,
}: BackupLogsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            로그 목록
          </DialogTitle>
          <DialogDescription>{fileName}의 백업/복원 로그</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              로그 목록을 불러오는 중 오류가 발생했습니다.
            </div>
          ) : logFiles.length > 0 ? (
            <div className="space-y-2">
              {logFiles.map((log) => (
                <div
                  key={log.logFileName}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => onLogClick(log)}
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate hover:text-primary transition-colors">
                        {log.logFileName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant={log.logType === 'BACKUP' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {log.logType === 'BACKUP' ? '백업' : '복원'}
                        </Badge>
                        <span>{log.fileSizeFormatted}</span>
                        <span>{log.lastModified}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onLogDownload(log)}
                    title="다운로드"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              로그 파일이 없습니다.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
