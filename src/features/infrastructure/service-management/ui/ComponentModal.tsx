/**
 * Component Modal
 * 컴포넌트 생성/수정 모달
 */

import { useEffect, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { validateComponentForm } from '../model/validation'
import type { ComponentFormData, ComponentFormMode } from '../model/types'

interface ComponentModalProps {
  mode: ComponentFormMode
  formData: ComponentFormData
  isSubmitting: boolean
  onFormDataChange: (data: ComponentFormData) => void
  onSubmit: () => void
  onCancel: () => void
}

export function ComponentModal({
  mode,
  formData,
  isSubmitting,
  onFormDataChange,
  onSubmit,
  onCancel,
}: ComponentModalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 폼 데이터 변경 시 해당 필드 에러 제거
  useEffect(() => {
    setErrors({})
  }, [formData])

  const handleSubmit = () => {
    const validation = validateComponentForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }
    onSubmit()
  }

  if (!mode) return null

  return (
    <Dialog open={!!mode} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <Plus className="h-5 w-5" />
                컴포넌트 추가
              </>
            ) : (
              <>
                <Pencil className="h-5 w-5" />
                컴포넌트 수정
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="componentType">
                  컴포넌트 타입 <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.componentType}
                  onValueChange={(value) =>
                    onFormDataChange({
                      ...formData,
                      componentType: value as ComponentFormData['componentType'],
                    })
                  }
                >
                  <SelectTrigger id="componentType">
                    <SelectValue placeholder="타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEB">WEB</SelectItem>
                    <SelectItem value="DATABASE">DATABASE</SelectItem>
                    <SelectItem value="ENGINE">ENGINE</SelectItem>
                    <SelectItem value="ETC">ETC</SelectItem>
                  </SelectContent>
                </Select>
                {errors.componentType && (
                  <p className="text-sm text-destructive">{errors.componentType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="componentName">
                  컴포넌트명 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="componentName"
                  value={formData.componentName}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, componentName: e.target.value })
                  }
                  placeholder="컴포넌트명 입력"
                />
                {errors.componentName && (
                  <p className="text-sm text-destructive">{errors.componentName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">
                  Host <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, host: e.target.value })
                  }
                  placeholder="localhost"
                />
                {errors.host && (
                  <p className="text-sm text-destructive">{errors.host}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">
                  Port <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="port"
                  value={formData.port}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, port: e.target.value })
                  }
                  placeholder="3306"
                />
                {errors.port && (
                  <p className="text-sm text-destructive">{errors.port}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, url: e.target.value })
                  }
                  placeholder="https://example.com"
                />
                {errors.url && (
                  <p className="text-sm text-destructive">{errors.url}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sshPort">SSH Port</Label>
                <Input
                  id="sshPort"
                  value={formData.sshPort}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, sshPort: e.target.value })
                  }
                  placeholder="22"
                  autoComplete="off"
                />
                {errors.sshPort && (
                  <p className="text-sm text-destructive">{errors.sshPort}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  onFormDataChange({ ...formData, description: e.target.value })
                }
                placeholder="컴포넌트 설명"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="isActive" className="text-base font-medium">활성 상태</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  onFormDataChange({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting} className="w-full">
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? '처리 중...' : mode === 'create' ? '추가' : '수정'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

