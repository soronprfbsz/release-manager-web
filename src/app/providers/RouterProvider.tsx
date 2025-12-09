import { createBrowserRouter, RouterProvider as ReactRouterProvider } from 'react-router-dom'

import { LoginPage } from '@/pages/auth/login'
import { SignUpPage } from '@/pages/auth/signup'
import { ResourcePage } from '@/pages/resources'
import { HomePage } from '@/pages/home'
import { MariaDBJobPage } from '@/pages/job'
import { AccountListPage } from '@/pages/operations/accounts/AccountListPage'
import { CustomerListPage } from '@/pages/operations/customers'
import { EngineerListPage } from '@/pages/operations/engineers'
import { CustomPatchPage } from '@/pages/patches/custom'
import { StandardPatchPage } from '@/pages/patches/standard'
import { CustomReleasePage } from '@/pages/releases/custom'
import { StandardReleasePage } from '@/pages/releases/standard'

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
    path: ROUTES.JOBS.MARIADB,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <MariaDBJobPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.RESOURCES.ROOT,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ResourcePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
])

export function RouterProvider() {
  return <ReactRouterProvider router={router} />
}
