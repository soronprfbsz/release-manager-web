/**
 * Post List Table Component
 * 게시글 리스트 테이블 - 공통 테이블 컴포넌트 사용
 */

import { Loader2 } from 'lucide-react'

import type { PostListItem } from '@/entities/board'

import { cn } from '@/shared/lib/utils'
import { DataTable } from '@/shared/ui/data-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { UserAvatar } from '@/shared/ui/user-avatar'

interface PostListTableProps {
  /** 고정 게시글 */
  pinnedPosts: PostListItem[]
  /** 일반 게시글 */
  regularPosts: PostListItem[]
  /** 좋아요 표시 여부 (기본: true) */
  showLike?: boolean
  /** 게시글 클릭 핸들러 */
  onPostClick?: (post: PostListItem) => void
  /** 다음 페이지 존재 여부 */
  hasNextPage?: boolean
  /** 다음 페이지 로딩 중 */
  isFetchingNextPage?: boolean
  /** 다음 페이지 로드 함수 */
  fetchNextPage?: () => void
}

/**
 * 상대적 시간 포맷
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

function PostTableRow({
  post,
  showLike,
  onClick,
}: {
  post: PostListItem
  showLike: boolean
  onClick?: () => void
}) {
  return (
    <TableRow
      className={cn(
        'cursor-pointer',
        post.isPinned && 'bg-primary/5'
      )}
      onClick={onClick}
    >
      {/* 게시글 번호 */}
      <TableCell className="text-center text-muted-foreground">
        {post.postId}
      </TableCell>

      {/* 제목 */}
      <TableCell>
        <span className="font-medium truncate block">
          {post.title}
        </span>
      </TableCell>

      {/* 작성자 */}
      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-default">
              <UserAvatar
                email={post.createdByEmail}
                accountName={post.createdByName}
                avatarStyle={post.createdByAvatarStyle}
                avatarSeed={post.createdByAvatarSeed}
                size={24}
              />
              <span className="text-sm text-muted-foreground truncate">
                {post.createdByName}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{post.createdByEmail}</p>
          </TooltipContent>
        </Tooltip>
      </TableCell>

      {/* 조회수 */}
      <TableCell className="text-center text-muted-foreground">
        {post.viewCount}
      </TableCell>

      {/* 댓글수 */}
      <TableCell className="text-center text-muted-foreground">
        {post.commentCount}
      </TableCell>

      {/* 좋아요 */}
      {showLike && (
        <TableCell className="text-center text-muted-foreground">
          {post.likeCount}
        </TableCell>
      )}

      {/* 수정일시 */}
      <TableCell className="text-center text-muted-foreground whitespace-nowrap">
        {formatRelativeTime(post.updatedAt)}
      </TableCell>
    </TableRow>
  )
}

export function PostListTable({
  pinnedPosts,
  regularPosts,
  showLike = true,
  onPostClick,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}: PostListTableProps) {
  const loader = (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <DataTable
      paginationMode="infinite"
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      autoHeight
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">번호</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="w-40">작성자</TableHead>
            <TableHead className="w-20 text-center">조회수</TableHead>
            <TableHead className="w-20 text-center">댓글수</TableHead>
            {showLike && (
              <TableHead className="w-20 text-center">좋아요수</TableHead>
            )}
            <TableHead className="w-28 text-center">수정일시</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 고정 게시글 */}
          {pinnedPosts.map((post) => (
            <PostTableRow
              key={`pinned-${post.postId}`}
              post={post}
              showLike={showLike}
              onClick={() => onPostClick?.(post)}
            />
          ))}

          {/* 일반 게시글 */}
          {regularPosts.map((post) => (
            <PostTableRow
              key={post.postId}
              post={post}
              showLike={showLike}
              onClick={() => onPostClick?.(post)}
            />
          ))}

          {/* 로딩 표시 */}
          {isFetchingNextPage && (
            <TableRow>
              <TableCell colSpan={showLike ? 7 : 6}>
                {loader}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </DataTable>
  )
}
