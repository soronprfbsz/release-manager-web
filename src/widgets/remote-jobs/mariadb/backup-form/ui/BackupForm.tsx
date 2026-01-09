import { useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { BsDatabaseDown } from 'react-icons/bs'

import { mariadbApi, type MariaDBBackupRequest } from '@/entities/remote-jobs/mariadb'

import { useJobPolling } from '@/shared/lib/hooks/use-job-polling'
import { useMariaDBConnectionHistory } from '@/shared/lib/hooks/use-mariadb-connection-history'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { AutocompleteInput } from '@/shared/ui/autocomplete-input'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'


interface BackupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BackupForm({ open, onOpenChange, onSuccess }: BackupFormProps) {
  const { toast } = useToast()
  const { saveToHistory, getHostList, getPortList, getDatabaseList, getUsernameList } =
    useMariaDBConnectionHistory()
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
    mutationFn: (request: MariaDBBackupRequest) => mariadbApi.backupMariaDB(request),
    onSuccess: (data) => {
      // 연결 성공 - 히스토리 저장 (비밀번호 제외)
      saveToHistory(host, parseInt(port), database, username)
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

  const handleSubmit = () => {
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
    <FormSheet
      open={open}
      icon={BsDatabaseDown}
      title="MariaDB 백업 실행"
      description="MariaDB 데이터베이스를 백업합니다."
      submitLabel="백업 실행"
      submitIcon={BsDatabaseDown}
      isSubmitting={backupMutation.isPending}
      onSubmit={handleSubmit}
      onClose={handleClose}
      width="w-[500px] sm:max-w-[500px]"
    >
      {/* 호스트 & 포트 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mariadb-backup-host" required>호스트</Label>
          <AutocompleteInput
            id="mariadb-backup-host"
            name="mariadb-backup-host"
            suggestions={getHostList()}
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="e.g. localhost"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mariadb-backup-port" required>포트</Label>
          <AutocompleteInput
            id="mariadb-backup-port"
            name="mariadb-backup-port"
            type="number"
            suggestions={getPortList()}
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="3306"
            required
          />
        </div>
      </div>

      {/* 데이터베이스 */}
      <div className="space-y-2">
        <Label htmlFor="mariadb-backup-database" required>데이터베이스</Label>
        <AutocompleteInput
          id="mariadb-backup-database"
          name="mariadb-backup-database"
          suggestions={getDatabaseList()}
          value={database}
          onChange={(e) => setDatabase(e.target.value)}
          placeholder="데이터베이스 이름"
          required
        />
      </div>

      {/* 사용자명 & 비밀번호 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mariadb-backup-username" required>사용자명</Label>
          <AutocompleteInput
            id="mariadb-backup-username"
            name="mariadb-backup-username"
            suggestions={getUsernameList()}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="사용자명"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mariadb-backup-password" required>비밀번호</Label>
          <Input
            id="mariadb-backup-password"
            name="mariadb-backup-password"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
          />
        </div>
      </div>

      {/* 파일명 (선택) */}
      <div className="space-y-2">
        <Label htmlFor="fileName">파일명</Label>
        <Input
          id="fileName"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="e.g. production_backup_2025"
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
    </FormSheet>
  )
}
