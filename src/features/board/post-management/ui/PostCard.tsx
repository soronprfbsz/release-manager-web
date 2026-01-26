/**
 * Post Card Component
 * 게시글 카드 (목록 아이템) 컴포넌트
 */

import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Pin,
  Clock,
} from 'lucide-react'

import type { PostListItem, PostStatus, PostPriority } from '@/entities/board'

import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { UserAvatar } from '@/shared/ui/user-avatar'
import { cn } from '@/shared/lib/utils'

interface PostCardProps {
  post: PostListItem
  onClick?: () => void
  showStatus?: boolean // 자유게시판용 이슈 트래킹 표시
}

const STATUS_CONFIG: Record<PostStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  OPEN: { label: '미해결', variant: 'destructive' },
  IN_PROGRESS: { label: '진행중', variant: 'default' },
  RESOLVED: { label: '해결됨', variant: 'secondary' },
  CLOSED: { label: '종료', variant: 'outline' },
}

const PRIORITY_CONFIG: Record<PostPriority, { label: string; className: string }> = {
  LOW: { label: '낮음', className: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: '중간', className: 'bg-blue-100 text-blue-600' },
  HIGH: { label: '높음', className: 'bg-orange-100 text-orange-600' },
  URGENT: { label: '긴급', className: 'bg-red-100 text-red-600' },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return diffMinutes < 1 ? '방금 전' : `${diffMinutes}분 전`
  }
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function PostCard({ post, onClick, showStatus = false }: PostCardProps) {

  return (
    <Card
      className={cn(
        'transition-colors cursor-pointer hover:bg-muted/50',
        post.isPinned && 'border-primary/30 bg-primary/5'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* 썸네일 (있는 경우) */}
          {post.thumbnailUrl && (
            <div className="shrink-0">
              <img
                src={post.thumbnailUrl}
                alt=""
                className="w-20 h-20 object-cover rounded-md"
              />
            </div>
          )}

          {/* 컨텐츠 영역 */}
          <div className="flex-1 min-w-0">
            {/* 상단: 배지들 */}
            <div className="flex items-center gap-2 mb-1">
              {post.isPinned && (
                <Badge variant="secondary" className="gap-1 h-5 text-xs">
                  <Pin className="h-3 w-3" />
                  고정
                </Badge>
              )}
              {showStatus && post.issueStatus && (
                <Badge variant={STATUS_CONFIG[post.issueStatus].variant} className="h-5 text-xs">
                  {STATUS_CONFIG[post.issueStatus].label}
                </Badge>
              )}
              {showStatus && post.issuePriority && (
                <Badge className={cn('h-5 text-xs', PRIORITY_CONFIG[post.issuePriority].className)}>
                  {PRIORITY_CONFIG[post.issuePriority].label}
                </Badge>
              )}
            </div>

            {/* 제목 */}
            <h3 className="font-medium text-sm truncate mb-2">{post.title}</h3>

            {/* 하단: 메타 정보 */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {/* 작성자 정보 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-default">
                    <UserAvatar
                      email={post.createdByEmail}
                      accountName={post.createdByName}
                      avatarStyle={post.createdByAvatarStyle}
                      avatarSeed={post.createdByAvatarSeed}
                      size={20}
                    />
                    <span>{post.createdByName}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{post.createdByEmail}</p>
                </TooltipContent>
              </Tooltip>

              {/* 통계 정보 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{post.likeCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{post.commentCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{post.viewCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
