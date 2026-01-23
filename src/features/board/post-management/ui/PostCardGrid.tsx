/**
 * Post Card Grid Component
 * 공지사항 그리드 형태 게시글 카드
 */

import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Pin,
  Image as ImageIcon,
} from 'lucide-react'

import type { PostListItem } from '@/entities/board'

import { Card, CardContent } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { UserAvatar } from '@/shared/ui/user-avatar'
import { cn } from '@/shared/lib/utils'

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
  const tagRegex = new RegExp(`<(?!\/?(${allowedTagsPattern})\\b)[^>]+>`, 'gi')
  result = result.replace(tagRegex, '')

  // 연속된 공백 정리
  result = result.replace(/\s+/g, ' ').trim()

  return result
}

export function PostCardGrid({ post, onClick }: PostCardGridProps) {
  return (
    <Card
      className={cn(
        'transition-all cursor-pointer hover:bg-muted/50 group h-full overflow-hidden',
        post.isPinned && 'border-primary/30 bg-primary/5'
      )}
      onClick={onClick}
    >
      {/* 썸네일 영역 - 항상 표시 */}
      <div className="relative w-full aspect-video bg-muted">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {/* 고정 배지 */}
        {post.isPinned && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded-md">
            <Pin className="h-3 w-3" />
            <span>고정</span>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex flex-col">
        {/* 제목 */}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-foreground">
          {post.title}
        </h3>

        {/* 내용 미리보기 */}
        {post.contentPreview && (
          <p
            className="text-xs text-muted-foreground line-clamp-2 mb-3 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_s]:line-through [&_del]:line-through [&_u]:underline"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtmlPreview(post.contentPreview),
            }}
          />
        )}

        {/* 하단: 작성자 + 통계 */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
          {/* 작성자 */}
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
                <span className="text-xs text-muted-foreground">
                  {post.createdByName}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{post.createdByEmail}</p>
            </TooltipContent>
          </Tooltip>

          {/* 통계 */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ThumbsUp className="h-3 w-3" />
              <span>{post.likeCount}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{post.commentCount}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{post.viewCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
