// API
export { resourceApi } from './api/resourceApi'
export { linkResourceApi } from './api/linkResourceApi'

// Types
export type {
  ResourceFile,
  ResourceFileUploadRequest,
  ResourceFileUpdateRequest,
  ResourceFileContent,
  LinkResource,
  LinkResourceCreateRequest,
} from './model/types'

// Queries
export {
  resourceKeys,
  useResources,
  useResource,
  useResourceFileContent,
  useUploadResource,
  useUpdateResource,
  useDeleteResource,
  useReorderResources,
} from './queries/resourceQueries'

export {
  linkResourceKeys,
  useLinkResources,
  useCreateLinkResource,
  useUpdateLinkResource,
  useDeleteLinkResource,
} from './queries/linkResourceQueries'
