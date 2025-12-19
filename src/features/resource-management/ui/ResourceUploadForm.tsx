/**
 * Resource Upload Form Component
 * 리소스 업로드 폼 컴포넌트
 */

import { useRef } from 'react'

import { File, Loader2, Upload, X } from 'lucide-react'

import type { CodeSimpleResponse } from '@/entities/code'

import { Button } from '@/shared/ui/button'
import { Combobox } from '@/shared/ui/combobox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'

import { formatFileSize } from '../lib/resourceHelpers'
import type { ResourceUploadFormData } from '../model/types'

interface ResourceUploadFormProps {
  isOpen: boolean
  formData: ResourceUploadFormData
  categories: CodeSimpleResponse[]
  subCategories: CodeSimpleResponse[]
  uploadProgress: number
  isUploading: boolean
  onFormDataChange: (data: ResourceUploadFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function ResourceUploadForm({
  isOpen,
  formData,
  categories,
  subCategories,
  uploadProgress,
  isUploading,
  onFormDataChange,
  onSubmit,
  onClose,
}: ResourceUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFormDataChange({ ...formData, file })
    }
  }

  const handleFileCategoryChange = (value: string) => {
    onFormDataChange({
      ...formData,
      fileCategory: value,
      subCategory: '', // Reset subcategory when category changes
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            리소스 추가
          </SheetTitle>
          <SheetDescription>새로운 리소스 파일을 업로드합니다.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <div className="space-y-5">
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

            {/* File Select */}
            <div className="space-y-2">
              <Label required>파일</Label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              {formData.file ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                  <File className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{formData.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(formData.file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onFormDataChange({ ...formData, file: null })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">클릭하여 파일을 선택하세요</p>
                </div>
              )}
            </div>

            {/* Resource Name Input */}
            <div className="space-y-2">
              <Label required>리소스명</Label>
              <Input
                value={formData.resourceFileName}
                onChange={(e) =>
                  onFormDataChange({ ...formData, resourceFileName: e.target.value })
                }
                placeholder="리소스의 이름을 입력하세요"
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
                placeholder="리소스에 대한 상세 설명을 입력하세요"
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

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={onSubmit}
                disabled={isUploading || !formData.file || !formData.fileCategory || !formData.resourceFileName.trim()}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    업로드
                  </>
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
