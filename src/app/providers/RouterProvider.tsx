import { createBrowserRouter, RouterProvider as ReactRouterProvider } from 'react-router-dom'
import { ROUTES } from '@/shared/config/constants'
import { ProtectedRoute } from './ProtectedRoute'
import { MainLayout } from '../layouts/MainLayout'
import { LoginPage } from '@/pages/auth/login/LoginPage'
import { SignUpPage } from '@/pages/auth/signup/SignUpPage'
import { HomePage } from '@/pages/HomePage'
import { StandardReleasePage } from '@/pages/releases/standard/StandardReleasePage'
import { CustomReleasePage } from '@/pages/releases/custom/CustomReleasePage'
import { PatchGeneratePage } from '@/pages/patches/generate/PatchGeneratePage'
import { PatchHistoryPage } from '@/pages/patches/history/PatchHistoryPage'
import { CustomerListPage } from '@/pages/customers'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
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
    path: ROUTES.PATCHES.GENERATE,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <PatchGeneratePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PATCHES.HISTORY,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <PatchHistoryPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PATCHES.DOWNLOAD,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <PatchHistoryPage />
        </MainLayout>
      </ProtectedRoute>
    ),
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
    path: ROUTES.SCRIPTS.BACKUP,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <div>
            <h1 className="text-3xl font-bold mb-6">백업 스크립트</h1>
            <p className="text-muted-foreground">백업 스크립트 다운로드 페이지입니다.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SCRIPTS.RESTORE,
    element: (
      <ProtectedRoute>
        <MainLayout>
          <div>
            <h1 className="text-3xl font-bold mb-6">복구 스크립트</h1>
            <p className="text-muted-foreground">복구 스크립트 다운로드 페이지입니다.</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
])

export function RouterProvider() {
  return <ReactRouterProvider router={router} />
}
