import * as React from "react"

import { Loader2 } from "lucide-react"

import { cn } from "@/shared/lib/utils"

import { InfiniteScrollContainer } from "./infinite-scroll/InfiniteScrollContainer"
import { ScrollArea } from "./scroll-area"

/**
 * 데이터 테이블 래퍼 컴포넌트
 * - shadcn ScrollArea 기반으로 테마에 맞는 스크롤바 스타일 제공
 * - 테이블 영역의 고정 높이를 설정하고, 내용이 넘치면 스크롤 표시
 * - 무한 스크롤 또는 고전적 페이징 지원
 *
 * 사용 패턴 (Backstage 셸):
 *   <PageLayout>
 *     <ContentCard fullHeight>          // viewport 잔여 높이 채움 + 스크롤 책임
 *       <DataTable autoHeight>          // 자체 스크롤 X — 부모가 처리
 *         <Table>…</Table>
 *       </DataTable>
 *     </ContentCard>
 *   </PageLayout>
 *
 * 사용 예 (고전적 페이징, 고정 visibleRows):
 * <DataTable visibleRows={10}>
 *   <Table>...</Table>
 * </DataTable>
 *
 * @deprecated viewportHeight — `calc(100vh - Nrem)` 매직 넘버 패턴.
 * 신규 코드는 `ContentCard fullHeight` + `DataTable autoHeight` 조합을 사용.
 *
 * 무한 스크롤 사용 예:
 * <DataTable
 *   paginationMode="infinite"
 *   hasNextPage={hasNextPage}
 *   isFetchingNextPage={isFetchingNextPage}
 *   fetchNextPage={fetchNextPage}
 * >
 *   <Table>...</Table>
 * </DataTable>
 */

/** 페이징 모드 */
type PaginationMode = 'classic' | 'infinite'

interface DataTableBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** 페이징 모드 (기본: classic) */
  paginationMode?: PaginationMode
  /** 테이블 영역에 표시할 row 수 기준 (기본: 10) - 이 값으로 영역 높이 계산 */
  visibleRows?: number
  /** row 높이 (기본: 41px - border 포함) */
  rowHeight?: number
  /** 헤더 높이 (기본: 36px - border 포함) */
  headerHeight?: number
  /** 스크롤 없이 전체 표시 (높이 제한 없음) */
  autoHeight?: boolean
  /**
   * 뷰포트 기반 동적 높이 (e.g. "calc(100vh - 20rem)") - 설정 시 visibleRows 무시
   * @deprecated 신규 코드는 `<ContentCard fullHeight>` + `<DataTable autoHeight>` 사용
   */
  viewportHeight?: string
  /** 테두리 표시 여부 (기본: false) - Card 외부에서 독립적으로 사용할 때 true */
  bordered?: boolean
}

interface InfiniteScrollProps {
  /** 추가 데이터가 있는지 여부 (무한 스크롤 모드 필수) */
  hasNextPage?: boolean
  /** 데이터 로딩 중인지 여부 (무한 스크롤 모드 필수) */
  isFetchingNextPage?: boolean
  /** 다음 페이지 로드 함수 (무한 스크롤 모드 필수) */
  fetchNextPage?: () => void
  /** 끝 메시지 (무한 스크롤 모드) */
  endMessage?: React.ReactNode
}

type DataTableProps = DataTableBaseProps & InfiniteScrollProps

export function DataTable({
  children,
  className,
  paginationMode = 'classic',
  visibleRows = 10,
  rowHeight = 40,
  headerHeight = 33,
  autoHeight = false,
  viewportHeight,
  bordered = false,
  // Infinite scroll props
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  endMessage,
}: DataTableProps) {
  const borderClass = bordered ? "rounded-md border" : ""

  // 무한 스크롤 모드
  if (paginationMode === 'infinite' && fetchNextPage) {
    const loader = (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )

    // 뷰포트 높이가 지정된 경우 ScrollArea 내부에 InfiniteScrollContainer
    if (viewportHeight) {
      return (
        <ScrollArea
          className={cn(borderClass, className)}
          style={{ height: viewportHeight }}
        >
          <InfiniteScrollContainer
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            loader={loader}
            endMessage={endMessage}
          >
            {children}
          </InfiniteScrollContainer>
        </ScrollArea>
      )
    }

    // autoHeight 또는 기본
    return (
      <div className={cn("w-full", borderClass, className)}>
        <InfiniteScrollContainer
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          loader={loader}
          endMessage={endMessage}
        >
          {children}
        </InfiniteScrollContainer>
      </div>
    )
  }

  // 기존 고전적 페이징 모드
  // autoHeight: 자체 세로 스크롤 X. 단, 컬럼 합계가 컨테이너보다 넓을 때
  // overflow-x-auto 가 테이블 영역 안에서 가로 스크롤을 처리해 main 으로 새지 않게 함.
  if (autoHeight) {
    return (
      <div className={cn("w-full overflow-x-auto", borderClass, className)}>
        {children}
      </div>
    )
  }

  // 뷰포트 기반 동적 높이 사용
  if (viewportHeight) {
    return (
      <ScrollArea
        className={cn(borderClass, className)}
        style={{ height: viewportHeight }}
      >
        {children}
      </ScrollArea>
    )
  }

  // 테이블 영역 높이 계산: 헤더 + (row 높이 * visibleRows)
  const tableHeight = headerHeight + (rowHeight * visibleRows)

  return (
    <ScrollArea
      className={cn(borderClass, className)}
      style={{ height: tableHeight }}
    >
      {children}
    </ScrollArea>
  )
}
