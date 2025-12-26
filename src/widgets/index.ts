/**
 * Widgets Public API
 * 위젯 모듈 통합 export
 */

// Shared Widgets
export {
  NavigationBar,
  menuItems,
  type MenuItem,
  ProjectSelector,
  ThemeToggle,
} from './_shared'

// Infrastructure Widgets
export {
  ServiceTab,
  type ServiceTabHandle,
  LinkResourceTab,
  type LinkResourceTabHandle,
  FileResourceTab,
  type FileResourceTabHandle,
} from './infrastructure'

// Remote Jobs Widgets
export { BackupDialog, RestoreDialog } from './remote-jobs'

// Patches Widgets
export { PatchFileExplorer } from './patches'

// Releases Widgets
export { VersionCreateDialog } from './releases'
