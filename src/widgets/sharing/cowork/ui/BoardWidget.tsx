/**
 * Board Widget Component
 * 재사용 가능한 게시판 위젯
 */

import { useState, useMemo, useCallback } from 'react'

import { FileText, Loader2 } from 'lucide-react'

import type { PostListItem } from '@/entities/board'
import { usePosts, useCreatePost, useDeletePost } from '@/entities/board'

import {
  PostCardGrid,
  PostListTable,
  PostForm,
  PostDeleteDialog,
  type PostFormData,
  type PostFormMode,
} from '@/features/board'

import { EmptyState } from '@/shared/ui/empty-state'
import { InfiniteScrollContainer } from '@/shared/ui/infinite-scroll'
import { Skeleton } from '@/shared/ui/skeleton'
import { useToast } from '@/shared/lib/hooks/use-toast'

interface BoardWidgetProps {
  /** 토픽 코드 */
  topicId: string
  /** 자유게시판용 이슈 트래킹 표시 */
  showIssueTracking?: boolean
  /** 좋아요 표시 여부 (기본: true) */
  showLike?: boolean
  /** 레이아웃 타입: list(기본) 또는 grid(공지사항용) */
  layout?: 'list' | 'grid'
  /** 게시글 클릭 핸들러 */
  onPostClick?: (post: PostListItem) => void
  /** 글쓰기 폼 모드 (외부 제어) */
  formMode?: PostFormMode
  /** 글쓰기 폼 닫기 핸들러 */
  onFormClose?: () => void
  /** 검색 키워드 (외부 제어) */
  keyword?: string
}

function PostCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BoardWidget({
  topicId,
  showIssueTracking = false,
  showLike = true,
  layout = 'list',
  onPostClick,
  formMode,
  onFormClose,
  keyword = '',
}: BoardWidgetProps) {
  const { toast } = useToast()

  // State
  const [deleteTarget, setDeleteTarget] = useState<PostListItem | null>(null)

  // Queries
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePosts({
    topicId,
    sort: 'createdAt,desc',
    keyword: keyword || undefined,
    size: 10,
  })

  // Mutations
  const createPost = useCreatePost()
  const deletePost = useDeletePost()

  // Derived data - PageResponse의 content에서 게시글 추출
  const { pinnedPosts, regularPosts, isEmpty } = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) {
      return { pinnedPosts: [], regularPosts: [], isEmpty: true }
    }

    // 모든 페이지의 게시글 합침
    const allPosts = data.pages
      .flatMap((page) => page?.content || [])
      .filter(Boolean)

    // 고정 게시글과 일반 게시글 분리 (첫 페이지에서만 고정 게시글 표시)
    const pinnedPosts = allPosts.filter((post) => post.isPinned)
    const regularPosts = allPosts.filter((post) => !post.isPinned)

    return {
      pinnedPosts,
      regularPosts,
      isEmpty: allPosts.length === 0,
    }
  }, [data])

  // Handlers
  const handleCreatePost = useCallback(
    async (formData: PostFormData) => {
      const hasIssueData = formData.status || formData.priority || formData.assigneeId
      try {
        await createPost.mutateAsync({
          topicId,
          title: formData.title,
          content: formData.content,
          isPinned: formData.isPinned,
          isPublished: true,
          ...(showIssueTracking && hasIssueData && {
            issue: {
              status: formData.status || undefined,
              priority: formData.priority || undefined,
              assigneeId: formData.assigneeId || undefined,
            },
          }),
        })
        onFormClose?.()
        toast({
          title: '게시글 작성 완료',
          description: '게시글이 등록되었습니다.',
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '오류',
          description: '게시글 작성에 실패했습니다.',
        })
      }
    },
    [topicId, showIssueTracking, createPost, toast, onFormClose]
  )

  const handleDeletePost = useCallback(async () => {
    if (!deleteTarget) return

    try {
      await deletePost.mutateAsync(deleteTarget.postId)
      setDeleteTarget(null)
      toast({
        title: '게시글 삭제 완료',
        description: '게시글이 삭제되었습니다.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '게시글 삭제에 실패했습니다.',
      })
    }
  }, [deleteTarget, deletePost, toast])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <div className="space-y-3">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    )
  }

  // Error state - show empty with create option
  if (isError) {
    return (
      <div className="space-y-4 pt-4">
        <EmptyState
          icon={FileText}
          title="게시판 서비스 준비 중"
          description="게시판 기능이 곧 활성화됩니다"
        />
        <PostForm
          mode={formMode ?? null}
          topicId={topicId}
          showIssueTracking={showIssueTracking}
          isSubmitting={createPost.isPending}
          onSubmit={handleCreatePost}
          onClose={() => onFormClose?.()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      {/* 게시글 목록 */}
      {isEmpty ? (
        <EmptyState
          icon={FileText}
          title="등록된 게시글이 없습니다"
        />
      ) : layout === 'grid' ? (
        // 그리드 레이아웃 (공지사항)
        <InfiniteScrollContainer
          hasNextPage={hasNextPage || false}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          className="divide-y divide-border"
          loader={
            <div className="col-span-full flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          }
        >
          {/* 고정 게시글 */}
          {pinnedPosts.map((post) => (
            <PostCardGrid
              key={`pinned-${post.postId}`}
              post={post}
              onClick={() => onPostClick?.(post)}
            />
          ))}

          {/* 일반 게시글 */}
          {regularPosts.map((post) => (
            <PostCardGrid
              key={post.postId}
              post={post}
              onClick={() => onPostClick?.(post)}
            />
          ))}
        </InfiniteScrollContainer>
      ) : (
        // 리스트 레이아웃 (자유게시판) - 공통 테이블 컴포넌트 사용
        <PostListTable
          pinnedPosts={pinnedPosts}
          regularPosts={regularPosts}
          showLike={showLike}
          onPostClick={onPostClick}
          hasNextPage={hasNextPage || false}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}

      {/* 게시글 작성 폼 */}
      <PostForm
        mode={formMode ?? null}
        topicId={topicId}
        showIssueTracking={showIssueTracking}
        isSubmitting={createPost.isPending}
        onSubmit={handleCreatePost}
        onClose={() => onFormClose?.()}
      />

      {/* 삭제 확인 다이얼로그 */}
      <PostDeleteDialog
        isOpen={!!deleteTarget}
        isDeleting={deletePost.isPending}
        onConfirm={handleDeletePost}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
