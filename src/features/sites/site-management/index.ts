/**
 * Site Management Feature
 * 사이트 관리 기능 모듈
 */

// UI Components
export { SiteTable } from './ui/SiteTable'
export { SiteForm } from './ui/SiteForm'
export { SiteFilters } from './ui/SiteFilters'
export { SiteDeleteModal } from './ui/SiteDeleteModal'

// UI Components - Operation Tab
export { SiteList } from './ui/SiteList'
export { SiteDetailPanel } from './ui/SiteDetailPanel'
export { SitePatchHistoryCard } from './ui/SitePatchHistoryCard'
export { SiteNotesCard } from './ui/SiteNotesCard'
export { SiteNoteForm, type SiteNoteFormMode, type SiteNoteFormData, INITIAL_NOTE_FORM_DATA } from './ui/SiteNoteForm'
export { SiteNoteDeleteDialog } from './ui/SiteNoteDeleteDialog'

// Types
export type {
  SiteFormData,
  SiteFiltersState,
  SiteFormMode,
  SiteFilter,
} from './model/types'

// 사이트 구분 메타데이터
export {
  SITE_CATEGORIES,
  DEFAULT_SITE_CATEGORY,
  getSiteCategoryLabel,
  type SiteCategoryMeta,
} from './model/categories'

// Validation
export { validateSiteForm, type ValidationResult } from './model/validation'
