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
        label: '표준 패치본',
        path: ROUTES.PATCHES.STANDARD,
      },
      {
        label: '커스텀 패치본',
        path: ROUTES.PATCHES.CUSTOM,
      },
    ],
  },
  {
    label: '고객사 관리',
    path: ROUTES.CUSTOMERS.LIST,
  },
  {
    label: '기타',
    children: [
      {
        label: '백업 스크립트',
        path: ROUTES.SCRIPTS.BACKUP,
      },
      {
        label: '복구 스크립트',
        path: ROUTES.SCRIPTS.RESTORE,
      },
    ],
  },
]
