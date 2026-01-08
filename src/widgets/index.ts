/**
 * Widgets Public API
 * 위젯 모듈 통합 export
 */

// Common Widgets (여러 도메인에서 공유)
export {
  FileExplorer,
  type FileExplorerProps,
  type FileNode,
  type FileTreeData,
  type FileContentData,
} from './common'

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
  PublishingTab,
  type PublishingTabHandle,
  PublishingFileExplorer,
} from './infrastructure'

// Remote Jobs Widgets
export { BackupForm, RestoreForm } from './remote-jobs'

// Patches Widgets
export { PatchFileExplorer } from './patches'

// Releases Widgets
export { VersionCreateForm } from './releases'
