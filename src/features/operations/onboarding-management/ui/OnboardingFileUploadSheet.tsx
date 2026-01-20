/**
 * Onboarding File Upload Sheet
 * 온보딩 파일 업로드 시트 컴포넌트
 */

import { Upload } from 'lucide-react'

import { DOMAIN_ICONS } from '@/shared/config/domain-icons'
import { Checkbox } from '@/shared/ui/checkbox'
import { FileDropzone } from '@/shared/ui/file-dropzone'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import type { OnboardingFileUploadFormData } from '../model/types'

interface OnboardingFileUploadSheetProps {
  isOpen: boolean
  formData: OnboardingFileUploadFormData
  isUploading: boolean
  onFormDataChange: (data: OnboardingFileUploadFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function OnboardingFileUploadSheet({
  isOpen,
  formData,
  isUploading,
  onFormDataChange,
  onSubmit,
  onClose,
}: OnboardingFileUploadSheetProps) {
  // ZIP 파일 여부 확인
  const isZipFile = formData.file?.name.toLowerCase().endsWith('.zip') ?? false

  return (
    <FormSheet
      open={isOpen}
      icon={DOMAIN_ICONS.onboarding}
      title="파일 업로드"
      description="온보딩 파일을 업로드합니다."
      submitLabel="업로드"
      submitIcon={Upload}
      isSubmitting={isUploading}
      submitDisabled={!formData.file}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      {/* 업로드 경로 */}
      <div className="space-y-2">
        <Label>업로드 경로</Label>
        <Input
          value={formData.targetPath}
          onChange={(e) =>
            onFormDataChange({ ...formData, targetPath: e.target.value })
          }
          placeholder="/"
          disabled={isUploading}
        />
        <p className="text-xs text-muted-foreground">
          파일이 저장될 경로입니다. 예: /database/mariadb
        </p>
      </div>

      {/* 파일 선택 */}
      <div className="space-y-2">
        <Label required>파일</Label>
        <FileDropzone
          file={formData.file}
          onFileChange={(file) => onFormDataChange({ ...formData, file, extractZip: false })}
          disabled={isUploading}
          placeholder="클릭하거나 파일을 드래그하세요"
        />
      </div>

      {/* ZIP 압축 해제 옵션 */}
      {isZipFile && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="extractZip"
            checked={formData.extractZip}
            onCheckedChange={(checked) =>
              onFormDataChange({ ...formData, extractZip: checked === true })
            }
            disabled={isUploading}
          />
          <label
            htmlFor="extractZip"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            압축 해제 후 업로드
          </label>
        </div>
      )}
    </FormSheet>
  )
}
