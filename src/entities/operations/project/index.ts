// API
export { projectApi } from './api/projectApi'

// Types
export type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  OnboardingFileNode,
  OnboardingFilesResponse,
  OnboardingFileDeleteResponse,
  OnboardingFileUploadResponse,
  OnboardingDirectoryCreateResponse,
} from './model/types'
export { DEFAULT_PROJECT_ID } from './model/types'

// Queries & Mutations
export {
  projectKeys,
  useProjects,
  useProject,
  useOnboardingFiles,
  useOnboardingFileContent,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useUploadOnboardingFile,
  useDeleteOnboardingFile,
  useCreateOnboardingDirectory,
} from './queries/projectQueries'
