/**
 * Service Management Feature
 * 서비스 관리 기능
 */

// UI Components
export { ServiceCard } from './ui/ServiceCard'
export { ServiceGroupList } from './ui/ServiceGroupList'
export { ServiceForm } from './ui/ServiceForm'
export { ServiceFilters } from './ui/ServiceFilters'
export { ServiceDeleteDialog } from './ui/ServiceDeleteDialog'
export { ComponentForm } from './ui/ComponentForm'
export { ComponentModal } from './ui/ComponentModal'
export { ComponentList } from './ui/ComponentList'

// Types
export type {
  ServiceFormData,
  ComponentFormData,
  ServiceFiltersState,
  ServiceFormMode,
  ComponentFormMode,
  DeleteTarget,
} from './model/types'

// Validation
export { validateServiceForm, validateComponentForm } from './model/validation'

// Helpers
export {
  getServiceTypeIcon,
  getServiceGroupIcon,
  getServiceTypeColor,
  getComponentTypeIcon,
  getComponentDisplayInfo,
} from './lib/serviceHelpers'

// Glyph
export {
  GLYPH_COLORS,
  resolveGlyph,
  getGlyphColorEntry,
  getGlyphFontSizeClass,
} from './lib/glyph'
export type { GlyphColorEntry } from './lib/glyph'
