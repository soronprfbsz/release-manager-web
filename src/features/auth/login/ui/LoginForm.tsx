import { useState, FormEvent } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Link, useNavigate } from 'react-router-dom'

import { menuKeys } from '@/entities/_shared/menu'

import type { ApiError } from '@/shared/api'
import { ROUTES } from '@/shared/config/constants'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useAuthStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

import { PasswordResetRequestDialog } from './PasswordResetRequestDialog'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResetRequestOpen, setIsResetRequestOpen] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      // 로그인 성공 시 메뉴 캐시 무효화하여 새 권한 즉시 반영
      await queryClient.invalidateQueries({ queryKey: menuKeys.all })
      navigate(ROUTES.HOME)
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const message = axiosError.response?.data?.data?.message || '로그인에 실패했습니다.'
      toast({
        title: '로그인 실패',
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
        <CardTitle className="text-2xl font-bold text-center">Release Manager</CardTitle>
        <CardDescription className="text-center">
          버전 관리 시스템에 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium">
              이메일 <span className="text-destructive">*</span>
            </label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-medium">
              비밀번호 <span className="text-destructive">*</span>
            </label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            회원가입
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setIsResetRequestOpen(true)}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          비밀번호를 잊으셨나요?
        </button>
      </CardFooter>

      <PasswordResetRequestDialog
        open={isResetRequestOpen}
        onOpenChange={setIsResetRequestOpen}
      />
    </Card>
  )
}
