/**
 * DataTableCard Component
 * 테이블 + 헤더(타이틀/아이콘/필터) + 페이지네이션을 포함한 공통 카드 컴포넌트
 * 고객사 관리 스타일을 기준으로 통일
 */

import type { ReactNode } from 'react'

import { TableOfContents } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from './card'
import { DataTablePagination } from './data-table-pagination'
import { ErrorDisplay } from './error-display'

interface PaginationState {
  pageIndex: number
  pageSize: number
}

interface DataTableCardProps {
  /** 카드 타이틀 */
  title: string
  /** 필터 컴포넌트 (검색박스 등) - 유연하게 커스터마이징 가능 */
  filters?: ReactNode
  /** 총 요소 개수 (페이지네이션용) */
  totalElements?: number
  /** 로딩 상태 */
  isLoading: boolean
  /** 에러 객체 */
  error?: Error | null
  /** 에러 시 재시도 핸들러 */
  onRetry?: () => void
  /** 데이터 존재 여부 (페이지네이션 표시용) */
  hasData: boolean
  /** 페이지네이션 상태 */
  pagination: PaginationState
  /** 페이지네이션 변경 핸들러 */
  onPaginationChange: (pagination: PaginationState) => void
  /** 테이블 컴포넌트 */
  children: ReactNode
}

export function DataTableCard({
  title,
  filters,
  totalElements = 0,
  isLoading,
  error,
  onRetry,
  hasData,
  pagination,
  onPaginationChange,
  children,
}: DataTableCardProps) {
  return (
    <Card>
      <CardHeader className="px-8 pb-3 pt-8">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 shrink-0">
            <TableOfContents className="h-5 w-5" />
            {title}
          </CardTitle>
          {filters && <div className="flex-1 flex justify-end">{filters}</div>}
        </div>
      </CardHeader>
      <CardContent className="px-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <ErrorDisplay
            title="데이터를 불러오는 중 오류가 발생했습니다."
            error={error}
            onRetry={onRetry}
          />
        ) : (
          <>
            {children}
            {hasData && (
              <div className="pt-6">
                <DataTablePagination
                  pageIndex={pagination.pageIndex}
                  pageSize={pagination.pageSize}
                  totalElements={totalElements}
                  onPaginationChange={onPaginationChange}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
