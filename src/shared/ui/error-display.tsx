import { AlertCircle, RefreshCw } from 'lucide-react'

import { Button } from './button'

interface ErrorDisplayProps {
  title?: string
  message?: string
  error?: Error | null
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({
  title = '데이터를 불러오는 중 오류가 발생했습니다.',
  message,
  error,
  onRetry,
  className = '',
}: ErrorDisplayProps) {
  const errorMessage = message || error?.message || '알 수 없는 오류가 발생했습니다.'

  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] text-muted-foreground ${className}`}>
      <AlertCircle className="h-16 w-16 mb-4 opacity-50" />
      <p className="text-lg mb-2">{title}</p>
      <p className="text-sm mb-4 text-destructive">{errorMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          다시 시도
        </Button>
      )}
    </div>
  )
}
