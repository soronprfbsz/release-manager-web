/**
 * File Upload Form Component
 * 파일 업로드 폼 컴포넌트
 */

import { Upload } from 'lucide-react'

import { getDomainIcon } from '@/shared/config/domain-icons'

import type { CodeSimpleResponse } from '@/entities/_shared/code'

import { Combobox } from '@/shared/ui/combobox'
import { FileDropzone } from '@/shared/ui/file-dropzone'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

import type { FileUploadFormData } from '../model/types'

interface FileUploadFormProps {
  isOpen: boolean
  formData: FileUploadFormData
  categories: CodeSimpleResponse[]
  subCategories: CodeSimpleResponse[]
  uploadProgress: number
  isUploading: boolean
  onFormDataChange: (data: FileUploadFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function FileUploadForm({
  isOpen,
  formData,
  categories,
  subCategories,
  uploadProgress,
  isUploading,
  onFormDataChange,
  onSubmit,
  onClose,
}: FileUploadFormProps) {
  const handleFileCategoryChange = (value: string) => {
    onFormDataChange({
      ...formData,
      fileCategory: value,
      subCategory: '',
    })
  }

  return (
    <FormSheet
      open={isOpen}
      icon={getDomainIcon('file')}
      title="파일 추가"
      description="새로운 파일을 업로드합니다."
      submitLabel="업로드"
      submitIcon={Upload}
      isSubmitting={isUploading}
      submitDisabled={!formData.file || !formData.fileCategory || !formData.resourceFileName.trim()}
      onSubmit={onSubmit}
      onClose={onClose}
    >
      {/* Category Select */}
      <div className="space-y-2">
        <Label required>대분류</Label>
        <Combobox
          options={categories.map((cat) => ({
            value: cat.value,
            label: cat.name,
          }))}
          value={formData.fileCategory}
          onValueChange={handleFileCategoryChange}
          placeholder="대분류를 선택하세요"
          searchPlaceholder="대분류 검색..."
        />
      </div>

      {/* Sub Category Select */}
      {subCategories.length > 0 && (
        <div className="space-y-2">
          <Label>소분류</Label>
          <Combobox
            options={subCategories.map((cat) => ({
              value: cat.value,
              label: cat.name,
            }))}
            value={formData.subCategory}
            onValueChange={(value) =>
              onFormDataChange({ ...formData, subCategory: value })
            }
            placeholder="소분류를 선택하세요"
            searchPlaceholder="소분류 검색..."
          />
        </div>
      )}

      {/* File Select with Drag & Drop */}
      <div className="space-y-2">
        <Label required>파일</Label>
        <FileDropzone
          file={formData.file}
          onFileChange={(file) => onFormDataChange({ ...formData, file })}
          disabled={isUploading}
          placeholder="클릭하거나 파일을 드래그하세요"
        />
      </div>

      {/* Resource Name Input */}
      <div className="space-y-2">
        <Label required>파일명</Label>
        <Input
          value={formData.resourceFileName}
          onChange={(e) =>
            onFormDataChange({ ...formData, resourceFileName: e.target.value })
          }
          placeholder="파일의 이름을 입력하세요"
        />
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <Label>설명</Label>
        <Input
          value={formData.description}
          onChange={(e) =>
            onFormDataChange({ ...formData, description: e.target.value })
          }
          placeholder="파일에 대한 상세 설명을 입력하세요"
        />
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>업로드 중...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </FormSheet>
  )
}

