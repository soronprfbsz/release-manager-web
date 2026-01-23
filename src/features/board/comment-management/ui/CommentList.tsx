/**
 * Comment List Component
 * 댓글 목록 컨테이너 컴포넌트
 */

import { useMemo } from 'react'

import { MessageSquare, Loader2 } from 'lucide-react'

import type { Comment, BoardPageResponse } from '@/entities/board'

import { InfiniteScrollContainer } from '@/shared/ui/infinite-scroll'
import { Skeleton } from '@/shared/ui/skeleton'

import { CommentItem } from './CommentItem'

interface CommentListProps {
  pages: BoardPageResponse<Comment>[] | undefined
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  totalCount?: number
  currentUserId?: number // 현재 로그인한 사용자 ID
  onReply?: (commentId: number) => void
  onEdit?: (comment: Comment) => void
  onDelete?: (commentId: number) => void
  onLike?: (commentId: number) => void
  hideHeader?: boolean
  /** 인라인 답글 폼 렌더링용 */
  replyingToCommentId?: number | null
  renderReplyForm?: (commentId: number) => React.ReactNode
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-6 w-14" />
        </div>
      </div>
    </div>
  )
}

export function CommentList({
  pages,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  totalCount = 0,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onLike,
  hideHeader = false,
  replyingToCommentId,
  renderReplyForm,
}: CommentListProps) {
  // 모든 페이지의 댓글을 하나로 합침
  const comments = useMemo(() => {
    if (!pages) return []
    return pages.flatMap((page) => page.content)
  }, [pages])

  // 초기 로딩
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>댓글</span>
        </div>
        <div className="space-y-4">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      {!hideHeader && (
        <div className="flex items-center gap-2 text-sm">
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium">댓글</span>
          <span className="text-muted-foreground">{totalCount}개</span>
        </div>
      )}

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <div className="py-2" /> // Empty spacer instead of text
      ) : (
        <InfiniteScrollContainer
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          className="space-y-4"
          loader={
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          }
        >
          {comments.map((comment) => (
            <div key={comment.commentId}>
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onLike={onLike}
              />
              {/* 인라인 답글 폼 */}
              {replyingToCommentId === comment.commentId && renderReplyForm && (
                <div className="ml-11 mt-3">
                  {renderReplyForm(comment.commentId)}
                </div>
              )}
            </div>
          ))}
        </InfiniteScrollContainer>
      )}
    </div>
  )
}
