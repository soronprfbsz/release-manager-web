/**
 * Link Form Component
 * 링크 추가/수정 폼 시트
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Save } from 'lucide-react'

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
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import type { LinkResource, LinkResourceCreateRequest } from '@/entities/infrastructure/link'
import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'

const formSchema = z.object({
  linkName: z.string().min(1, '이름을 입력해주세요.'),
  linkUrl: z.string().url('유효한 URL을 입력해주세요.'),
  linkCategory: z.string().min(1, '카테고리를 선택해주세요.'),
  subCategory: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface LinkFormProps {
  isOpen: boolean
  mode?: 'create' | 'update'
  initialData?: LinkResource | null
  /** 생성 모드에서 기본 선택될 카테고리 */
  defaultCategory?: string
  isSubmitting: boolean
  onSubmit: (data: LinkResourceCreateRequest) => void
  onClose: () => void
}

export function LinkForm({
  isOpen,
  mode = 'create',
  initialData,
  defaultCategory,
  isSubmitting,
  onSubmit,
  onClose,
}: LinkFormProps) {
  const { data: categoryList = [] } = useCodesByType(CODE_TYPE.LINK_CATEGORY)

  const defaultValues: FormValues = {
    linkName: '',
    linkUrl: '',
    linkCategory: '',
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
    if (isOpen && mode === 'update' && initialData && categoryList.length > 0) {
      form.reset({
        linkName: initialData.linkName,
        linkUrl: initialData.linkUrl,
        linkCategory: getNormalizedCategory(initialData.linkCategory),
        subCategory: initialData.subCategory || '',
        description: initialData.description || '',
      })
    } else if (isOpen && mode === 'create') {
      form.reset({
        ...defaultValues,
        linkCategory: defaultCategory || '',
      })
    }
  }, [isOpen, mode, initialData, defaultCategory, categoryList, form])

  useEffect(() => {
    if (!isOpen) {
      form.reset(defaultValues)
    }
  }, [isOpen, form])

  const { data: subCategoryList = [] } = useCodesByType(CODE_TYPE.LINK_SUBCATEGORY)

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      ...values,
      createdBy: 'admin@tscientific.co.kr'
    })
  }

  return (
    <FormSheet
      open={isOpen}
      icon={getFormIcon(mode === 'update' ? 'edit' : 'create', 'link')}
      title={{ create: '링크 추가', edit: '링크 수정' }}
      description={{ create: '새로운 링크를 추가합니다.', edit: '등록된 링크의 정보를 수정합니다.' }}
      submitLabel={{ create: '추가', edit: '저장' }}
      submitIcon={Save}
      isSubmitting={isSubmitting}
      onSubmit={form.handleSubmit(handleSubmit)}
      onClose={onClose}
      mode={mode === 'update' ? 'edit' : 'create'}
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="linkCategory"
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

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="linkName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>링크 이름 <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Infraeye2 요구사항 정의서" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>링크 주소 <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="이 링크에 대한 설명을 입력하세요."
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
