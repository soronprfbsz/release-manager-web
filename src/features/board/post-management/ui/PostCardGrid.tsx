/**
 * Post Card Grid Component
 * 공지사항 그리드 형태 게시글 카드
 */

import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Pin,
  Clock,
} from 'lucide-react'

import type { PostListItem } from '@/entities/board'

import { cn } from '@/shared/lib/utils'
import { getRelativeTime } from '@/shared/lib/utils/date'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { UserAvatar } from '@/shared/ui/user-avatar'

interface PostCardGridProps {
  post: PostListItem
  onClick?: () => void
}

/**
 * 안전한 인라인 스타일 태그만 유지하고 나머지 제거
 * 굵게, 기울임, 취소선, 밑줄 등 스타일 유지
 */
function sanitizeHtmlPreview(html: string): string {
  // 허용할 인라인 스타일 태그
  const allowedTags = ['strong', 'b', 'em', 'i', 's', 'del', 'u', 'mark', 'code']
  const allowedTagsPattern = allowedTags.join('|')

  // 허용된 태그만 유지하고 나머지 태그는 제거
  let result = html

  // 블록 레벨 태그를 공백으로 변환 (p, div, br 등)
  result = result.replace(/<(p|div|br|li|ul|ol|h[1-6])[^>]*\/?>/gi, ' ')
  result = result.replace(/<\/(p|div|li|ul|ol|h[1-6])>/gi, ' ')

  // 허용되지 않은 태그 제거 (허용된 태그는 유지)
  const tagRegex = new RegExp(`<(?!/?(${allowedTagsPattern})\\b)[^>]+>`, 'gi')
  result = result.replace(tagRegex, '')

  // 연속된 공백 정리
  result = result.replace(/\s+/g, ' ').trim()

  return result
}

export function PostCardGrid({ post, onClick }: PostCardGridProps) {
  const hasThumbnail = !!post.thumbnailUrl

  return (
    <div
      className={cn(
        'py-6 px-4 cursor-pointer hover:bg-muted/50 transition-colors',
        post.isPinned && 'bg-primary/5'
      )}
      onClick={onClick}
    >
      <div className="flex gap-6">
        {/* 왼쪽: 텍스트 컨텐츠 */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 작성자 + 고정 배지 */}
          <div className="flex items-center gap-2 mb-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-default">
                  <UserAvatar
                    email={post.createdByEmail}
                    accountName={post.createdByName}
                    avatarStyle={post.createdByAvatarStyle}
                    avatarSeed={post.createdByAvatarSeed}
                    size={32}
                  />
                  <span className="text-sm font-medium">
                    {post.createdByName}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{post.createdByEmail}</p>
              </TooltipContent>
            </Tooltip>
            {post.isPinned && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/90 text-primary-foreground text-xs rounded-md">
                <Pin className="h-3 w-3" />
                <span>고정</span>
              </div>
            )}
          </div>

          {/* 제목 */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">
            {post.title}
          </h3>

          {/* 내용 미리보기 */}
          {post.contentPreview && (
            <p
              className={cn(
                "text-sm text-muted-foreground mb-4 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_s]:line-through [&_del]:line-through [&_u]:underline",
                hasThumbnail ? "line-clamp-2" : "line-clamp-3"
              )}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtmlPreview(post.contentPreview),
              }}
            />
          )}

          {/* 하단: 통계 */}
          <div className="flex items-center gap-4 mt-auto">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span>{post.likeCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{post.viewCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{getRelativeTime(post.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 썸네일 (있을 때만 표시) */}
        {hasThumbnail && (
          <div className="shrink-0">
            <img
              src={post.thumbnailUrl!}
              alt=""
              className="w-36 h-36 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  )
}
