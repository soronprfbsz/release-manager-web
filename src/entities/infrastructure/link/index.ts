/**
 * Link Entity
 * 링크 엔티티 모듈
 */

// API
export { linkApi } from './api/linkApi'
// Backward compatibility
export { linkApi as linkResourceApi } from './api/linkApi'

// Types
export type {
  Link,
  LinkCreateRequest,
  LinkUpdateRequest,
} from './model/types'

// Type aliases for backward compatibility
export type { Link as LinkResource } from './model/types'
export type { LinkCreateRequest as LinkResourceCreateRequest } from './model/types'

// Queries
export {
  linkKeys,
  useLinks,
  useLink,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
  useReorderLinks,
} from './queries/linkQueries'

// Query aliases for backward compatibility
export { linkKeys as linkResourceKeys } from './queries/linkQueries'
export { useLinks as useLinkResources } from './queries/linkQueries'
export { useCreateLink as useCreateLinkResource } from './queries/linkQueries'
export { useUpdateLink as useUpdateLinkResource } from './queries/linkQueries'
export { useDeleteLink as useDeleteLinkResource } from './queries/linkQueries'

