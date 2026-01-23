/**
 * Post Detail View Component
 * 게시글 상세 + 댓글 섹션 컴포넌트
 */

import { useState, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  ThumbsUp,
  Pencil,
  Trash2,
  MoreHorizontal,
  Pin,
  ArrowLeft,
} from 'lucide-react'

import { useQueryClient } from '@tanstack/react-query'

import type { Comment, IssueStatus, IssuePriority } from '@/entities/board'
import {
  postKeys,
  usePost,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useTogglePostLike,
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useToggleCommentLike,
} from '@/entities/board'

import {
  PostForm,
  PostDeleteDialog,
  CommentForm,
  CommentList,
  CommentDeleteDialog,
  type PostFormData,
  type PostFormMode,
  type CommentFormData,
  type CommentFormMode,
} from '@/features/board'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { UserAvatar } from '@/shared/ui/user-avatar'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/shared/store'

interface PostDetailViewProps {
  postId: number
  topicId: string
  showIssueTracking?: boolean
  /** 글쓰기 폼 모드 (외부 제어 - 생성용) */
  formMode?: PostFormMode
  /** 글쓰기 폼 닫기 핸들러 */
  onFormClose?: () => void
}

const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  OPEN: { label: '미해결', variant: 'destructive' },
  IN_PROGRESS: { label: '진행중', variant: 'default' },
  RESOLVED: { label: '해결됨', variant: 'secondary' },
  CLOSED: { label: '종료', variant: 'outline' },
}

const PRIORITY_CONFIG: Record<IssuePriority, { label: string; className: string }> = {
  LOW: { label: '낮음', className: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: '중간', className: 'bg-blue-100 text-blue-600' },
  HIGH: { label: '높음', className: 'bg-orange-100 text-orange-600' },
  URGENT: { label: '긴급', className: 'bg-red-100 text-red-600' },
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PostDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
}

