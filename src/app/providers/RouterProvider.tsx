import { createBrowserRouter, Navigate, RouterProvider as ReactRouterProvider } from 'react-router-dom'

import { LoginPage } from '@/pages/auth/login'
import { SignUpPage } from '@/pages/auth/signup'
import { NotFoundPage } from '@/pages/error/NotFoundPage'
import { HomePage } from '@/pages/home'
import { AccountListPage } from '@/pages/operations/accounts/AccountListPage'
import { DepartmentPage } from '@/pages/operations/departments'
import { FileSyncPage } from '@/pages/operations/file-sync/FileSyncPage'
import { ApiLogPage } from '@/pages/operations/history'
import { ProjectListPage } from '@/pages/operations/projects/ProjectListPage'
import { PatchesPage } from '@/pages/patches'
import { ReleasesPage } from '@/pages/releases'
import { MariaDBPage, TerminalPage, SchedulerPage } from '@/pages/remote-jobs'
import { ResourcePage, CoworkPage, MessagesPage } from '@/pages/sharing'
import { SiteListPage } from '@/pages/sites'

import { ROUTES } from '@/shared/config/constants'
import { ROUTE_PERMISSIONS } from '@/shared/config/permissions'

import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
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
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.RELEASES]}>
            <ReleasesPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PATCHES,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.PATCHES]}>
            <PatchesPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SITES,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.SITES]}>
            <SiteListPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  // 구 고객사 경로 — 북마크 호환용 리다이렉트
  {
    path: '/operations/customers',
    element: <Navigate to={ROUTES.SITES} replace />,
  },
  {
    path: ROUTES.OPERATIONS.DEPARTMENTS,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.OPERATIONS.DEPARTMENTS]}>
            <DepartmentPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.OPERATIONS.ACCOUNTS,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.OPERATIONS.ACCOUNTS]}>
            <AccountListPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.OPERATIONS.PROJECTS,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.OPERATIONS.PROJECTS]}>
            <ProjectListPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.OPERATIONS.FILE_SYNC,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.OPERATIONS.FILE_SYNC]}>
            <FileSyncPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.OPERATIONS.HISTORY,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.OPERATIONS.HISTORY]}>
            <ApiLogPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT.REMOTE_JOBS.MARIADB,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.SUPPORT.REMOTE_JOBS.MARIADB]}>
            <MariaDBPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT.REMOTE_JOBS.TERMINAL,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.SUPPORT.REMOTE_JOBS.TERMINAL]}>
            <TerminalPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT.REMOTE_JOBS.SCHEDULER,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.SUPPORT.REMOTE_JOBS.SCHEDULER]}>
            <SchedulerPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT.SHARING.RESOURCES,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.SUPPORT.SHARING.RESOURCES]}>
            <ResourcePage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT.SHARING.COWORK,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.SUPPORT.SHARING.COWORK]}>
            <CoworkPage />
          </RoleGuard>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SUPPORT.SHARING.MESSAGES,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RoleGuard allowedRoles={ROUTE_PERMISSIONS[ROUTES.SUPPORT.SHARING.MESSAGES]}>
            <MessagesPage />
          </RoleGuard>
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
