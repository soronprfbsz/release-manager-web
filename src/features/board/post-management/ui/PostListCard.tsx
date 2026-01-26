/**
 * Post List Card Component
 * 게시글 리스트 카드 - 가이드/자유게시판 공통 사용
 */

import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Clock,
} from 'lucide-react'

import type { PostListItem } from '@/entities/board'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { UserAvatar } from '@/shared/ui/user-avatar'
import { cn } from '@/shared/lib/utils'

interface PostListCardProps {
  post: PostListItem
  onClick?: () => void
  /** 좋아요 표시 여부 (기본: false) */
  showLike?: boolean
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

export function PostListCard({ post, onClick, showLike = false }: PostListCardProps) {
  return (
    <div
      className={cn(
        'py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-4',
        post.isPinned && 'bg-primary/5'
      )}
      onClick={onClick}
    >
      {/* 게시글 번호 */}
      <span className="shrink-0 w-12 text-sm text-muted-foreground text-center">
        {post.postId}
      </span>

      {/* 작성자 아바타 + 이름 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="shrink-0 flex items-center gap-2 w-28 cursor-default">
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

      {/* 제목 */}
      <h3 className="flex-1 font-medium text-sm text-foreground truncate">
        {post.title}
      </h3>

      {/* 통계 정보 */}
      <div className="shrink-0 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          <span>{post.viewCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{post.commentCount}</span>
        </div>
        {showLike && (
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{post.likeCount}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatRelativeTime(post.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}
