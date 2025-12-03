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
    label: '고객사 관리',
    path: ROUTES.CUSTOMERS.LIST,
  },
  {
    label: '리소스 관리',
    path: ROUTES.RESOURCES.SCRIPTS,
  },
]
