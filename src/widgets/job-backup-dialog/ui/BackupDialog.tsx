import { useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { Database, Loader2 } from 'lucide-react'

import { jobApi, type MariaDBBackupRequest } from '@/entities/job'

import { useJobPolling } from '@/shared/lib/hooks/use-job-polling'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Textarea } from '@/shared/ui/textarea'


interface BackupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BackupDialog({ open, onOpenChange, onSuccess }: BackupDialogProps) {
  const { toast } = useToast()
  const { startPolling } = useJobPolling({
    onComplete: () => {
      onSuccess() // 백업 목록 새로고침
    },
  })

  const [host, setHost] = useState('')
  const [port, setPort] = useState('3306')
  const [database, setDatabase] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fileName, setFileName] = useState('')
  const [description, setDescription] = useState('')

  const backupMutation = useMutation({
    mutationFn: (request: MariaDBBackupRequest) => jobApi.backupMariaDB(request),
    onSuccess: (data) => {
      // job 상태 polling 시작 (진행 중 toast 자동 표시)
      startPolling(data.jobId, '백업')
      handleClose()
    },
    onError: (error: Error) => {
      toast({
        title: '백업 실행 실패',
        description: error.message || '백업 실행 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const handleClose = () => {
    setHost('')
    setPort('3306')
    setDatabase('')
    setUsername('')
    setPassword('')
    setFileName('')
    setDescription('')
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!host.trim() || !database.trim() || !username.trim() || !password.trim()) {
      toast({
        title: '입력 오류',
        description: '모든 필수 항목을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    const request: MariaDBBackupRequest = {
      host,
      port: parseInt(port),
      database,
      username,
      password,
      fileName: fileName.trim() || undefined,
      description: description.trim() || undefined,
    }

    backupMutation.mutate(request)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            MariaDB 백업 실행
          </SheetTitle>
          <SheetDescription>
            MariaDB 데이터베이스를 백업합니다.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 호스트 */}
            <div className="space-y-2">
              <Label htmlFor="host" required>호스트</Label>
              <Input
                id="host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="예: localhost 또는 192.168.0.1"
                required
              />
            </div>

            {/* 포트 */}
            <div className="space-y-2">
              <Label htmlFor="port" required>포트</Label>
              <Input
                id="port"
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="3306"
                required
              />
            </div>

            {/* 데이터베이스 */}
            <div className="space-y-2">
              <Label htmlFor="database" required>데이터베이스</Label>
              <Input
                id="database"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                placeholder="데이터베이스 이름"
                required
              />
            </div>

            {/* 사용자명 */}
            <div className="space-y-2">
              <Label htmlFor="username" required>사용자명</Label>
              <Input
                id="username"
                name="username"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="데이터베이스 사용자명"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="password" required>비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="데이터베이스 비밀번호"
                required
              />
            </div>

            {/* 파일명 (선택) */}
            <div className="space-y-2">
              <Label htmlFor="fileName">파일명</Label>
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="예: production_backup_2025 (선택)"
              />
              <p className="text-xs text-muted-foreground">
                생략 시 기본 파일명으로 생성됩니다. (.sql 확장자는 자동으로 추가됩니다)
              </p>
            </div>

            {/* 설명 (선택) */}
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="백업에 대한 설명 (선택)"
                rows={2}
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={backupMutation.isPending}
                className="flex-1"
              >
                {backupMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    실행 중...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    백업 실행
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
