/**
 * Link List Component
 * 링크 목록 컴포넌트 (Wrapper)
 */

import type { LinkResource } from '@/entities/infrastructure/link'
import { LinkGroupList } from './LinkGroupList'

interface LinkListProps {
  resources: LinkResource[]
  onDelete: (resource: LinkResource) => void
  onEdit?: (resource: LinkResource) => void
}

export function LinkList({ resources, onDelete, onEdit }: LinkListProps) {
  return (
    <LinkGroupList resources={resources} onDelete={onDelete} onEdit={onEdit} />
  )
}

