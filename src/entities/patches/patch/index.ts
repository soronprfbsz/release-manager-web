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
  PatchFileContent,
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
  useDeletePatch,
  useDeletePatchHistory,
} from './queries/patchQueries'
