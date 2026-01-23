/**
 * Board Entity Types
 * 게시판 관련 타입 정의 (백엔드 DTO와 동기화)
 */

// ===== Spring Data Page Response =====
export interface BoardPageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number // current page (0-based)
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

// ===== Enums =====
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

// ===== Topic Types =====

/** 토픽 응답 (상세) */
export interface Topic {
  topicId: string
  topicName: string
  description: string | null
  icon: string | null
  sortOrder: number
  isEnabled: boolean
  postCount: number
  createdAt: string
  updatedAt: string
}

/** 토픽 목록 응답 (간략) */
export interface TopicListItem {
  topicId: string
  topicName: string
  description: string | null
  icon: string | null
  isEnabled: boolean
}

// ===== Post Types =====

/** 이슈 정보 요청 */
export interface IssueRequest {
  status?: IssueStatus
  priority?: IssuePriority
  assigneeId?: number
  dueDate?: string // ISO date string (YYYY-MM-DD)
}

/** 이슈 정보 응답 */
export interface IssueResponse {
  status: IssueStatus | null
  priority: IssuePriority | null
  assigneeId: number | null
  assigneeEmail: string | null
  assigneeName: string | null
  assigneeAvatarStyle: string | null
  assigneeAvatarSeed: string | null
  dueDate: string | null
  resolvedAt: string | null
}

/** 게시글 상세 응답 (BoardPostDto.Response) */
export interface Post {
  postId: number
  topicId: string
  topicName: string
  title: string
  content: string // Markdown/HTML
  thumbnailUrl: string | null
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
  isPublished: boolean
  isLikedByMe: boolean
  createdById: number
  createdByEmail: string
  createdByName: string
  createdByAvatarStyle: string | null
  createdByAvatarSeed: string | null
  issue: IssueResponse | null
  createdAt: string
  updatedAt: string
}

/** 게시글 목록 응답 (BoardPostDto.ListResponse) */
export interface PostListItem {
  postId: number
  topicId: string
  title: string
  contentPreview: string | null // 내용 미리보기 (plain text)
  thumbnailUrl: string | null
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
  createdByEmail: string
  createdByName: string
  createdByAvatarStyle: string | null
  createdByAvatarSeed: string | null
  issueStatus: IssueStatus | null
  issuePriority: IssuePriority | null
  createdAt: string
}

/** 게시글 생성 요청 (BoardPostDto.CreateRequest) */
export interface PostCreateRequest {
  topicId: string
  title: string
  content: string
  thumbnailUrl?: string
  isPinned?: boolean
  isPublished?: boolean
  issue?: IssueRequest
}

/** 게시글 수정 요청 (BoardPostDto.UpdateRequest) */
export interface PostUpdateRequest {
  title?: string
  content?: string
  thumbnailUrl?: string
  isPinned?: boolean
  isPublished?: boolean
  issue?: IssueRequest
}

// ===== Comment Types =====

/** 댓글 응답 (BoardCommentDto.Response) */
export interface Comment {
  commentId: number
  postId: number
  parentCommentId: number | null
  content: string
  likeCount: number
  isDeleted: boolean
  isLikedByMe: boolean
  createdById: number
  createdByEmail: string
  createdByName: string
  createdByAvatarStyle: string | null
  createdByAvatarSeed: string | null
  replies: Comment[]
  createdAt: string
  updatedAt: string
}

/** 댓글 목록 응답 (BoardCommentDto.ListResponse) */
export interface CommentListItem {
  commentId: number
  content: string
  likeCount: number
  isDeleted: boolean
  replyCount: number
  isLikedByMe: boolean
  createdByName: string
  createdByAvatarStyle: string | null
  createdByAvatarSeed: string | null
  createdAt: string
}

/** 댓글 생성 요청 (BoardCommentDto.CreateRequest) */
export interface CommentCreateRequest {
  postId: number
  parentCommentId?: number
  content: string
}

/** 댓글 수정 요청 (BoardCommentDto.UpdateRequest) */
export interface CommentUpdateRequest {
  content: string
}

// ===== API Request Params =====

export interface PostListParams {
  topicId?: string
  keyword?: string
  page?: number
  size?: number
  sort?: string // e.g., 'createdAt,desc'
}

export interface CommentListParams {
  postId: number
  page?: number
  size?: number
}

// ===== Legacy Support (for backward compatibility) =====
// These are kept for backward compatibility with existing code
export type PostStatus = IssueStatus
export type PostPriority = IssuePriority