export function PostDetailView({
  postId,
  topicId,
  showIssueTracking = false,
  formMode,
  onFormClose,
}: PostDetailViewProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = useAuthStore((state) => state.user)

  // Post form state
  const [postFormMode, setPostFormMode] = useState<PostFormMode>(null)
  const [showPostDelete, setShowPostDelete] = useState(false)

  // Comment form state
  const [commentFormMode, setCommentFormMode] = useState<CommentFormMode>(null)
  const [replyToComment, setReplyToComment] = useState<Comment | null>(null)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null)

  // Queries
  const { data: post, isLoading: isLoadingPost } = usePost(postId)
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    isFetchingNextPage: isFetchingComments,
    hasNextPage: hasMoreComments,
    fetchNextPage: fetchMoreComments,
  } = useComments(postId)

  // Mutations
  const createPost = useCreatePost()
  const updatePost = useUpdatePost()
  const deletePost = useDeletePost()
  const togglePostLike = useTogglePostLike()

  const createComment = useCreateComment()
  const updateComment = useUpdateComment()
  const deleteComment = useDeleteComment()
  const toggleCommentLike = useToggleCommentLike()
  // Computed: isAuthor
  const isPostAuthor = useMemo(() => {
    if (!post || !currentUser) return false
    return post.createdById === currentUser.accountId
  }, [post, currentUser])

  // 목록으로 돌아가기 (목록 쿼리 무효화 후)
  const handleBack = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    // URL 파라미터에서 postId 제거하여 목록으로 복귀
    searchParams.delete('postId')
    setSearchParams(searchParams)
  }, [queryClient, searchParams, setSearchParams])

  // Handlers - Post Create (외부에서 제어)
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

  // Handlers - Post
  const handleUpdatePost = useCallback(
    async (formData: PostFormData) => {
      try {
        await updatePost.mutateAsync({
          id: postId,
          data: {
            title: formData.title,
            content: formData.content,
            isPinned: formData.isPinned,
            issue: formData.status || formData.priority || formData.assigneeId
              ? {
                status: formData.status || undefined,
                priority: formData.priority || undefined,
                assigneeId: formData.assigneeId ?? undefined,
              }
              : undefined,
          },
        })
        setPostFormMode(null)
        toast({
          title: '게시글 수정 완료',
          description: '게시글이 수정되었습니다.',
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '오류',
          description: '게시글 수정에 실패했습니다.',
        })
      }
    },
    [postId, updatePost, toast]
  )

  const handleDeletePost = useCallback(async () => {
    try {
      await deletePost.mutateAsync(postId)
      setShowPostDelete(false)
      toast({
        title: '게시글 삭제 완료',
        description: '게시글이 삭제되었습니다.',
      })
      handleBack()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '게시글 삭제에 실패했습니다.',
      })
    }
  }, [postId, deletePost, toast, handleBack])

  const handleTogglePostLike = useCallback(() => {
    togglePostLike.mutate(postId)
  }, [postId, togglePostLike])

  // Handlers - Comment
  const handleCreateComment = useCallback(
    async (formData: CommentFormData) => {
      try {
        await createComment.mutateAsync({
          postId,
          parentCommentId: formData.parentCommentId || undefined,
          content: formData.content,
        })
        setCommentFormMode(null)
        setReplyToComment(null)
        toast({
          title: '댓글 등록 완료',
          description: '댓글이 등록되었습니다.',
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '오류',
          description: '댓글 등록에 실패했습니다.',
        })
      }
    },
    [postId, createComment, toast]
  )

  const handleUpdateComment = useCallback(
    async (formData: CommentFormData) => {
      if (!editingComment) return

      try {
        await updateComment.mutateAsync({
          id: editingComment.commentId,
          postId,
          data: { content: formData.content },
        })
        setCommentFormMode(null)
        setEditingComment(null)
        toast({
          title: '댓글 수정 완료',
          description: '댓글이 수정되었습니다.',
        })
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '오류',
          description: '댓글 수정에 실패했습니다.',
        })
      }
    },
    [postId, editingComment, updateComment, toast]
  )

  const handleDeleteComment = useCallback(async () => {
    if (deleteCommentId === null) return

    try {
      await deleteComment.mutateAsync({ id: deleteCommentId, postId })
      setDeleteCommentId(null)
      toast({
        title: '댓글 삭제 완료',
        description: '댓글이 삭제되었습니다.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '댓글 삭제에 실패했습니다.',
      })
    }
  }, [postId, deleteCommentId, deleteComment, toast])

  const handleReply = useCallback(
    (commentId: number) => {
      const comment = commentsData?.pages
        .flatMap((p) => p.content)
        .find((c) => c.commentId === commentId)
      if (comment) {
        setReplyToComment(comment)
        setCommentFormMode('reply')
      }
    },
    [commentsData]
  )

  const handleEditComment = useCallback((comment: Comment) => {
    setEditingComment(comment)
    setCommentFormMode('edit')
  }, [])

  const handleToggleCommentLike = useCallback(
    (commentId: number) => {
      toggleCommentLike.mutate({ id: commentId, postId })
    },
    [postId, toggleCommentLike]
  )

  // Loading state
  if (isLoadingPost) {
    return <PostDetailSkeleton />
  }

  if (!post) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        게시글을 찾을 수 없습니다.
      </div>
    )
  }

  const issueStatus = post.issue?.status
  const issuePriority = post.issue?.priority

  return (
    <div className="space-y-6 mx-auto px-8">
      {/* 1. 제목 영역 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {post.isPinned && (
            <Badge variant="secondary" className="gap-1">
              <Pin className="h-3 w-3" />
              고정
            </Badge>
          )}
          {showIssueTracking && issueStatus && (
            <Badge variant={STATUS_CONFIG[issueStatus].variant}>
              {STATUS_CONFIG[issueStatus].label}
            </Badge>
          )}
          {showIssueTracking && issuePriority && (
            <Badge className={cn(PRIORITY_CONFIG[issuePriority].className)}>
              {PRIORITY_CONFIG[issuePriority].label}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-bold break-words">{post.title}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-0.1" />
            목록으로
          </Button>
        </div>
      </div>

      {/* 2. 작성자 및 액션 버튼 영역 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* 왼쪽: 작성자 프로필 */}
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <UserAvatar
                email={post.createdByEmail}
                accountName={post.createdByName}
                avatarStyle={post.createdByAvatarStyle}
                avatarSeed={post.createdByAvatarSeed}
                size={40}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{post.createdByEmail}</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex flex-col">
            <span className="font-semibold text-sm">{post.createdByName}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(post.createdAt)}</span>
              {post.createdAt !== post.updatedAt && <span>(수정됨)</span>}
            </div>
          </div>
        </div>

        {/* 오른쪽: 액션 버튼들 (좋아요 등) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* 좋아요 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePostLike}
            disabled={togglePostLike.isPending}
            className={cn(
              "rounded-full px-4 h-9 gap-2",
              post.isLikedByMe && "text-primary"
            )}
          >
            <ThumbsUp className={cn("h-4 w-4", post.isLikedByMe && "fill-current")} />
            <span className="font-medium">{post.likeCount}</span>
          </Button>

          {/* 더보기 메뉴 */}
          {isPostAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPostFormMode('edit')}>
                  <Pencil className="h-4 w-4 mr-2" />
                  수정
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowPostDelete(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 3. 내용 박스 영역 */}
      <div className="rounded-xl p-3 text-sm space-y-3 hover:bg-muted/50 transition-colors">
        {/* QnA 담당자 정보가 있다면 여기에 표시 */}
        {showIssueTracking && post.issue?.assigneeName && (
          <div className="flex items-center gap-2 text-sm p-2 rounded-md bg-background/50 border w-fit">
            <span className="text-muted-foreground">담당자:</span>
            <UserAvatar
              email={post.issue.assigneeEmail || ''}
              accountName={post.issue.assigneeName}
              avatarStyle={post.issue.assigneeAvatarStyle}
              avatarSeed={post.issue.assigneeAvatarSeed}
              size={20}
            />
            <span className="font-medium">{post.issue.assigneeName}</span>
          </div>
        )}

        <div
          className="prose prose-sm dark:prose-invert max-w-none break-words"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* 4. 댓글 섹션 */}
      <div className="space-y-6 border-t pt-6">
        <div className="flex items-center gap-6">
          <h3 className="text-md font-bold">댓글 {post.commentCount}개</h3>
        </div>

        {/* 댓글 입력 폼 - 대댓글 작성 중이 아닐 때만 표시 */}
        {commentFormMode !== 'reply' && (
          <div className="flex items-start gap-4 mb-8">
            <UserAvatar
              email={currentUser?.email || ''}
              accountName={currentUser?.accountName || 'User'}
              avatarStyle={currentUser?.avatarStyle || 'thumbs'}
              avatarSeed={currentUser?.avatarSeed || 'seed'}
              size={40}
            />
            <div className="flex-1">
              <CommentForm
                mode="create"
                isSubmitting={createComment.isPending}
                onSubmit={handleCreateComment}
                placeholder="댓글을 남겨보세요..."
              />
            </div>
          </div>
        )}

        {/* 댓글 수정 폼 */}
        {commentFormMode === 'edit' && editingComment && (
          <div className="mb-4">
            <CommentForm
              mode="edit"
              initialContent={editingComment.content}
              isSubmitting={updateComment.isPending}
              onSubmit={handleUpdateComment}
              onCancel={() => {
                setCommentFormMode(null)
                setEditingComment(null)
              }}
            />
          </div>
        )}

        <CommentList
          pages={commentsData?.pages}
          isLoading={isLoadingComments}
          isFetchingNextPage={isFetchingComments}
          hasNextPage={hasMoreComments || false}
          fetchNextPage={fetchMoreComments}
          totalCount={post.commentCount}
          currentUserId={currentUser?.accountId}
          onReply={handleReply}
          onEdit={handleEditComment}
          onDelete={(id) => setDeleteCommentId(id)}
          onLike={handleToggleCommentLike}
          hideHeader={true}
          replyingToCommentId={replyToComment?.commentId}
          renderReplyForm={(commentId) => (
            <CommentForm
              mode="reply"
              replyToName={replyToComment?.createdByName}
              parentCommentId={commentId}
              isSubmitting={createComment.isPending}
              onSubmit={handleCreateComment}
              onCancel={() => {
                setCommentFormMode(null)
                setReplyToComment(null)
              }}
            />
          )}
        />
      </div>

      {/* 게시글 수정 폼 (Modal) */}
      <PostForm
        mode={postFormMode}
        post={post}
        topicId={topicId}
        showIssueTracking={showIssueTracking}
        isSubmitting={updatePost.isPending}
        onSubmit={handleUpdatePost}
        onClose={() => setPostFormMode(null)}
      />

      {/* 게시글 작성 폼 (외부 제어 - Modal) */}
      <PostForm
        mode={formMode ?? null}
        topicId={topicId}
        showIssueTracking={showIssueTracking}
        isSubmitting={createPost.isPending}
        onSubmit={handleCreatePost}
        onClose={() => onFormClose?.()}
      />

      {/* 게시글 삭제 확인 */}
      <PostDeleteDialog
        isOpen={showPostDelete}
        isDeleting={deletePost.isPending}
        onConfirm={handleDeletePost}
        onClose={() => setShowPostDelete(false)}
      />

      {/* 댓글 삭제 확인 */}
      <CommentDeleteDialog
        isOpen={deleteCommentId !== null}
        isDeleting={deleteComment.isPending}
        onConfirm={handleDeleteComment}
        onClose={() => setDeleteCommentId(null)}
      />
    </div>
  )
}
