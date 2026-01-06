/**
 * Resource Upload Form Component
 * 리소스 업로드 폼 컴포넌트
 */

import { Loader2, Upload } from 'lucide-react'

import type { CodeSimpleResponse } from '@/entities/_shared/code'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { Button } from '@/shared/ui/button'
import { Combobox } from '@/shared/ui/combobox'
import { FileDropzone } from '@/shared/ui/file-dropzone'
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
  const { toast } = useToast()

  const handleFileCategoryChange = (value: string) => {
    onFormDataChange({
      ...formData,
      fileCategory: value,
      subCategory: '', // Reset subcategory when category changes
    })
  }

  const handleFileError = (message: string) => {
    toast({
      title: '파일 오류',
      description: message,
      variant: 'destructive',
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

            {/* File Select with Drag & Drop */}
            <div className="space-y-2">
              <Label required>파일</Label>
              <FileDropzone
                file={formData.file}
                onFileChange={(file) => onFormDataChange({ ...formData, file })}
                onError={handleFileError}
                disabled={isUploading}
                placeholder="클릭하거나 파일을 드래그하세요"
              />
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
