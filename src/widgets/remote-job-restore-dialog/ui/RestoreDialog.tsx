import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Loader2, RotateCcw } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { remoteJobApi, type MariaDBRestoreRequest } from '@/entities/remote-job'

interface RestoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RestoreDialog({ open, onOpenChange, onSuccess }: RestoreDialogProps) {
  const { toast } = useToast()

  const [host, setHost] = useState('')
  const [port, setPort] = useState('3306')
  const [database, setDatabase] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [backupFileName, setBackupFileName] = useState('')

  // 백업 파일 목록 조회
  const { data: backupFiles, isLoading: isLoadingFiles } = useQuery({
    queryKey: ['remote-job-backup-files'],
    queryFn: remoteJobApi.getBackupList,
    enabled: open,
  })

  const restoreMutation = useMutation({
    mutationFn: (request: MariaDBRestoreRequest) => remoteJobApi.restoreMariaDB(request),
    onSuccess: (data) => {
      toast({
        title: '복원 작업 시작',
        description: `작업 ID: ${data.jobId} - 복원이 진행 중입니다.`,
      })
      handleClose()
      onSuccess()
    },
    onError: (error: Error) => {
      toast({
        title: '복원 실행 실패',
        description: error.message || '복원 실행 중 오류가 발생했습니다.',
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
    setBackupFileName('')
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!host.trim() || !database.trim() || !username.trim() || !password.trim() || !backupFileName) {
      toast({
        title: '입력 오류',
        description: '모든 필수 항목을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    const request: MariaDBRestoreRequest = {
      host,
      port: parseInt(port),
      database,
      username,
      password,
      backupFileName,
    }

    restoreMutation.mutate(request)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            MariaDB 복원 실행
          </SheetTitle>
          <SheetDescription>
            백업 파일로부터 MariaDB 데이터베이스를 복원합니다.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 백업 파일 선택 */}
            <div className="space-y-2">
              <Label htmlFor="backupFileName" required>백업 파일</Label>
              <Select
                value={backupFileName}
                onValueChange={setBackupFileName}
                disabled={isLoadingFiles || !backupFiles || backupFiles.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="백업 파일을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {backupFiles?.map((file) => (
                    <SelectItem key={file.fileName} value={file.fileName}>
                      {file.fileName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingFiles && (
                <p className="text-xs text-muted-foreground">백업 파일 목록을 불러오는 중...</p>
              )}
              {!isLoadingFiles && (!backupFiles || backupFiles.length === 0) && (
                <p className="text-xs text-muted-foreground">백업 파일이 없습니다.</p>
              )}
            </div>

            {/* 호스트 */}
            <div className="space-y-2">
              <Label htmlFor="restore-host" required>호스트</Label>
              <Input
                id="restore-host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="예: localhost 또는 192.168.0.1"
                required
              />
            </div>

            {/* 포트 */}
            <div className="space-y-2">
              <Label htmlFor="restore-port" required>포트</Label>
              <Input
                id="restore-port"
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="3306"
                required
              />
            </div>

            {/* 데이터베이스 */}
            <div className="space-y-2">
              <Label htmlFor="restore-database" required>데이터베이스</Label>
              <Input
                id="restore-database"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                placeholder="데이터베이스 이름"
                required
              />
            </div>

            {/* 사용자명 */}
            <div className="space-y-2">
              <Label htmlFor="restore-username" required>사용자명</Label>
              <Input
                id="restore-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="데이터베이스 사용자명"
                required
              />
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="restore-password" required>비밀번호</Label>
              <Input
                id="restore-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="데이터베이스 비밀번호"
                required
              />
            </div>

            {/* 경고 메시지 */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                ⚠️ <strong>경고:</strong> 복원 작업은 기존 데이터를 덮어씁니다. 신중하게 진행하세요.
              </p>
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
                disabled={restoreMutation.isPending || !backupFileName}
                className="flex-1"
              >
                {restoreMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    실행 중...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    복원 실행
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
