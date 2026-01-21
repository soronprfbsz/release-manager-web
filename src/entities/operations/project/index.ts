// API
export { projectApi } from './api/projectApi'

// Types
export type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  // 온보딩
  OnboardingFileNode,
  OnboardingFilesResponse,
  OnboardingFileDeleteResponse,
  OnboardingFileUploadResponse,
  OnboardingDirectoryCreateResponse,
  // 인스톨
  InstallFileNode,
  InstallFilesResponse,
  InstallFileDeleteResponse,
  InstallFileUploadResponse,
  InstallDirectoryCreateResponse,
} from './model/types'
export { DEFAULT_PROJECT_ID } from './model/types'

// Queries & Mutations
export {
  projectKeys,
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  // 온보딩
  useOnboardingFiles,
  useOnboardingFileContent,
  useUploadOnboardingFile,
  useDeleteOnboardingFile,
  useCreateOnboardingDirectory,
  // 인스톨
  useInstallFiles,
  useInstallFileContent,
  useUploadInstallFile,
  useDeleteInstallFile,
  useCreateInstallDirectory,
} from './queries/projectQueries'
