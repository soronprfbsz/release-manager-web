/**
 * Resource Edit Form Component
 * 리소스 파일 정보 수정 폼 시트
 * - 파일 자체는 변경 불가, 메타데이터만 수정
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FileText, Loader2, Save } from 'lucide-react'

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

import type { ResourceFile, ResourceFileUpdateRequest } from '@/entities/resource'
import { CODE_TYPE, useCodesByType } from '@/entities/code'

const formSchema = z.object({
    resourceFileName: z.string().min(1, '리소스명을 입력해주세요.'),
    fileCategory: z.string().min(1, '카테고리를 선택해주세요.'),
    subCategory: z.string().optional(),
    description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ResourceEditFormProps {
    isOpen: boolean
    resource: ResourceFile | null
    isSubmitting: boolean
    onSubmit: (data: ResourceFileUpdateRequest) => void
    onClose: () => void
}

export function ResourceEditForm({
    isOpen,
    resource,
    isSubmitting,
    onSubmit,
    onClose,
}: ResourceEditFormProps) {
    // Fetch Categories from API (Dynamic)
    const { data: categoryList = [] } = useCodesByType(CODE_TYPE.RESOURCE_FILE_CATEGORY)

    const defaultValues: FormValues = {
        resourceFileName: '',
        fileCategory: '',
        subCategory: '',
        description: '',
    }

    // Helper to find matching category code (case-insensitive)
    const getNormalizedCategory = (value: string) => {
        if (!value) return ''
        const code = categoryList.find(c => c.value.toLowerCase() === value.toLowerCase())
        return code ? code.value : value
    }

    const formValues = resource ? {
        resourceFileName: resource.resourceFileName,
        fileCategory: getNormalizedCategory(resource.fileCategory),
        subCategory: resource.subCategory || '',
        description: resource.description || '',
    } : defaultValues

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
        values: isOpen ? formValues : undefined,
    })

    // Get subcategory code type based on selected category
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

    // Reset form when closed to clear state
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
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:max-w-[400px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        리소스 파일 수정
                    </SheetTitle>
                    <SheetDescription>
                        등록된 리소스 파일의 정보를 수정합니다.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            {/* 파일명 표시 (읽기 전용) */}
                            {resource && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">파일명</label>
                                    <div className="p-3 rounded-md bg-muted text-sm font-mono text-muted-foreground">
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
                                        <FormLabel>리소스명 <span className="text-destructive">*</span></FormLabel>
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
                                                placeholder="이 리소스에 대한 설명을 입력하세요."
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
                                            저장 중...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            저장
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
