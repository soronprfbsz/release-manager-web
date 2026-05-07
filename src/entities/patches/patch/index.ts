/**
 * Patch Entity Public API
 */

// Types
export type {
  CumulativePatch,
  CumulativePatchDetail,
  CumulativePatchGenerateRequest,
  CustomPatchGenerateRequest,
  CustomPatchCustomer,
  CustomPatchVersion,
  PatchFileNode,
  PatchFileStructure,
  BuildSelection,
  SelectedWeb,
  SelectedEngine,
  IncludedWeb,
  IncludedEngine,
  IncludedBuilds,
  PatchHotfixInRangeInfo,
  GenerateResponse,
} from './model/types'

// API
export { patchApi } from './api/patchApi'

// Queries
export {
  patchKeys,
  usePatches,
  usePatchHistories,
  usePatch,
  usePatchFileStructure,
  usePatchFileContent,
  useCustomPatchCustomers,
  useCustomPatchVersions,
  useGenerateStandardPatch,
  useGenerateCustomPatch,
  usePatchProgress,
  useDeletePatch,
  useDeletePatchHistory,
  useBulkDeletePatches,
} from './queries/patchQueries'

// Progress type
export type { PatchProgress } from './api/patchApi'
