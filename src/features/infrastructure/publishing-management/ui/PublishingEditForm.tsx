/**
 * Publishing Edit Form Component
 * 퍼블리싱 수정 폼 컴포넌트
 */

import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery } from '@tanstack/react-query'

import { Save } from 'lucide-react'

import { getFormIcon } from '@/shared/config/domain-icons'

import type { PublishingListItem, PublishingUpdateRequest } from '@/entities/infrastructure/publishing'
import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'
import { customerApi } from '@/entities/operations'

import { Combobox } from '@/shared/ui/combobox'
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
  publishingName: z.string().min(1, '퍼블리싱명을 입력해주세요.'),
  publishingCategory: z.string().min(1, '카테고리를 선택해주세요.'),
  subCategory: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface PublishingEditFormProps {
  isOpen: boolean
  publishing: PublishingListItem | null
  isSubmitting: boolean
  onSubmit: (data: PublishingUpdateRequest) => void
  onClose: () => void
}

export function PublishingEditForm({
  isOpen,
  publishing,
  isSubmitting,
  onSubmit,
  onClose,
}: PublishingEditFormProps) {
  // 고객사 ID 상태 (zod 외부에서 관리)
  const [customerId, setCustomerId] = useState<number | null>(null)
  
  // 이미 초기화된 publishing ID를 추적하여 중복 초기화 방지
  const initializedIdRef = useRef<number | null>(null)

  // Fetch Categories from API (Dynamic)
  const { data: categoryList = [] } = useCodesByType(CODE_TYPE.PUBLISHING_CATEGORY)

  // Fetch Customers
  const { data: customersData } = useQuery({
    queryKey: ['customers-active'],
    queryFn: () => customerApi.getList({ isActive: true, size: 1000 }),
    enabled: isOpen,
  })
  const customers = customersData?.content || []

  const defaultValues: FormValues = {
    publishingName: '',
    publishingCategory: '',
    subCategory: '',
    description: '',
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Helper to find matching category code (case-insensitive)
  const getNormalizedCategory = (value: string, list: { value: string; name: string }[]) => {
    if (!value) return ''
    const code = list.find(c => c.value.toLowerCase() === value.toLowerCase())
    return code ? code.value : value
  }

  // Reset form with publishing data when both publishing AND categoryList are available
  useEffect(() => {
    if (isOpen && publishing && categoryList.length > 0 && initializedIdRef.current !== publishing.publishingId) {
      initializedIdRef.current = publishing.publishingId
      
      form.reset({
        publishingName: publishing.publishingName,
        publishingCategory: getNormalizedCategory(publishing.publishingCategory, categoryList),
        subCategory: publishing.subCategory || '',
        description: publishing.description || '',
      })
    }
  }, [isOpen, publishing, categoryList])

  // 고객사 ID 설정 (별도 useEffect)
  useEffect(() => {
    if (isOpen && publishing && customers.length > 0) {
      if (publishing.customerName) {
        const matchedCustomer = customers.find(c => c.customerName === publishing.customerName)
        setCustomerId(matchedCustomer?.customerId || null)
      } else {
        setCustomerId(null)
      }
    }
  }, [isOpen, publishing, customers])

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

  const selectedCategory = form.watch('publishingCategory')
  const subCategoryCodeType = getSubCategoryCodeType(selectedCategory)
  const { data: subCategoryList = [] } = useCodesByType(subCategoryCodeType, {
    enabled: !!subCategoryCodeType,
  })

  // Reset form when closed to clear state
  useEffect(() => {
    if (!isOpen) {
      form.reset(defaultValues)
      setCustomerId(null)
      initializedIdRef.current = null
    }
  }, [isOpen])

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      publishingName: values.publishingName,
      publishingCategory: values.publishingCategory,
      subCategory: values.subCategory || undefined,
      description: values.description || undefined,
      customerId: customerId,
    })
  }

  return (
    <FormSheet
      open={isOpen}
      icon={getFormIcon('edit', 'publishing')}
      title="퍼블리싱 수정"
      description="퍼블리싱 정보를 수정합니다."
      submitLabel="저장"
      submitIcon={Save}
      isSubmitting={isSubmitting}
      onSubmit={form.handleSubmit(handleSubmit)}
      onClose={onClose}
      mode="edit"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="publishingCategory"
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
                <FormLabel>서브 카테고리</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="서브 카테고리 선택" />
                    </SelectTrigger>
                  </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="publishingName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>퍼블리싱명 <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="퍼블리싱의 이름을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 고객사 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">고객사</label>
          <Combobox
            options={[
              { value: '__none__', label: '선택 안함' },
              ...customers.map((c) => ({
                value: String(c.customerId),
                label: `${c.customerName} (${c.customerCode})`,
              })),
            ]}
            value={customerId ? String(customerId) : '__none__'}
            onValueChange={(value) =>
              setCustomerId(value === '__none__' || !value ? null : Number(value))
            }
            placeholder="선택 안함"
            searchPlaceholder="고객사 검색..."
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
                  placeholder="퍼블리싱에 대한 상세 설명을 입력하세요"
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
