/**
 * Link Resource List Component
 * 링크 리소스 목록 컴포넌트 (Wrapper)
 */

import type { LinkResource } from '@/entities/resource'
import { LinkResourceGroupList } from './LinkResourceGroupList'

interface LinkResourceListProps {
    resources: LinkResource[]
    onDelete: (resource: LinkResource) => void
    onEdit?: (resource: LinkResource) => void
}

export function LinkResourceList({ resources, onDelete, onEdit }: LinkResourceListProps) {
    // Just a wrapper mostly now, keeping it for API consistency with ResourcePage
    return (
        <LinkResourceGroupList resources={resources} onDelete={onDelete} onEdit={onEdit} />
    )
}
