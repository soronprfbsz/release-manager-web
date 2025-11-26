import { createBrowserRouter, RouterProvider as ReactRouterProvider, Navigate } from 'react-router-dom'
import { ROUTES } from '@/shared/config/constants'
import { ProtectedRoute } from './ProtectedRoute'
import { MainLayout } from '../layouts/MainLayout'
import { LoginPage } from '@/pages/auth/login'
import { SignUpPage } from '@/pages/auth/signup'
import { HomePage } from '@/pages/home'
import { StandardReleasePage } from '@/pages/releases/standard'
import { CustomReleasePage } from '@/pages/releases/custom'
import { StandardPatchPage } from '@/pages/patches/standard'
import { CustomPatchPage } from '@/pages/patches/custom'
import { CustomerListPage } from '@/pages/customers'
import { ScriptDownloadPage } from '@/pages/downloads/scripts'

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
  // 레거시 라우트 리다이렉트
  {
    path: ROUTES.PATCHES.GENERATE,
    element: <Navigate to={ROUTES.PATCHES.STANDARD} replace />,
  },
  {
    path: ROUTES.PATCHES.HISTORY,
    element: <Navigate to={ROUTES.PATCHES.STANDARD} replace />,
  },
  {
    path: ROUTES.PATCHES.DOWNLOAD,
    element: <Navigate to={ROUTES.PATCHES.STANDARD} replace />,
  },
  {
    path: ROUTES.CUSTOMERS.LIST,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CustomerListPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.DOWNLOADS.SCRIPTS,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ScriptDownloadPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  // 레거시 스크립트 라우트 리다이렉트
  {
    path: '/scripts/backup',
    element: <Navigate to={ROUTES.DOWNLOADS.SCRIPTS} replace />,
  },
  {
    path: '/scripts/restore',
    element: <Navigate to={ROUTES.DOWNLOADS.SCRIPTS} replace />,
  },
])

export function RouterProvider() {
  return <ReactRouterProvider router={router} />
}
