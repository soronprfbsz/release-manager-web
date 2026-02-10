/**
 * Not Found Page (404)
 * 페이지를 찾을 수 없을 때 표시되는 에러 페이지
 */

import { Home, ArrowLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 숫자 */}
        <div className="relative mb-8">
          <h1 className="text-[10rem] font-bold leading-none text-primary/10 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-24 w-24 text-primary/40" />
          </div>
        </div>

        {/* 메시지 */}
        <div className="space-y-3 mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-muted-foreground">
            요청하신 페이지가 존재하지 않거나, 이동되었거나, 삭제되었을 수 있습니다.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            이전 페이지
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            홈으로 이동
          </Button>
        </div>

        {/* 추가 도움말 */}
        <p className="mt-8 text-xs text-muted-foreground">
          문제가 지속되면 관리자에게 문의해주세요.
        </p>
      </div>
    </div>
  )
}
