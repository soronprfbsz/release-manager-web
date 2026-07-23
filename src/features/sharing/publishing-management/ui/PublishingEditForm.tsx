/**
 * Publishing Edit Form Component
 * 퍼블리싱 수정 폼 컴포넌트 (글리프 배지 설정 포함)
 */

import { useEffect, useState, useRef } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'
import type { PublishingListItem, PublishingUpdateRequest } from '@/entities/infrastructure/publishing'
import { siteApi } from '@/entities/sites'

import { getFormIcon } from '@/shared/config/domain-icons'
import { GLYPH_COLORS, resolveGlyph, getGlyphFontSizeClass } from '@/shared/lib/glyph'
import { cn } from '@/shared/lib/utils'
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
import { Label } from '@/shared/ui/label'
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
  // 사이트 ID 상태 (zod 외부에서 관리)
  const [siteId, setSiteId] = useState<number | null>(null)
  // 글리프 상태 (zod 외부에서 관리)
  const [glyphText, setGlyphText] = useState('')
  const [glyphBackgroundColor, setGlyphBackgroundColor] = useState('')

  // 이미 초기화된 publishing ID를 추적하여 중복 초기화 방지
  const initializedIdRef = useRef<number | null>(null)

  const { data: categoryList = [] } = useCodesByType(CODE_TYPE.PUBLISHING_CATEGORY)

  const { data: sitesData } = useQuery({
    queryKey: ['sites-active'],
    queryFn: () => siteApi.getList({ isActive: true, size: 1000 }),
    enabled: isOpen,
  })
  const sites = sitesData?.content || []

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

  const getNormalizedCategory = (value: string, list: { value: string; name: string }[]) => {
    if (!value) return ''
    const code = list.find(c => c.value.toLowerCase() === value.toLowerCase())
    return code ? code.value : value
  }

  useEffect(() => {
    if (isOpen && publishing && categoryList.length > 0 && initializedIdRef.current !== publishing.publishingId) {
      initializedIdRef.current = publishing.publishingId

      form.reset({
        publishingName: publishing.publishingName,
        publishingCategory: getNormalizedCategory(publishing.publishingCategory, categoryList),
        subCategory: publishing.subCategory || '',
        description: publishing.description || '',
      })
      setGlyphText(publishing.glyphText || '')
      setGlyphBackgroundColor(publishing.glyphBackgroundColor || '')
    }
  }, [isOpen, publishing, categoryList])

  useEffect(() => {
    if (isOpen && publishing && sites.length > 0) {
      if (publishing.siteName) {
        const matchedSite = sites.find(c => c.siteName === publishing.siteName)
        setSiteId(matchedSite?.siteId || null)
      } else {
        setSiteId(null)
      }
    }
  }, [isOpen, publishing, sites])

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

  useEffect(() => {
    if (!isOpen) {
      form.reset(defaultValues)
      setSiteId(null)
      setGlyphText('')
      setGlyphBackgroundColor('')
      initializedIdRef.current = null
    }
  }, [isOpen])

  // 라이브 프리뷰
  const previewName = form.watch('publishingName') || '?'
  const { text: previewText, glyphClass: previewGlyphClass } = resolveGlyph({
    name: previewName,
    glyphText: glyphText || null,
    glyphBackgroundColor: glyphBackgroundColor || null,
  })
  const previewFontSize = getGlyphFontSizeClass(previewText)

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      publishingName: values.publishingName,
      publishingCategory: values.publishingCategory,
      subCategory: values.subCategory || undefined,
      description: values.description || undefined,
      siteId: siteId,
      glyphText: glyphText,
      glyphBackgroundColor: glyphBackgroundColor,
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

        {/* 사이트 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">사이트</label>
          <Combobox
            options={[
              { value: '__none__', label: '선택 안함' },
              ...sites.map((c) => ({
                value: String(c.siteId),
                label: `${c.siteName} (${c.siteCode})`,
              })),
            ]}
            value={siteId ? String(siteId) : '__none__'}
            onValueChange={(value) =>
              setSiteId(value === '__none__' || !value ? null : Number(value))
            }
            placeholder="선택 안함"
            searchPlaceholder="사이트 검색..."
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

        {/* 글리프 배지 설정 */}
        <div className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">글리프 배지</Label>
            {/* 라이브 프리뷰 */}
            <div
              className={cn(
                'h-10 w-10 rounded-md flex items-center justify-center',
                'font-mono font-semibold select-none',
                previewFontSize,
                previewGlyphClass
              )}
            >
              {previewText}
            </div>
          </div>

          {/* 글리프 텍스트 입력 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              표시 텍스트 (최대 3자, 미입력 시 이름 첫글자 사용)
            </Label>
            <Input
              value={glyphText}
              onChange={(e) => setGlyphText(e.target.value.slice(0, 3))}
              placeholder="예: WEB"
              maxLength={3}
              className="font-mono"
            />
          </div>

          {/* 색상 swatch 그리드 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              배경 색상
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {GLYPH_COLORS.map((color) => {
                const isSelected = glyphBackgroundColor === color.key
                return (
                  <button
                    key={color.key}
                    type="button"
                    title={color.label}
                    onClick={() =>
                      setGlyphBackgroundColor(isSelected ? '' : color.key)
                    }
                    className={cn(
                      'h-7 w-full rounded-md transition-all',
                      color.swatchClass,
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-foreground/60 scale-105'
                        : 'hover:scale-105 hover:ring-1 hover:ring-offset-1 hover:ring-foreground/30'
                    )}
                  />
                )
              })}
            </div>
            {/* 선택된 색상 표시 / 초기화 */}
            {glyphBackgroundColor && (
              <p className="text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  {GLYPH_COLORS.find((c) => c.key === glyphBackgroundColor)?.label ?? glyphBackgroundColor}
                </span>
                <button
                  type="button"
                  onClick={() => setGlyphBackgroundColor('')}
                  className="text-xs underline underline-offset-2 hover:text-foreground"
                >
                  초기화
                </button>
              </p>
            )}
          </div>
        </div>
      </Form>
    </FormSheet>
  )
}
