import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/ui/card'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { AxiosError } from 'axios'
import type { ApiError } from '@/shared/api'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountName, setAccountName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

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

    setIsLoading(true)

    try {
      await signup({ email, password, accountName })
      toast({
        title: '회원가입 완료',
        description: '회원가입이 완료되었습니다. 로그인해주세요.',
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
          <div className="space-y-2">
            <label htmlFor="accountName" className="text-sm font-medium">
              이름 <span className="text-destructive">*</span>
            </label>
            <Input
              id="accountName"
              type="text"
              placeholder="홍길동"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
              disabled={isLoading}
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              이메일 <span className="text-destructive">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              비밀번호 <span className="text-destructive">*</span>
            </label>
            <Input
              id="password"
              type="password"
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
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              비밀번호 확인 <span className="text-destructive">*</span>
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호 재입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
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
