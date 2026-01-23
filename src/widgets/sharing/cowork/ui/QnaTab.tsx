import { useSearchParams } from 'react-router-dom'

import type { PostFormMode } from '@/features/board'

import { BoardWidget } from './BoardWidget'
import { PostDetailView } from './PostDetailView'

const TOPIC_ID = 'QNA'

interface QnaTabProps {
  formMode?: PostFormMode
  onFormClose?: () => void
  keyword?: string
}

export function QnaTab({
  formMode,
  onFormClose,
  keyword,
}: QnaTabProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const postId = searchParams.get('postId')

  if (postId) {
    return (
      <PostDetailView
        postId={Number(postId)}
        topicId={TOPIC_ID}
        formMode={formMode}
        onFormClose={onFormClose}
      />
    )
  }

  return (
    <BoardWidget
      topicId={TOPIC_ID}
      onPostClick={(post) => {
        setSearchParams((prev) => {
          prev.set('postId', post.postId.toString())
          return prev
        })
      }}
      formMode={formMode}
      onFormClose={onFormClose}
      keyword={keyword}
    />
  )
}
