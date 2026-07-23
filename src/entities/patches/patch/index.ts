/**
 * Patch Entity Public API
 */

// Types
export type {
  CumulativePatch,
  CumulativePatchDetail,
  CumulativePatchGenerateRequest,
  CustomPatchGenerateRequest,
  CustomPatchSite,
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
  useCustomPatchSites,
  useCustomPatchVersions,
  useGenerateStandardPatch,
  useGenerateCustomPatch,
  useCompletePatch,
  useDeletePatch,
  useDeletePatchHistory,
  useBulkDeletePatches,
  usePatchNamePreview,
} from './queries/patchQueries'
