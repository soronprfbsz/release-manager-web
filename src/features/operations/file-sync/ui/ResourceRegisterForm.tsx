/**
 * Resource Register Form
 * 리소스 파일 등록 폼 (파일 동기화에서 사용)
 */

import { useState } from 'react'

import { Upload, type LucideIcon } from 'lucide-react'

import { useCodesByType, CODE_TYPE, type CodeSimpleResponse } from '@/entities/_shared/code'

import { Combobox } from '@/shared/ui/combobox'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

import type { FileSyncResult, ResourceRegisterItem } from '../api/types'

interface ResourceRegisterFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FileSyncResult | null
  isSubmitting: boolean
  onSubmit: (data: ResourceRegisterItem) => void
  /** 페이지 헤더와 동일한 아이콘 */
  icon?: LucideIcon
}

export function ResourceRegisterForm({
  open,
  onOpenChange,
  item,
  isSubmitting,
  onSubmit,
  icon: PageIcon = Upload,
}: ResourceRegisterFormProps) {
  const [resourceFileName, setResourceFileName] = useState('')
  const [fileCategory, setFileCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [description, setDescription] = useState('')

  // 카테고리 코드 조회
  const { data: categories = [] } = useCodesByType(CODE_TYPE.RESOURCE_FILE_CATEGORY)

  // 서브카테고리 동적 조회 (SCRIPT -> RESOURCE_SUBCATEGORY_SCRIPT, DOCUMENT -> RESOURCE_SUBCATEGORY_DOCUMENT)
  const subCategoryCodeType = fileCategory === 'SCRIPT'
    ? CODE_TYPE.RESOURCE_SUBCATEGORY_SCRIPT
    : fileCategory === 'DOCUMENT'
      ? CODE_TYPE.RESOURCE_SUBCATEGORY_DOCUMENT
      : null
  const { data: subCategories = [] } = useCodesByType(subCategoryCodeType as string)

  const handleCategoryChange = (value: string) => {
    setFileCategory(value)
    setSubCategory('') // 카테고리 변경 시 서브카테고리 초기화
  }

  const handleClose = () => {
    setResourceFileName('')
    setFileCategory('')
    setSubCategory('')
    setDescription('')
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!item) return

    const data: ResourceRegisterItem = {
      id: item.id,
      ...(resourceFileName.trim() && { resourceFileName: resourceFileName.trim() }),
      ...(fileCategory && { fileCategory }),
      ...(subCategory && { subCategory }),
      ...(description.trim() && { description: description.trim() }),
    }

    onSubmit(data)
  }

  return (
    <FormSheet
      open={open}
      icon={PageIcon}
      title="리소스 파일 등록"
      description="파일을 리소스로 등록합니다. 추가 정보를 입력하세요."
      submitLabel="등록"
      submitIcon={Upload}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={handleClose}
      width="w-[450px] sm:max-w-[450px]"
    >
      {/* 파일 정보 표시 */}
      {item && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">파일명: </span>
            <span className="font-medium">{item.fileName}</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono break-all">
            {item.filePath}
          </div>
        </div>
      )}

      {/* 대분류 */}
      <div className="space-y-2">
        <Label>대분류</Label>
        <Combobox
          options={categories.map((cat: CodeSimpleResponse) => ({
            value: cat.value,
            label: cat.name,
          }))}
          value={fileCategory}
          onValueChange={handleCategoryChange}
          placeholder="대분류를 선택하세요 (선택)"
          searchPlaceholder="대분류 검색..."
        />
      </div>

      {/* 소분류 */}
      {subCategories.length > 0 && (
        <div className="space-y-2">
          <Label>소분류</Label>
          <Combobox
            options={subCategories.map((cat: CodeSimpleResponse) => ({
              value: cat.value,
              label: cat.name,
            }))}
            value={subCategory}
            onValueChange={setSubCategory}
            placeholder="소분류를 선택하세요 (선택)"
            searchPlaceholder="소분류 검색..."
          />
        </div>
      )}

      {/* 리소스명 */}
      <div className="space-y-2">
        <Label>리소스명</Label>
        <Input
          value={resourceFileName}
          onChange={(e) => setResourceFileName(e.target.value)}
          placeholder="리소스 이름 (선택, 미입력시 파일명 사용)"
        />
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label>설명</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="리소스에 대한 설명"
          rows={3}
        />
      </div>
    </FormSheet>
  )
}
