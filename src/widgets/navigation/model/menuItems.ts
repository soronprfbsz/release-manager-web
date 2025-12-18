import { ROUTES } from '@/shared/config/constants'

export interface MenuItem {
  label: string
  path?: string
  children?: MenuItem[]
}

/**
 * @deprecated This static menu is no longer used. Menu data is now fetched dynamically from API.
 * This file is kept for backward compatibility only.
 */
export const menuItems: MenuItem[] = [
  {
    label: '버전 관리',
    children: [
      {
        label: 'Standard',
        path: ROUTES.RELEASES.STANDARD,
      },
      {
        label: 'Custom',
        path: ROUTES.RELEASES.CUSTOM,
      },
    ],
  },
  {
    label: '패치 관리',
    children: [
      {
        label: 'Standard',
        path: ROUTES.PATCHES.STANDARD,
      },
      {
        label: 'Custom',
        path: ROUTES.PATCHES.CUSTOM,
      },
    ],
  },
  {
    label: '운영 관리',
    children: [
      {
        label: '고객사',
        path: ROUTES.OPERATIONS.CUSTOMERS,
      },
      {
        label: '엔지니어',
        path: ROUTES.OPERATIONS.ENGINEERS,
      },
      {
        label: '계정 관리',
        path: ROUTES.OPERATIONS.ACCOUNTS,
      },
    ],
  },
  {
    label: '개발 지원',
    children: [
      {
        label: '원격 작업',
        children: [
          {
            label: 'MariaDB',
            path: ROUTES.DEVELOPMENT_SUPPORT.REMOTE_JOBS.MARIADB,
          },
          {
            label: '터미널',
            path: ROUTES.DEVELOPMENT_SUPPORT.REMOTE_JOBS.TERMINAL,
          },
        ],
      },
      {
        label: '인프라',
        children: [
          {
            label: '리소스',
            path: ROUTES.DEVELOPMENT_SUPPORT.INFRASTRUCTURE.RESOURCES,
          },
          {
            label: '서비스',
            path: ROUTES.DEVELOPMENT_SUPPORT.INFRASTRUCTURE.SERVICES,
          },
        ],
      },
    ],
  },
]
