import { ROUTES } from '@/shared/config/constants'

export interface MenuItem {
  label: string
  path?: string
  children?: MenuItem[]
}

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
    label: '작업 관리',
    children: [
      {
        label: 'MariaDB 백업 및 복원',
        path: ROUTES.JOBS.MARIADB,
      },
    ],
  },
  {
    label: '리소스 관리',
    path: ROUTES.RESOURCES.ROOT,
  },
]
