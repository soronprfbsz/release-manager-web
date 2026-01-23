/**
 * InfiniteScrollContainer
 * Intersection Observer 기반 무한 스크롤 컨테이너 컴포넌트
 */

import { useEffect, useRef, ReactNode } from 'react'

import { Loader2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface InfiniteScrollContainerProps {
  /** 자식 요소들 */
  children: ReactNode
  /** 추가 데이터가 있는지 여부 */
  hasNextPage: boolean
  /** 데이터 로딩 중인지 여부 */
  isFetchingNextPage: boolean
  /** 다음 페이지 로드 함수 */
  fetchNextPage: () => void
  /** Intersection Observer root margin */
  rootMargin?: string
  /** Intersection Observer threshold */
  threshold?: number
  /** 컨테이너 클래스명 */
  className?: string
  /** 로더 컴포넌트 커스터마이징 */
  loader?: ReactNode
  /** 끝 메시지 */
  endMessage?: ReactNode
}

export function InfiniteScrollContainer({
  children,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootMargin = '100px',
  threshold = 0.1,
  className,
  loader,
  endMessage,
}: InfiniteScrollContainerProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        rootMargin,
        threshold,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin, threshold])

  const defaultLoader = (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">불러오는 중...</span>
    </div>
  )

  return (
    <div className={cn('relative', className)}>
      {children}

      {/* Intersection Observer 타겟 */}
      <div ref={loadMoreRef} className="h-1" />

      {/* 로딩 상태 */}
      {isFetchingNextPage && (loader || defaultLoader)}

      {/* 끝 메시지 */}
      {!hasNextPage && !isFetchingNextPage && endMessage}
    </div>
  )
}
