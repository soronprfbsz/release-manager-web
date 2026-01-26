/**
 * Scheduler Form Component
 * 스케줄러 생성/수정 폼 컴포넌트
 */

import { getFormIcon } from '@/shared/config/domain-icons'

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
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { SchedulerFormData, SchedulerFormMode } from '../model/types'
import { HTTP_METHOD_OPTIONS, TIMEZONE_OPTIONS } from '../model/types'

interface SchedulerFormProps {
  mode: SchedulerFormMode
  formData: SchedulerFormData
  isSubmitting: boolean
  onFormDataChange: (data: SchedulerFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function SchedulerForm({
  mode,
  formData,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onClose,
}: SchedulerFormProps) {
  return (
    <FormSheet
      mode={mode}
      icon={getFormIcon(mode, 'scheduler')}
      title={{ create: '스케줄 생성', edit: '스케줄 수정' }}
      description={{
        create: '새 스케줄 Job 정보를 입력하세요.',
        edit: '스케줄 Job 정보를 수정하세요.',
      }}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onClose={onClose}
      width="w-[500px] sm:max-w-[500px]"
    >
      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label required>Job 이름</Label>
          <Input
            value={formData.jobName}
            onChange={(e) =>
              onFormDataChange({ ...formData, jobName: e.target.value })
            }
            placeholder="e.g. daily-backup"
          />
        </div>
        <div className="space-y-2">
          <Label>그룹</Label>
          <Input
            value={formData.jobGroup}
            onChange={(e) =>
              onFormDataChange({ ...formData, jobGroup: e.target.value })
            }
            placeholder="DEFAULT"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>설명</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            onFormDataChange({ ...formData, description: e.target.value })
          }
          placeholder="스케줄에 대한 설명을 입력하세요"
          className="min-h-[60px]"
        />
      </div>

      {/* API 설정 */}
      <div className="space-y-3 pt-2">
        <Label className="text-sm font-semibold">API 설정</Label>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>HTTP Method</Label>
            <Select
              value={formData.httpMethod}
              onValueChange={(value) =>
                onFormDataChange({
                  ...formData,
                  httpMethod: value as typeof formData.httpMethod,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-3 space-y-2">
            <Label required>API URL</Label>
            <Input
              value={formData.apiUrl}
              onChange={(e) =>
                onFormDataChange({ ...formData, apiUrl: e.target.value })
              }
              placeholder="/api/some-endpoint 또는 https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Request Body (JSON)</Label>
          <Textarea
            value={formData.requestBody}
            onChange={(e) =>
              onFormDataChange({ ...formData, requestBody: e.target.value })
            }
            placeholder='{"key": "value"}'
            className="min-h-[80px] font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label>Request Headers (JSON)</Label>
          <Textarea
            value={formData.requestHeaders}
            onChange={(e) =>
              onFormDataChange({ ...formData, requestHeaders: e.target.value })
            }
            placeholder='{"Content-Type": "application/json"}'
            className="min-h-[60px] font-mono text-sm"
          />
        </div>
      </div>

      {/* 스케줄 설정 */}
      <div className="space-y-3 pt-2">
        <Label className="text-sm font-semibold">스케줄 설정</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label required>Cron 표현식</Label>
            <Input
              value={formData.cronExpression}
              onChange={(e) =>
                onFormDataChange({ ...formData, cronExpression: e.target.value })
              }
              placeholder="0 0 * * * (매일 자정)"
              className="font-mono"
            />
            <TypographyMuted className="text-xs">
              초 분 시 일 월 요일 (6자리)
            </TypographyMuted>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) =>
                onFormDataChange({ ...formData, timezone: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 재시도 설정 */}
      <div className="space-y-3 pt-2">
        <Label className="text-sm font-semibold">실행 설정</Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>타임아웃 (초)</Label>
            <Input
              type="number"
              value={formData.timeoutSeconds}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  timeoutSeconds: Number(e.target.value),
                })
              }
              min={1}
              max={3600}
            />
          </div>
          <div className="space-y-2">
            <Label>재시도 횟수</Label>
            <Input
              type="number"
              value={formData.retryCount}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  retryCount: Number(e.target.value),
                })
              }
              min={0}
              max={10}
            />
          </div>
          <div className="space-y-2">
            <Label>재시도 간격 (초)</Label>
            <Input
              type="number"
              value={formData.retryDelaySeconds}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  retryDelaySeconds: Number(e.target.value),
                })
              }
              min={1}
              max={300}
            />
          </div>
        </div>
      </div>

      {/* 활성화 상태 */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <Label className="font-medium">활성화</Label>
          <TypographyMuted className="text-xs">
            비활성화 시 스케줄이 실행되지 않습니다.
          </TypographyMuted>
        </div>
        <Switch
          checked={formData.isEnabled}
          onCheckedChange={(checked) =>
            onFormDataChange({ ...formData, isEnabled: checked })
          }
        />
      </div>
    </FormSheet>
  )
}
