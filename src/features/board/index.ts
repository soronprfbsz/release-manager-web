/**
 * Board Feature Public API
 * 게시판 기능 모듈
 */

// Post Management
export {
  PostCard,
  PostCardGrid,
  PostListCard,
  PostListTable,
  PostForm,
  PostDeleteDialog,
  type PostFormData,
  type PostFormMode,
  INITIAL_POST_FORM_DATA,
  validatePostForm,
  extractFirstImageUrl,
  htmlToPlainText,
} from './post-management'

// Comment Management
export {
  CommentItem,
  CommentForm,
  CommentList,
  CommentDeleteDialog,
  type CommentFormData,
  type CommentFormMode,
  INITIAL_COMMENT_FORM_DATA,
  validateCommentForm,
} from './comment-management'
