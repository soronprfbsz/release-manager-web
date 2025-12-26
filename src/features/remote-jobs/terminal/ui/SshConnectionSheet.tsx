/**
 * SSH Connection Sheet Component
 * SSH 연결 정보 입력 Sheet 컴포넌트
 */

import { Terminal } from 'lucide-react'

import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import type { SshConnectionFormData } from '../model/types'
import { useSshConnectionHistory } from '../lib/use-ssh-connection-history'

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
        {/* 호스트 */}
        <div className="space-y-2">
          <Label htmlFor="ssh-host">
            호스트 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ssh-host"
            name="ssh-host"
            list="ssh-host-list"
            autoComplete="off"
            value={formData.host}
            onChange={(e) => onFormDataChange({ ...formData, host: e.target.value })}
            placeholder="192.168.1.100"
          />
          <datalist id="ssh-host-list">
            {getHostList().map((host) => (
              <option key={host} value={host} />
            ))}
          </datalist>
          {errors.host && <p className="text-sm text-red-500">{errors.host}</p>}
        </div>

        {/* 포트 */}
        <div className="space-y-2">
          <Label htmlFor="ssh-port">
            포트 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ssh-port"
            name="ssh-port"
            type="number"
            list="ssh-port-list"
            autoComplete="off"
            value={formData.port}
            onChange={(e) => onFormDataChange({ ...formData, port: parseInt(e.target.value) || 22 })}
            placeholder="22"
          />
          <datalist id="ssh-port-list">
            {getPortList().map((port) => (
              <option key={port} value={port} />
            ))}
          </datalist>
          {errors.port && <p className="text-sm text-red-500">{errors.port}</p>}
        </div>

        {/* 사용자명 */}
        <div className="space-y-2">
          <Label htmlFor="ssh-username">
            사용자명 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ssh-username"
            name="ssh-username"
            list="ssh-username-list"
            autoComplete="off"
            value={formData.username}
            onChange={(e) => onFormDataChange({ ...formData, username: e.target.value })}
            placeholder="root"
          />
          <datalist id="ssh-username-list">
            {getUsernameList().map((username) => (
              <option key={username} value={username} />
            ))}
          </datalist>
          {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
        </div>

        {/* 비밀번호 */}
        <div className="space-y-2">
          <Label htmlFor="ssh-password">
            비밀번호 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ssh-password"
            name="ssh-password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>
      </div>
    </FormSheet>
  )
}
