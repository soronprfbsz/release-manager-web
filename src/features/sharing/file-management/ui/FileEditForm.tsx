/**
 * File Edit Form Component
 * 파일 정보 수정 폼 시트
 */

import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'
import type { ResourceFile, ResourceFileUpdateRequest } from '@/entities/infrastructure/file'

import { getFormIcon } from '@/shared/config/domain-icons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'


const formSchema = z.object({
  resourceFileName: z.string().min(1, '파일명을 입력해주세요.'),
  fileCategory: z.string().min(1, '카테고리를 선택해주세요.'),
  subCategory: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface FileEditFormProps {
  isOpen: boolean
  resource: ResourceFile | null
  isSubmitting: boolean
  onSubmit: (data: ResourceFileUpdateRequest) => void
  onClose: () => void
}

export function FileEditForm({
  isOpen,
  resource,
  isSubmitting,
  onSubmit,
  onClose,
}: FileEditFormProps) {
  const { data: categoryList = [] } = useCodesByType(CODE_TYPE.RESOURCE_FILE_CATEGORY)

  const defaultValues: FormValues = {
    resourceFileName: '',
    fileCategory: '',
    subCategory: '',
    description: '',
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const getNormalizedCategory = (value: string) => {
    if (!value) return ''
    const code = categoryList.find(c => c.value.toLowerCase() === value.toLowerCase())
    return code ? code.value : value
  }

  useEffect(() => {
    if (isOpen && resource && categoryList.length > 0) {
      form.reset({
        resourceFileName: resource.resourceFileName,
        fileCategory: getNormalizedCategory(resource.fileCategory),
        subCategory: resource.subCategory || '',
        description: resource.description || '',
      })
    }
  }, [isOpen, resource, categoryList, form])

  const getSubCategoryCodeType = (category: string) => {
    switch (category) {
      case 'SCRIPT':
        return CODE_TYPE.RESOURCE_SUBCATEGORY_SCRIPT
      case 'DOCUMENT':
        return CODE_TYPE.RESOURCE_SUBCATEGORY_DOCUMENT
      default:
        return ''
    }
  }

  const selectedCategory = form.watch('fileCategory')
  const subCategoryCodeType = getSubCategoryCodeType(selectedCategory)
  const { data: subCategoryList = [] } = useCodesByType(subCategoryCodeType, {
    enabled: !!subCategoryCodeType,
  })

  useEffect(() => {
    if (!isOpen) {
      form.reset(defaultValues)
    }
  }, [isOpen, form])

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      fileCategory: values.fileCategory,
      resourceFileName: values.resourceFileName,
      subCategory: values.subCategory || undefined,
      description: values.description || undefined,
    })
  }

  return (
    <FormSheet
      open={isOpen}
      icon={getFormIcon('edit', 'file')}
      title="파일 수정"
      description="등록된 파일의 정보를 수정합니다."
      submitLabel="저장"
      submitIcon={Save}
      isSubmitting={isSubmitting}
      onSubmit={form.handleSubmit(handleSubmit)}
      onClose={onClose}
      mode="edit"
    >
      <Form {...form}>
        {resource && (
          <div className="space-y-2">
            <label className="text-sm font-medium">파일명</label>
            <div className="p-3 rounded-md bg-card border text-sm font-mono text-muted-foreground">
              {resource.fileName}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="fileCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>카테고리 <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryList.map((code) => (
                      <SelectItem key={code.value} value={code.value}>{code.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상세 분류</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="상세 분류 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subCategoryList.length > 0 ? (
                      subCategoryList.map((code) => (
                        <SelectItem key={code.value} value={code.value}>{code.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_empty" disabled>등록된 상세 분류가 없습니다</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="resourceFileName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>파일명 <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="설치 스크립트" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="이 파일에 대한 설명을 입력하세요."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </FormSheet>
  )
}
