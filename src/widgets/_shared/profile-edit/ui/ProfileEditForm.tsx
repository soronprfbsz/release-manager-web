/**
 * Profile Edit Form Component
 * 내 정보 수정 폼 시트
 */

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Save, Lock, Eye, EyeOff, User, Shuffle, Check } from 'lucide-react'

import { useUpdateMyAccount, type MyAccountUpdateRequest } from '@/entities/operations/account'
import { useCodesByType } from '@/entities/_shared/code'
import { useAuthStore } from '@/shared/store'
import { useToast } from '@/shared/lib/hooks/use-toast'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DiceBearAvatar,
  AVATAR_STYLES,
  RECOMMENDED_AVATAR_STYLES,
  DEFAULT_AVATAR_STYLE,
  type AvatarStyleKey,
} from '@/shared/ui/dicebear-avatar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Combobox } from '@/shared/ui/combobox'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'

const formSchema = z.object({
  accountName: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다.')
    .max(50, '이름은 50자 이하여야 합니다.'),
  position: z.string().optional(),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 8,
      '비밀번호는 8자 이상이어야 합니다.'
    )
    .refine(
      (val) => !val || val.length <= 100,
      '비밀번호는 100자 이하여야 합니다.'
    ),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => !data.password || data.password === data.confirmPassword,
  {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  }
)

type FormValues = z.infer<typeof formSchema>

