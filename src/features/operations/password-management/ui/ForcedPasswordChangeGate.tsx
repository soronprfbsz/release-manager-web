/**
 * Forced Password Change Gate
 * 강제 비밀번호 변경 게이트 — 전체 차단 화면. 변경 완료 전까지 다른 화면 접근 불가,
 * 로그아웃만 허용. 게이트는 자가 변경과 동일한 엔드포인트를 사용한다(현재 비번=임시 비번). PRD §5.3
 */

import { LogOut, ShieldAlert } from 'lucide-react'

import { useAuthStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

import { ChangePasswordForm } from './ChangePasswordForm'

export function ForcedPasswordChangeGate() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  const handleSuccess = () => {
    // 플래그 해제 → 게이트 자동 해제
    if (user) {
      setUser({ ...user, mustChangePassword: false })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            비밀번호 변경 필요
          </CardTitle>
          <CardDescription>
            임시 비밀번호로 로그인했습니다. 계속하려면 비밀번호를 변경해야 합니다. 현재 비밀번호에는
            전달받은 임시 비밀번호를 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChangePasswordForm
            submitLabel="비밀번호 변경 후 계속"
            currentLabel="현재 비밀번호 (임시 비밀번호)"
            onSuccess={handleSuccess}
          />
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
