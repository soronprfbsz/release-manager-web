/**
 * SSH Connection Sheet Component
 * SSH 연결 정보 입력 Sheet 컴포넌트
 */

import { Terminal } from 'lucide-react'

import { AutocompleteInput } from '@/shared/ui/autocomplete-input'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import { useSshConnectionHistory } from '../lib/use-ssh-connection-history'
import type { SshConnectionFormData } from '../model/types'

interface SshConnectionSheetProps {
  open: boolean
  formData: SshConnectionFormData
  errors: Record<string, string>
  isConnecting: boolean
  onFormDataChange: (data: SshConnectionFormData) => void
  onConnect: () => void
  onClose: () => void
}

export function SshConnectionSheet({
  open,
  formData,
  errors,
  isConnecting,
  onFormDataChange,
  onConnect,
  onClose,
}: SshConnectionSheetProps) {
  const { getHostList, getPortList, getUsernameList } = useSshConnectionHistory()

  return (
    <FormSheet
      mode={open ? 'create' : null}
      icon={Terminal}
      title={{ create: 'SSH 연결', edit: 'SSH 연결' }}
      description={{
        create: 'SSH 서버 연결 정보를 입력하세요.',
        edit: 'SSH 서버 연결 정보를 입력하세요.',
      }}
      submitLabel={{ create: '연결하기', edit: '연결하기' }}
      hideCancel={true}
      isSubmitting={isConnecting}
      onSubmit={onConnect}
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* 호스트 & 포트 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ssh-connection-host">
              호스트 <span className="text-red-500">*</span>
            </Label>
            <AutocompleteInput
              id="ssh-connection-host"
              name="ssh-connection-host"
              suggestions={getHostList()}
              value={formData.host}
              onChange={(e) => onFormDataChange({ ...formData, host: e.target.value })}
              placeholder="192.168.1.100"
            />
            {errors.host && <p className="text-sm text-red-500">{errors.host}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ssh-connection-port">
              포트 <span className="text-red-500">*</span>
            </Label>
            <AutocompleteInput
              id="ssh-connection-port"
              name="ssh-connection-port"
              type="number"
              suggestions={getPortList()}
              value={formData.port}
              onChange={(e) => onFormDataChange({ ...formData, port: parseInt(e.target.value) || 22 })}
              placeholder="22"
            />
            {errors.port && <p className="text-sm text-red-500">{errors.port}</p>}
          </div>
        </div>

        {/* 사용자명 & 비밀번호 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ssh-connection-username">
              사용자명 <span className="text-red-500">*</span>
            </Label>
            <AutocompleteInput
              id="ssh-connection-username"
              name="ssh-connection-username"
              suggestions={getUsernameList()}
              value={formData.username}
              onChange={(e) => onFormDataChange({ ...formData, username: e.target.value })}
              placeholder="root"
            />
            {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ssh-connection-password">
              비밀번호 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ssh-connection-password"
              name="ssh-connection-password"
              type="password"
              autoComplete="off"
              value={formData.password}
              onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
        </div>
      </div>
    </FormSheet>
  )
}
