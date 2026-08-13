import { useState, FormEvent } from 'react'

import { AxiosError } from 'axios'
import { Link, useNavigate } from 'react-router-dom'

import { useCodesByType } from '@/entities/_shared/code'
import { AdminContactPicker } from '@/entities/auth/session'

import type { ApiError } from '@/shared/api'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useAuthStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/ui/card'
import { Combobox } from '@/shared/ui/combobox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountName, setAccountName] = useState('')
  const [position, setPosition] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recipientAccountIds, setRecipientAccountIds] = useState<number[]>([])
  const signup = useAuthStore((state) => state.signup)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Position 코드 목록 조회
  const { data: positionCodes = [] } = useCodesByType('POSITION')

  const positionOptions = [
    { value: '', label: '선택 안함' },
    ...positionCodes.map((code) => ({
      value: code.value,
      label: code.name,
    })),
  ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: '비밀번호 불일치',
        description: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: '비밀번호 오류',
        description: '비밀번호는 8자 이상이어야 합니다.',
        variant: 'destructive',
      })
      return
    }

    if (recipientAccountIds.length === 0) {
      toast({
        title: '담당자를 선택해주세요',
        description: '가입 처리를 요청할 담당자를 1명 이상 선택해야 합니다.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      await signup({
        email: email.trim(),
        password,
        accountName,
        position: position || undefined,
        recipientAccountIds,
      })
      toast({
        title: '회원가입 완료',
        description:
          '선택하신 담당자에게 처리 요청을 보냈습니다. 담당자가 권한을 부여하면 모든 기능을 사용할 수 있습니다.',
      })
      navigate('/login')
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const message = axiosError.response?.data?.data?.message || '회원가입에 실패했습니다.'
      toast({
        title: '회원가입 실패',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
        <CardDescription className="text-center">
          새 계정을 만들어 시작하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="signup-name" className="text-sm font-medium">
                이름 <span className="text-destructive">*</span>
              </label>
              <Input
                id="signup-name"
                name="signup-name"
                type="text"
                autoComplete="name"
                placeholder="홍길동"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
                disabled={isLoading}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                직책
              </label>
              <Combobox
                options={positionOptions}
                value={position}
                onValueChange={setPosition}
                placeholder="선택"
                searchPlaceholder="직책 검색..."
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm font-medium">
              이메일 <span className="text-destructive">*</span>
            </label>
            <Input
              id="signup-email"
              name="signup-email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-sm font-medium">
              비밀번호 <span className="text-destructive">*</span>
            </label>
            <Input
              id="signup-password"
              name="signup-password"
              type="password"
              autoComplete="new-password"
              placeholder="8자 이상 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={8}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-password-confirm" className="text-sm font-medium">
              비밀번호 확인 <span className="text-destructive">*</span>
            </label>
            <Input
              id="signup-password-confirm"
              name="signup-password-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호 재입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label id="signup-recipients-label">가입 처리를 요청할 담당자</Label>
            <p className="text-xs text-muted-foreground">
              선택한 담당자에게 권한·부서 배치 요청이 전송됩니다.
            </p>
            <AdminContactPicker
              value={recipientAccountIds}
              onChange={setRecipientAccountIds}
              disabled={isLoading}
              labelledBy="signup-recipients-label"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '가입 중...' : '회원가입'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            로그인
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
