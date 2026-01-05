/**
 * Resource Management Feature
 * 리소스 관리 기능 모듈
 */

// UI Components
export { ResourceCard } from './ui/ResourceCard'
export { ResourceGroupList } from './ui/ResourceGroupList'
export { ResourceUploadForm } from './ui/ResourceUploadForm'
export { ResourceEditForm } from './ui/ResourceEditForm'
export { ResourceDeleteModal } from './ui/ResourceDeleteModal'
export { LinkResourceList } from './ui/LinkResourceList'
export { LinkResourceForm } from './ui/LinkResourceForm'
export { ResourceFilters } from './ui/ResourceFilters'

// Helpers
export {
  getFileTypeIcon,
  getResourceColorClass,
  getGroupColorClass,
  getGroupIcon,
  formatFileSize,
} from './lib/resourceHelpers'

// Types
export type { ResourceUploadFormData, ResourceUploadMode } from './model/types'
export type { ResourceFiltersState } from './ui/ResourceFilters'
