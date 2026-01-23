/**
 * Board Entity Public API
 * 게시판 관련 엔티티
 */

// Types
export type {
  BoardPageResponse,
  IssueStatus,
  IssuePriority,
  Topic,
  TopicListItem,
  IssueRequest,
  IssueResponse,
  Post,
  PostListItem,
  PostCreateRequest,
  PostUpdateRequest,
  Comment,
  CommentListItem,
  CommentCreateRequest,
  CommentUpdateRequest,
  PostListParams,
  CommentListParams,
  // Legacy aliases
  PostStatus,
  PostPriority,
} from './model/types'

// API
export { topicApi } from './api/topicApi'
export { postApi } from './api/postApi'
export { commentApi } from './api/commentApi'

// Queries - Topic
export { topicKeys, useTopics, useTopic } from './queries/topicQueries'

// Queries - Post
export {
  postKeys,
  usePosts,
  usePost,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useTogglePostLike,
  useIncrementPostView,
  useUploadPostImage,
} from './queries/postQueries'

// Queries - Comment
export {
  commentKeys,
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useToggleCommentLike,
} from './queries/commentQueries'
