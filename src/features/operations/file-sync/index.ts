/**
 * File Sync Feature
 * 파일 동기화 기능 - API, 타입, UI 컴포넌트 제공
 */

// API
export {
    fileSyncKeys,
    useAnalyzeFileSync,
    useApplyFileSync,
    useIgnoredFiles,
    useRestoreIgnoredFile,
    useRegisterResourceFiles,
    useRegisterBackupFiles,
    useRegisterPatchFiles,
    useRegisterReleaseFiles,
} from './api/queries'

// Types
export type {
    FileSyncActionType,
    FileSyncStatus,
    FileSyncTarget,
    FileInfo,
    DbInfo,
    FileSyncResult,
    FileSyncAnalyzeResponse,
    FileSyncRequest,
    FileSyncAction,
    FileSyncApplyRequest,
    IgnoredFile,
    ResourceRegisterItem,
    ResourceRegisterRequest,
    BackupRegisterItem,
    BackupRegisterRequest,
    PatchRegisterItem,
    PatchRegisterRequest,
    ReleaseRegisterItem,
    ReleaseRegisterRequest,
    RegisterResultItem,
    RegisterResponse,
} from './api/types'

// UI Components
export { ResourceRegisterSheet } from './ui/ResourceRegisterSheet'
export { BackupRegisterSheet } from './ui/BackupRegisterSheet'
export { PatchRegisterSheet } from './ui/PatchRegisterSheet'
export { ReleaseRegisterSheet } from './ui/ReleaseRegisterSheet'
