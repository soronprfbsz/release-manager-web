/**
 * Comment Item Component
 * 댓글 아이템 컴포넌트 (대댓글 포함)
 */

import {
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  CornerDownRight,
} from 'lucide-react'

import type { Comment } from '@/entities/board'

import { cn } from '@/shared/lib/utils'
import { getRelativeTime } from '@/shared/lib/utils/date'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { UserAvatar } from '@/shared/ui/user-avatar'

interface CommentItemProps {
  comment: Comment
  depth?: number // 0: 일반 댓글, 1: 대댓글
  currentUserId?: number // 현재 로그인한 사용자 ID
  onReply?: (commentId: number) => void
  onEdit?: (comment: Comment) => void
  onDelete?: (commentId: number) => void
  onLike?: (commentId: number) => void
}

export function CommentItem({
  comment,
  depth = 0,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onLike,
}: CommentItemProps) {
  const isReply = depth > 0
  const isDeleted = comment.isDeleted
  const isAuthor = currentUserId !== undefined && comment.createdById === currentUserId
  const replyCount = comment.replies?.length ?? 0

  return (
    <div className={cn('group', isReply && 'ml-8')}>
      <div className="flex gap-3">
        {/* 대댓글 아이콘 */}
        {isReply && (
          <CornerDownRight className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
        )}

        {/* 아바타 */}
        {isDeleted ? (
          <UserAvatar
            email={comment.createdByEmail}
            accountName={comment.createdByName}
            avatarStyle={comment.createdByAvatarStyle}
            avatarSeed={comment.createdByAvatarSeed}
            isDeleted={true}
            size={32}
          />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-default shrink-0">
                <UserAvatar
                  email={comment.createdByEmail}
                  accountName={comment.createdByName}
                  avatarStyle={comment.createdByAvatarStyle}
                  avatarSeed={comment.createdByAvatarSeed}
                  size={32}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{comment.createdByEmail}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* 콘텐츠 영역 */}
        <div className="flex-1 min-w-0">
          {/* 헤더 */}
          <div className="flex items-center gap-2 mb-1">
            {isDeleted ? (
              <span className="font-medium text-sm">(삭제됨)</span>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-sm cursor-default">
                    {comment.createdByName}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{comment.createdByEmail}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <span className="text-xs text-muted-foreground">
              {getRelativeTime(comment.createdAt)}
            </span>
            {comment.createdAt !== comment.updatedAt && !isDeleted && (
              <span className="text-xs text-muted-foreground">(수정됨)</span>
            )}
          </div>

          {/* 내용 */}
          <p
            className={cn(
              'text-sm whitespace-pre-wrap break-words',
              isDeleted && 'text-muted-foreground italic'
            )}
          >
            {isDeleted ? '삭제된 댓글입니다.' : comment.content}
          </p>

          {/* 액션 버튼 */}
          {!isDeleted && (
            <div className="flex items-center gap-2 mt-2">
              {/* 좋아요 */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1 text-xs"
                onClick={() => onLike?.(comment.commentId)}
              >
                <ThumbsUp
                  className={cn(
                    'h-3.5 w-3.5',
                    comment.isLikedByMe && 'fill-primary text-primary'
                  )}
                />
                {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
              </Button>

              {/* 답글 (depth 0만) */}
              {!isReply && onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1 text-xs"
                  onClick={() => onReply(comment.commentId)}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  답글
                  {replyCount > 0 && <span>({replyCount})</span>}
                </Button>
              )}

              {/* 더보기 메뉴 (본인 댓글만) */}
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => onEdit?.(comment)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete?.(comment.commentId)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 대댓글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.commentId}
              comment={reply}
              depth={1}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
            />
          ))}
        </div>
      )}
    </div>
  )
}
