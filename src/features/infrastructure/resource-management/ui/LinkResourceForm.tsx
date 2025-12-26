/**
 * Link Resource Form Component
 * 링크 리소스 추가/수정 폼 시트
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link2, Loader2, Save } from 'lucide-react'

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/shared/ui/sheet'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select'

import type { LinkResource, LinkResourceCreateRequest } from '@/entities/infrastructure/resource'
import { CODE_TYPE, useCodesByType } from '@/entities/_shared/code'

const formSchema = z.object({
    linkName: z.string().min(1, '이름을 입력해주세요.'),
    linkUrl: z.string().url('유효한 URL을 입력해주세요.'),
    linkCategory: z.string().min(1, '카테고리를 선택해주세요.'),
    subCategory: z.string().optional(),
    description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface LinkResourceFormProps {
    isOpen: boolean
    mode?: 'create' | 'update'
    initialData?: LinkResource | null
    isSubmitting: boolean
    onSubmit: (data: LinkResourceCreateRequest) => void
    onClose: () => void
}

export function LinkResourceForm({
    isOpen,
    mode = 'create',
    initialData,
    isSubmitting,
    onSubmit,
    onClose,
}: LinkResourceFormProps) {
    // Fetch Categories from API (Dynamic)
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

    // Helper to find matching category code (case-insensitive)
    const getNormalizedCategory = (value: string) => {
        if (!value) return ''
        const code = categoryList.find(c => c.value.toLowerCase() === value.toLowerCase())
        return code ? code.value : value
    }

    // Reset form with data when both initialData AND categoryList are available (for update mode)
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
            form.reset(defaultValues)
        }
    }, [isOpen, mode, initialData, categoryList, form])

    // Reset form when closed to clear state
    useEffect(() => {
        if (!isOpen) {
            form.reset(defaultValues)
        }
    }, [isOpen, form])

    // Fetch SubCategories from API (Dynamic)
    const { data: subCategoryList = [] } = useCodesByType(CODE_TYPE.LINK_SUBCATEGORY)

    const handleSubmit = (values: FormValues) => {
        onSubmit({
            ...values,
            createdBy: 'admin@tscientific.co.kr'
        })
        // Form reset happens in useEffect or manually if needed, 
        // but usually onClose handles closing which resets on next open
    }

    const title = mode === 'create' ? '링크 리소스 추가' : '링크 리소스 수정'
    const description = mode === 'create'
        ? '새로운 링크 리소스를 추가합니다.'
        : '등록된 링크 리소스의 정보를 수정합니다.'
    const submitLabel = mode === 'create' ? '추가' : '저장'

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:max-w-[400px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

                            <div className="space-y-4">
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

                            <div className="flex gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                    취소
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {mode === 'create' ? '추가 중...' : '저장 중...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {submitLabel}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
