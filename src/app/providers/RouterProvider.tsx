import { createBrowserRouter, RouterProvider as ReactRouterProvider } from 'react-router-dom'

import { LoginPage } from '@/pages/auth/login'
import { SignUpPage } from '@/pages/auth/signup'
import { NotFoundPage } from '@/pages/error/NotFoundPage'
import { HomePage } from '@/pages/home'
import { ResourcePage, CoworkPage } from '@/pages/sharing'
import { MariaDBPage, TerminalPage, SchedulerPage } from '@/pages/remote-jobs'
import { AccountListPage } from '@/pages/operations/accounts/AccountListPage'
import { CustomerListPage } from '@/pages/operations/customers'
import { DepartmentPage } from '@/pages/operations/departments'
import { ProjectListPage } from '@/pages/operations/projects/ProjectListPage'
import { PatchesPage } from '@/pages/patches'
import { ReleasesPage } from '@/pages/releases'
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
    path: ROUTES.RELEASES,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ReleasesPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PATCHES,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <PatchesPage />
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
    path: ROUTES.OPERATIONS.DEPARTMENTS,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <DepartmentPage />
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
    path: ROUTES.SUPPORT.REMOTE_JOBS.MARIADB,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <MariaDBPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT.REMOTE_JOBS.TERMINAL,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <TerminalPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT.REMOTE_JOBS.SCHEDULER,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SchedulerPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT.SHARING.RESOURCES,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ResourcePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT.SHARING.COWORK,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CoworkPage />
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
