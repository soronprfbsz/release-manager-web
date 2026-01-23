/**
 * Post List Card Component
 * 게시글 리스트 카드 - 공지사항/QnA 공통 사용
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

export function PostListCard({ post, onClick }: PostListCardProps) {
  return (
    <div
      className={cn(
        'flex gap-4 p-4 transition-colors cursor-pointer hover:bg-muted/50',
        post.isPinned && 'bg-primary/5'
      )}
      onClick={onClick}
    >
      {/* 왼쪽: 아바타 */}
      <div className="shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <UserAvatar
                email={post.createdByEmail}
                accountName={post.createdByName}
                avatarStyle={post.createdByAvatarStyle}
                avatarSeed={post.createdByAvatarSeed}
                size={40}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{post.createdByEmail}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* 오른쪽: 컨텐츠 */}
      <div className="flex-1 min-w-0">
        {/* 작성자 이름 */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {post.createdByName}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="font-semibold text-base mb-2 text-foreground line-clamp-1">
          {post.title}
        </h3>

        {/* 하단: 통계 정보 */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{post.viewCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{post.commentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{post.likeCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatRelativeTime(post.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
