/**
 * Publishing Upload Form Component
 * 퍼블리싱 업로드 폼 컴포넌트
 */


import { useQuery } from '@tanstack/react-query'
import { FileArchive, Upload, AlertTriangle } from 'lucide-react'

import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'
import { customerApi } from '@/entities/operations'

import { getDomainIcon } from '@/shared/config/domain-icons'
import { Combobox } from '@/shared/ui/combobox'
import { FileDropzone } from '@/shared/ui/file-dropzone'
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
import { Textarea } from '@/shared/ui/textarea'

import type { PublishingUploadFormData } from '../model/types'

interface PublishingUploadFormProps {
  isOpen: boolean
  formData: PublishingUploadFormData
  uploadProgress: number
  isUploading: boolean
  onFormDataChange: (data: PublishingUploadFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function PublishingUploadForm({
  isOpen,
  formData,
  uploadProgress,
  isUploading,
  onFormDataChange,
  onSubmit,
  onClose,
}: PublishingUploadFormProps) {
  // Fetch Categories from API
  const { data: categoryList = [] } = useCodesByType(CODE_TYPE.PUBLISHING_CATEGORY)

  // Fetch Customers
  const { data: customersData } = useQuery({
    queryKey: ['customers-active'],
    queryFn: () => customerApi.getList({ isActive: true, size: 1000 }),
    enabled: isOpen,
  })
  const customers = customersData?.content || []

  // Get subcategory code type based on selected category
  const getSubCategoryCodeType = (category: string) => {
    switch (category) {
      case 'INFRAEYE1':
        return CODE_TYPE.PUBLISHING_SUBCATEGORY_INFRAEYE1
      case 'INFRAEYE2':
        return CODE_TYPE.PUBLISHING_SUBCATEGORY_INFRAEYE2
      case 'COMMON':
        return CODE_TYPE.PUBLISHING_SUBCATEGORY_COMMON
      default:
        return ''
    }
  }

  const subCategoryCodeType = getSubCategoryCodeType(formData.publishingCategory)
  const { data: subCategoryList = [] } = useCodesByType(subCategoryCodeType, {
    enabled: !!formData.publishingCategory && !!subCategoryCodeType,
  })

  const handleCategoryChange = (value: string) => {
    onFormDataChange({
      ...formData,
      publishingCategory: value,
      subCategory: '', // Reset subcategory when category changes
    })
  }

  // Info Box
  const headerContent = (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/40 border border-accent mb-5">
      <AlertTriangle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">ZIP 파일 요구사항</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>index.html 파일이 루트에 있어야 합니다</li>
        </ul>
      </div>
    </div>
  )

  return (
    <FormSheet
      open={isOpen}
      icon={getDomainIcon('publishing')}
      title="퍼블리싱 추가"
      description="HTML, CSS, 이미지 등이 포함된 ZIP 파일을 업로드합니다."
      submitLabel="업로드"
      submitIcon={Upload}
      isSubmitting={isUploading}
      submitDisabled={!formData.file || !formData.publishingCategory || !formData.publishingName.trim()}
      onSubmit={onSubmit}
      onClose={onClose}
      headerContent={headerContent}
    >
      {/* Category & Customer Select */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label required>카테고리</Label>
          <Select onValueChange={handleCategoryChange} value={formData.publishingCategory}>
            <SelectTrigger>
              <SelectValue placeholder="카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {categoryList.map((code) => (
                <SelectItem key={code.value} value={code.value}>{code.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>고객사</Label>
          <Combobox
            options={[
              { value: '__none__', label: '선택 안함' },
              ...customers.map((c) => ({
                value: String(c.customerId),
                label: `${c.customerName} (${c.customerCode})`,
              })),
            ]}
            value={formData.customerId ? String(formData.customerId) : '__none__'}
            onValueChange={(value) =>
              onFormDataChange({
                ...formData,
                customerId: value === '__none__' || !value ? null : Number(value),
              })
            }
            placeholder="선택 안함"
            searchPlaceholder="고객사 검색..."
          />
        </div>
      </div>

      {/* Sub Category Select */}
      {formData.publishingCategory && (
        <div className="space-y-2">
          <Label>서브 카테고리</Label>
          <Select
            onValueChange={(value) =>
              onFormDataChange({ ...formData, subCategory: value })
            }
            value={formData.subCategory || ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="서브 카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {subCategoryList.length > 0 ? (
                subCategoryList.map((code) => (
                  <SelectItem key={code.value} value={code.value}>{code.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="_empty" disabled>등록된 서브 카테고리가 없습니다</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Publishing Name Input */}
      <div className="space-y-2">
        <Label required>퍼블리싱명</Label>
        <Input
          value={formData.publishingName}
          onChange={(e) =>
            onFormDataChange({ ...formData, publishingName: e.target.value })
          }
          placeholder="e.g. A사 대시보드"
        />
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <Label>설명</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            onFormDataChange({ ...formData, description: e.target.value })
          }
          placeholder="퍼블리싱에 대한 상세 설명을 입력하세요"
          rows={3}
        />
      </div>

      {/* File Select with Drag & Drop */}
      <div className="space-y-2">
        <Label required>ZIP 파일</Label>
        <FileDropzone
          file={formData.file}
          onFileChange={(file) => onFormDataChange({ ...formData, file })}
          accept={['.zip']}
          disabled={isUploading}
          icon={<FileArchive className="h-6 w-6 text-muted-foreground" />}
          hint="ZIP 파일만 지원"
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