interface ProfileEditFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 랜덤 시드 생성
function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function ProfileEditForm({ open, onOpenChange }: ProfileEditFormProps) {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const { toast } = useToast()
  const updateMyAccount = useUpdateMyAccount()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // 아바타 수정 모드 토글
  const [isAvatarEditMode, setIsAvatarEditMode] = useState(false)

  // 아바타 상태
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState<AvatarStyleKey>(DEFAULT_AVATAR_STYLE)
  const [avatarSeed, setAvatarSeed] = useState<string>('')

  // 변경 비교를 위한 원본 값
  const [originalAvatarStyle, setOriginalAvatarStyle] = useState<AvatarStyleKey>(DEFAULT_AVATAR_STYLE)
  const [originalAvatarSeed, setOriginalAvatarSeed] = useState<string>('')

  // 폼 초기화 여부 추적
  const [isInitialized, setIsInitialized] = useState(false)

  // Position 코드 목록 조회
  const { data: positionCodes = [] } = useCodesByType('POSITION', {
    enabled: open,
  })

  const positionOptions = [
    { value: '', label: '선택 안함' },
    ...positionCodes.map((code) => ({
      value: code.value,
      label: code.name,
    })),
  ]

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountName: '',
      position: '',
      password: '',
      confirmPassword: '',
    },
  })

  // 폼 최초 1회만 초기화 (첫 열기 또는 새로고침 후)
  useEffect(() => {
    if (user && !isInitialized) {
      form.reset({
        accountName: user.accountName,
        position: user.position || '',
        password: '',
        confirmPassword: '',
      })

      const style = (user.avatarStyle as AvatarStyleKey) || DEFAULT_AVATAR_STYLE
      const seed = user.avatarSeed || user.email

      setSelectedAvatarStyle(style)
      setAvatarSeed(seed)
      setOriginalAvatarStyle(style)
      setOriginalAvatarSeed(seed)

      setShowPassword(false)
      setShowConfirmPassword(false)
      setIsAvatarEditMode(false)
      setIsInitialized(true)
    }
  }, [user, isInitialized, form])

  // 아바타 시드 랜덤 생성
  const handleRandomize = useCallback(() => {
    setAvatarSeed(generateRandomSeed())
  }, [])

  // 스타일 변경 핸들러
  const handleStyleChange = (style: AvatarStyleKey) => {
    setSelectedAvatarStyle(style)
  }

  const handleSubmit = () => {
    form.handleSubmit((values: FormValues) => {
      const request: MyAccountUpdateRequest = {}

      // 변경된 필드만 포함
      if (values.accountName !== user?.accountName) {
        request.accountName = values.accountName
      }
      if ((values.position || '') !== (user?.position || '')) {
        request.position = values.position || undefined
      }
      if (values.password) {
        request.password = values.password
      }
      // 아바타 수정 모드가 활성화된 경우에만 아바타 변경사항 포함
      if (isAvatarEditMode) {
        if (selectedAvatarStyle !== originalAvatarStyle) {
          request.avatarStyle = selectedAvatarStyle
        }
        if (avatarSeed !== originalAvatarSeed) {
          request.avatarSeed = avatarSeed
        }
      }

      // 변경사항이 없으면 시트 닫기
      if (Object.keys(request).length === 0) {
        onOpenChange(false)
        return
      }

      updateMyAccount.mutate(request, {
        onSuccess: (data) => {
          // 로컬 사용자 상태 업데이트
          if (user) {
            setUser({
              ...user,
              accountName: data.accountName,
              position: data.position,
              positionName: data.positionName,
              avatarStyle: data.avatarStyle,
              avatarSeed: data.avatarSeed,
            })
          }

          // 아바타 변경 시 관련 쿼리 캐시 무효화
          if (request.avatarStyle || request.avatarSeed) {
            queryClient.invalidateQueries({ queryKey: ['releases'] })
            queryClient.invalidateQueries({ queryKey: ['patches'] })
            queryClient.invalidateQueries({ queryKey: ['versionTree'] })
          }

          // 저장 성공 후 원본 값 갱신
          setOriginalAvatarStyle(selectedAvatarStyle)
          setOriginalAvatarSeed(avatarSeed)

          // 비밀번호 필드 및 아바타 수정 모드 초기화
          form.setValue('password', '')
          form.setValue('confirmPassword', '')
          setShowPassword(false)
          setShowConfirmPassword(false)
          setIsAvatarEditMode(false)

          toast({
            title: '내 정보 수정 완료',
            description: '정보가 성공적으로 수정되었습니다.',
          })
          onOpenChange(false)
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: '수정 실패',
            description: '정보 수정에 실패했습니다. 다시 시도해주세요.',
          })
        },
      })
    })()
  }

  return (
    <FormSheet
      open={open}
      icon={User}
      title="내 정보 수정"
      description="아바타, 이름, 비밀번호를 변경할 수 있습니다."
      submitLabel="저장"
      submitIcon={Save}
      isSubmitting={updateMyAccount.isPending}
      onSubmit={handleSubmit}
      onClose={() => onOpenChange(false)}
      mode="edit"
    >
      <Form {...form}>
        {/* 아바타 섹션 (토글) */}
        <div className="space-y-4">
          {/* 토글 헤더 */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              <DiceBearAvatar
                seed={isAvatarEditMode ? avatarSeed : (user?.avatarSeed || user?.email || '')}
                style={isAvatarEditMode ? selectedAvatarStyle : ((user?.avatarStyle as AvatarStyleKey) || DEFAULT_AVATAR_STYLE)}
                size={40}
                name={user?.accountName}
              />
              <div>
                <p className="text-sm font-medium">아바타 수정</p>
                <p className="text-xs text-muted-foreground">
                  {isAvatarEditMode ? '아바타 스타일을 변경할 수 있습니다.' : '토글을 켜서 아바타를 수정하세요.'}
                </p>
              </div>
            </div>
            <Switch
              checked={isAvatarEditMode}
              onCheckedChange={setIsAvatarEditMode}
            />
          </div>

          {/* 아바타 수정 영역 (토글 ON일 때만 표시) */}
          {isAvatarEditMode && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              {/* 현재 아바타 미리보기 */}
              <div className="flex items-center gap-4 p-4 rounded-lg border">
                <DiceBearAvatar
                  seed={avatarSeed}
                  style={selectedAvatarStyle}
                  size={72}
                  name={user?.accountName}
                  className="border-2 border-background shadow-md"
                />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium">현재 선택</p>
                  <p className="text-xs text-muted-foreground">
                    {AVATAR_STYLES[selectedAvatarStyle]?.name || selectedAvatarStyle}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRandomize}
                    className="gap-2"
                  >
                    <Shuffle className="h-4 w-4" />
                    랜덤 생성
                  </Button>
                </div>
              </div>

              {/* 스타일 선택 */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">스타일 선택</p>
                <div className="grid grid-cols-5 gap-2">
                  {RECOMMENDED_AVATAR_STYLES.map((styleKey) => {
                    const isSelected = selectedAvatarStyle === styleKey
                    return (
                      <button
                        key={styleKey}
                        type="button"
                        onClick={() => handleStyleChange(styleKey)}
                        className={cn(
                          'relative p-1.5 rounded-lg border-2 transition-all hover:scale-105',
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-transparent hover:border-muted-foreground/30 hover:bg-accent'
                        )}
                        title={AVATAR_STYLES[styleKey].name}
                      >
                        <DiceBearAvatar
                          seed={avatarSeed}
                          style={styleKey}
                          size={48}
                          name={user?.accountName}
                          className="rounded-md"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="border-t" />

        {/* 이메일 (읽기 전용) */}
        <div className="space-y-2">
          <Label>이메일</Label>
          <Input value={user?.email || ''} disabled className="bg-muted" />
        </div>

        {/* 이름 & 직책 */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="accountName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름 <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="이름을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>직책</FormLabel>
                <FormControl>
                  <Combobox
                    options={positionOptions}
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    placeholder="직책을 선택하세요"
                    searchPlaceholder="직책 검색..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 새 비밀번호 */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                새 비밀번호
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="변경할 비밀번호 입력"
                    autoComplete="new-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 비밀번호 확인 */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                비밀번호 확인
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="비밀번호 다시 입력"
                    autoComplete="new-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </FormSheet>
  )
}
