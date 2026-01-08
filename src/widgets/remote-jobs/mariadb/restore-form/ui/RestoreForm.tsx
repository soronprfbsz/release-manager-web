import { useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { BsDatabaseUp } from 'react-icons/bs'

import { mariadbApi, type MariaDBRestoreRequest, type BackupFile } from '@/entities/remote-jobs/mariadb'

import { useJobPolling } from '@/shared/lib/hooks/use-job-polling'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'


interface RestoreFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  backupFiles: BackupFile[]
  onSuccess: () => void
}

export function RestoreForm({ open, onOpenChange, backupFiles, onSuccess }: RestoreFormProps) {
  const { toast } = useToast()
  const { startPolling } = useJobPolling({
    onComplete: () => {
      onSuccess()
    },
  })

  const [host, setHost] = useState('')
  const [port, setPort] = useState('3306')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedBackupFileId, setSelectedBackupFileId] = useState<string>('')

  const restoreMutation = useMutation({
    mutationFn: (request: MariaDBRestoreRequest) => mariadbApi.restoreMariaDB(request),
    onSuccess: (data) => {
      // job 상태 polling 시작 (진행 중 toast 자동 표시)
      startPolling(data.jobId, '복원')
      handleClose()
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
    setUsername('')
    setPassword('')
    setSelectedBackupFileId('')
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!host.trim() || !username.trim() || !password.trim() || !selectedBackupFileId) {
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
      username,
      password,
      backupFileId: parseInt(selectedBackupFileId),
    }

    restoreMutation.mutate(request)
  }

  // MariaDB 카테고리 파일만 필터링
  const mariadbFiles = backupFiles.filter(f => f.fileCategory === 'MARIADB')

  return (
    <FormSheet
      open={open}
      icon={BsDatabaseUp}
      title="MariaDB 복원 실행"
      description="백업 파일로부터 MariaDB 데이터베이스를 복원합니다."
      submitLabel="복원 실행"
      submitIcon={BsDatabaseUp}
      isSubmitting={restoreMutation.isPending}
      submitDisabled={!selectedBackupFileId}
      onSubmit={handleSubmit}
      onClose={handleClose}
      width="w-[500px] sm:max-w-[500px]"
    >
      {/* 백업 파일 선택 */}
      <div className="space-y-2">
        <Label htmlFor="backupFileId" required>백업 파일</Label>
        <Select
          value={selectedBackupFileId}
          onValueChange={setSelectedBackupFileId}
          disabled={mariadbFiles.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="백업 파일을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {mariadbFiles.map((file) => (
              <SelectItem key={file.backupFileId} value={file.backupFileId.toString()}>
                {file.fileName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {mariadbFiles.length === 0 && (
          <p className="text-xs text-muted-foreground">MariaDB 백업 파일이 없습니다.</p>
        )}
      </div>

      {/* 호스트 */}
      <div className="space-y-2">
        <Label htmlFor="mariadb-restore-host" required>호스트</Label>
        <Input
          id="mariadb-restore-host"
          name="mariadb-restore-host"
          autoComplete="off"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="예: localhost 또는 192.168.0.1"
          required
        />
      </div>

      {/* 포트 */}
      <div className="space-y-2">
        <Label htmlFor="mariadb-restore-port" required>포트</Label>
        <Input
          id="mariadb-restore-port"
          name="mariadb-restore-port"
          type="number"
          autoComplete="off"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          placeholder="3306"
          required
        />
      </div>

      {/* 사용자명 */}
      <div className="space-y-2">
        <Label htmlFor="mariadb-restore-username" required>사용자명</Label>
        <Input
          id="mariadb-restore-username"
          name="mariadb-restore-username"
          autoComplete="off"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="데이터베이스 사용자명"
          required
        />
      </div>

      {/* 비밀번호 */}
      <div className="space-y-2">
        <Label htmlFor="mariadb-restore-password" required>비밀번호</Label>
        <Input
          id="mariadb-restore-password"
          name="mariadb-restore-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="데이터베이스 비밀번호"
          required
        />
      </div>

      {/* 경고 메시지 */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-sm text-yellow-600 dark:text-yellow-500">
          <strong>경고:</strong> 복원 작업은 기존 데이터를 덮어씁니다. 신중하게 진행하세요.
        </p>
      </div>
    </FormSheet>
  )
}
