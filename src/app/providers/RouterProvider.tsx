import { createBrowserRouter, RouterProvider as ReactRouterProvider } from 'react-router-dom'

import { LoginPage } from '@/pages/auth/login'
import { SignUpPage } from '@/pages/auth/signup'
import { NotFoundPage } from '@/pages/error/NotFoundPage'
import { HomePage } from '@/pages/home'
import { ResourcePage } from '@/pages/infrastructure'
import { MariaDBPage, TerminalPage } from '@/pages/remote-jobs'
import { AccountListPage } from '@/pages/operations/accounts/AccountListPage'
import { CustomerListPage } from '@/pages/operations/customers'
import { EngineerListPage } from '@/pages/operations/engineers'
import { ProjectListPage } from '@/pages/operations/projects/ProjectListPage'
import { CustomPatchPage } from '@/pages/patches/custom'
import { StandardPatchPage } from '@/pages/patches/standard'
import { CustomReleasePage } from '@/pages/releases/custom'
import { StandardReleasePage } from '@/pages/releases/standard'
import { FileSyncPage } from '@/pages/operations/file-sync/FileSyncPage'

import { ROUTES } from '@/shared/config/constants'

import { ProtectedRoute } from './ProtectedRoute'
import { MainLayout } from '../layouts/MainLayout'

const router = createBrowserRouter([
  {
    path: ROUTES.AUTH.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.AUTH.SIGNUP,
    element: <SignUpPage />,
  },
  {
    path: ROUTES.HOME,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <HomePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.RELEASES.STANDARD,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <StandardReleasePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.RELEASES.CUSTOM,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CustomReleasePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PATCHES.STANDARD,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <StandardPatchPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PATCHES.CUSTOM,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CustomPatchPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.OPERATIONS.CUSTOMERS,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CustomerListPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.OPERATIONS.ENGINEERS,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <EngineerListPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.OPERATIONS.ACCOUNTS,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <AccountListPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.OPERATIONS.PROJECTS,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ProjectListPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.OPERATIONS.FILE_SYNC,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <FileSyncPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.DEVELOPMENT_SUPPORT.REMOTE_JOBS.MARIADB,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <MariaDBPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.DEVELOPMENT_SUPPORT.REMOTE_JOBS.TERMINAL,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <TerminalPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.DEVELOPMENT_SUPPORT.INFRASTRUCTURE.RESOURCES,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ResourcePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  // 404 Not Found - 모든 미정의 경로
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function RouterProvider() {
  return <ReactRouterProvider router={router} />
}
