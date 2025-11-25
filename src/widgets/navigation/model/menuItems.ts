import { ROUTES } from '@/shared/config/constants'

export interface MenuItem {
  label: string
  path?: string
  children?: MenuItem[]
}

export const menuItems: MenuItem[] = [
  {
    label: '릴리즈 관리',
    children: [
      {
        label: '표준 릴리즈',
        path: ROUTES.RELEASES.STANDARD,
      },
      {
        label: '커스텀 릴리즈',
        path: ROUTES.RELEASES.CUSTOM,
      },
    ],
  },
  {
    label: '패치본 관리',
    children: [
      {
        label: '누적 패치 생성',
        path: ROUTES.PATCHES.GENERATE,
      },
      {
        label: '패치 조회/다운로드',
        path: ROUTES.PATCHES.HISTORY,
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
