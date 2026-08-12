# Feature-Sliced Design (FSD) Guide

이 프로젝트는 Feature-Sliced Design 아키텍처를 따릅니다. 모든 코드 생성 및 수정 시 이 가이드를 준수하세요.

---

## 레이어 구조 (상위 → 하위)

```
src/
├── app/          # 앱 초기화, 프로바이더, 라우팅, 전역 스타일
├── pages/        # 전체 페이지 컴포넌트 (라우트별)
├── widgets/      # 독립적인 UI 블록 (헤더, 사이드바 등)
├── features/     # 사용자 시나리오, 비즈니스 액션
├── entities/     # 비즈니스 엔티티 (도메인 모델)
└── shared/       # 재사용 유틸리티, UI 컴포넌트 (비즈니스 로직 없음)
```

### 레이어 규칙

| 레이어 | 설명 | import 가능 대상 |
|--------|------|------------------|
| `app` | 앱 진입점, 프로바이더, 라우팅 | 모든 레이어 |
| `pages` | 라우트별 페이지 컴포넌트 | widgets, features, entities, shared |
| `widgets` | 독립적 UI 블록 | features, entities, shared |
| `features` | 비즈니스 액션/시나리오 | entities, shared |
| `entities` | 도메인 모델, 엔티티 | shared |
| `shared` | 공통 유틸, UI | 없음 (자기 자신만) |

**핵심 규칙**: 상위 레이어는 하위 레이어만 import 가능. 같은 레이어 내 슬라이스 간 import 금지.

---

## 슬라이스와 세그먼트 구조

각 레이어는 **슬라이스**(도메인별 폴더)로 나뉘고, 슬라이스는 **세그먼트**(역할별 폴더)로 구성됩니다.

### 표준 세그먼트

```
{slice}/
├── ui/           # UI 컴포넌트
├── model/        # 비즈니스 로직, 상태, 타입
├── api/          # API 호출 함수
├── lib/          # 유틸리티 함수
├── config/       # 설정 상수
└── index.ts      # Public API (필수)
```

### 세그먼트별 역할

| 세그먼트 | 내용 | 예시 |
|----------|------|------|
| `ui/` | React 컴포넌트 | `LoginForm.tsx`, `SiteSelect.tsx` |
| `model/` | 타입, 스토어, 훅, 로직 | `types.ts` |
| `api/` | API 함수 | `siteApi.ts` |
| `lib/` | 순수 유틸리티 함수 | `formatDate.ts`, `validation.ts` |
| `config/` | 상수, 설정값 | `constants.ts` |
| `index.ts` | Public API exports | 외부 노출 항목만 export |

---

## 레이어별 상세 가이드

### 1. `shared/` - 공통 레이어

**목적**: 비즈니스 로직이 없는 재사용 가능한 코드

```
shared/
├── ui/           # shadcn 등 기본 UI 컴포넌트
├── api/          # API 클라이언트 (axios 인스턴스만)
├── lib/          # 유틸리티, 커스텀 훅
├── config/       # 전역 설정, 라우트 상수 (constants.ts=ROUTES, permissions.ts)
├── store/        # 전역 Zustand 스토어 (auth, project, theme)
└── api/types.ts  # 공통 API 타입 (ApiResponse, PageResponse 등)
```

**shared/api에 포함되어야 할 것**:
- `client.ts` - axios 인스턴스
- 공통 인터셉터, 에러 핸들러

**shared/api에 포함되면 안 되는 것**:
- 도메인별 API (siteApi, messageApi 등) → `entities/`로 이동

**공통 API 타입은 `shared/api/types.ts` 에 있다** (`shared/types/` 폴더는 없다):
```typescript
export interface ApiResponse<T> { success: boolean; data: T; message?: string }
export interface PageResponse<T> {
  content: T[]; totalElements: number; totalPages: number
  size: number; number: number; first: boolean; last: boolean; empty: boolean
}
```

---

### 2. `entities/` - 엔티티 레이어

**목적**: 비즈니스 도메인 모델 정의

> ⚠️ 이 프로젝트는 슬라이스를 **도메인 그룹으로 한 단계 더 묶는다.**
> `entities/{그룹}/{슬라이스}/` 형태이며, 그룹에도 배럴 `index.ts` 가 있다.

```
entities/
├── sites/
│   ├── site/
│   │   ├── api/siteApi.ts
│   │   ├── model/types.ts
│   │   ├── queries/siteQueries.ts   # React Query 훅은 queries/ 세그먼트
│   │   ├── ui/SiteSelect.tsx        # 공용 엔티티 UI
│   │   └── index.ts                 # 슬라이스 Public API
│   ├── site-note/
│   ├── site-version/
│   └── index.ts                     # 그룹 배럴 (export * from './site' …)
├── messages/message/
├── patches/patch/
├── operations/account/
└── index.ts                         # entities 전체 배럴
```

**entities/sites/site/model/types.ts 예시**:
```typescript
export interface Site {
  siteId: number
  siteCode: string      // 소문자/숫자/_/- 만 허용
  siteName: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface SiteCreateRequest {
  siteCode: string
  siteName: string
  description?: string
}
```

> 참고: 코드에서는 **site** 를 쓰지만 **DB 스키마는 여전히 `customer`** 다(의도적 유지).
> 백엔드 컬럼명이 `customer_id` 라고 해서 프론트 타입을 customer 로 만들지 않는다.

**entities/sites/site/api/siteApi.ts 예시**:
```typescript
import { apiClient } from '@/shared/api/client'

import type { PageResponse } from '@/shared/api/types'

import type { Site, SiteCreateRequest } from '../model/types'

export const siteApi = {
  getList: async (params?: SiteListParams): Promise<PageResponse<Site>> => {
    // ⚠️ apiClient 가 ApiResponse 의 data 를 이미 벗겨서 반환한다.
    //    호출부에서 다시 `.data` 를 꺼내면 undefined 가 된다.
    const response = await apiClient.get<PageResponse<Site>>('/api/sites')
    return response
  },
}
```

**entities/sites/site/index.ts (Public API)**:
```typescript
// Types
export type { Site, SiteCreateRequest } from './model/types'

// API
export { siteApi } from './api/siteApi'

// Queries (React Query 훅)
export { siteKeys, useSites, useCreateSite } from './queries/siteQueries'

// UI Components
export { SiteSelect } from './ui/SiteSelect'
```

---

### 3. `features/` - 기능 레이어

**목적**: 사용자 시나리오, 비즈니스 액션 구현

> ⚠️ 이 프로젝트는 액션 단위로 잘게 쪼개지 않고 **`{그룹}/{기능}-management`** 로 묶는다.
> 한 기능 슬라이스 안에 폼·테이블·다이얼로그를 함께 둔다.

```
features/
├── auth/login/ui/LoginForm.tsx
├── sites/site-management/
│   ├── ui/SiteForm.tsx
│   ├── ui/SiteTable.tsx
│   ├── ui/SiteDeleteDialog.tsx   # 삭제 확인 — UI_GUIDE 4번
│   └── index.ts
├── messages/message-management/
│   ├── ui/MessageComposeDialog.tsx
│   ├── ui/MessageDetailDialog.tsx
│   └── index.ts
└── index.ts                       # features 전체 배럴
```

**features vs entities 구분**:
- `entities`: "무엇을" (데이터 모델, CRUD)
- `features`: "어떻게" (사용자 행동, 비즈니스 프로세스)

| entities | features |
|----------|----------|
| Site 타입/API/쿼리훅 | 사이트 등록 폼, 삭제 다이얼로그 |
| Message 타입/API/쿼리훅 | 메시지 작성·상세·수신자 선택 |
| Patch 타입/API/쿼리훅 | 패치 생성 프로세스 |

---

### 4. `widgets/` - 위젯 레이어

**목적**: 독립적인 UI 블록, 여러 features/entities 조합

```
widgets/
├── navigation/
│   ├── ui/
│   │   └── NavigationBar.tsx
│   ├── model/
│   │   └── menuItems.ts
│   └── index.ts
├── theme-toggle/
│   ├── ui/
│   │   └── ThemeToggle.tsx
│   └── index.ts
├── project-selector/
│   ├── ui/ProjectSelector.tsx
│   └── index.ts
├── notification-bell/
│   ├── ui/NotificationBell.tsx
│   └── index.ts
```

---

### 5. `pages/` - 페이지 레이어

**목적**: 라우트별 페이지 조합

> ⚠️ 이 프로젝트의 pages 에는 **`ui/` 세그먼트를 두지 않는다.**
> 페이지 컴포넌트를 슬라이스 폴더에 바로 두고 `index.ts` 로 내보낸다.

```
pages/
├── home/HomePage.tsx
├── patches/PatchesPage.tsx
├── sharing/
│   ├── cowork/CoworkPage.tsx
│   ├── messages/
│   │   ├── MessagesPage.tsx
│   │   └── index.ts
│   └── index.ts          # 그룹 배럴
└── ...
```

**pages/sites/SitesPage.tsx 예시**:
```typescript
import { SiteTable, SiteForm } from '@/features/sites/site-management'

import { PageLayout } from '@/shared/ui/page-layout'

export function SitesPage() {
  // 페이지는 조합 + 화면 상태만 담당. 비즈니스 로직은 features 에 위임한다.
  return (
    <PageLayout actions={/* 아이콘 버튼 + Tooltip — UI_GUIDE 2번 */}>
      <SiteTable />
      <SiteForm />
    </PageLayout>
  )
}
```

---

### 6. `app/` - 앱 레이어

**목적**: 앱 초기화, 프로바이더, 라우팅

```
app/
├── providers/
│   ├── AuthProvider.tsx
│   ├── QueryProvider.tsx
│   ├── ThemeProvider.tsx
│   ├── RouterProvider.tsx
│   └── ProtectedRoute.tsx
├── layouts/
│   ├── MainLayout.tsx
│   └── AuthLayout.tsx
├── styles/
│   └── globals.css
└── App.tsx
```

---

## 명명 규칙

### 파일명
- 컴포넌트: `PascalCase.tsx` (예: `SiteSelect.tsx`)
- 훅: `useCamelCase.ts` (예: `useSshShell.ts`)
- 유틸/API: `camelCase.ts` (예: `siteApi.ts`)
- 타입: `types.ts` 또는 `{domain}.types.ts`

### 폴더명
- 모두 `kebab-case` (예: `site-management`, `notification-bell`)

### Export 규칙
- 각 슬라이스는 반드시 `index.ts`로 Public API 노출
- 외부에서는 `index.ts`를 통해서만 import

```typescript
// ✅ 올바른 import
import { Site, siteApi } from '@/entities/sites/site'
import { LoginForm } from '@/features/auth/login'

// ❌ 잘못된 import (내부 파일 직접 접근)
import { Site } from '@/entities/sites/site/model/types'
import { LoginForm } from '@/features/auth/login/ui/LoginForm'
```

---

## Import 경로 별칭

```typescript
// tsconfig.json paths 설정
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

**표준 import 순서** — eslint `import/order` 가 강제한다(위반 시 lint 에러).

그룹 사이에는 **빈 줄이 반드시 하나** 있어야 하고, 그룹 안은 알파벳순이다.
FSD 레이어 순서(app → pages → widgets → features → entities)가 그대로 적용되며,
**`@/shared/**` 는 internal 그룹의 마지막**, **타입 전용 import(`import type`) 는 맨 끝**이다.

```typescript
// 1. react 먼저, 이어서 외부 패키지
import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'

// 2. FSD 레이어 순 (app → pages → widgets → features → entities)
import { NotificationBell } from '@/widgets/_shared/notification-bell'

import { SiteForm } from '@/features/sites/site-management'

import { useSites } from '@/entities/sites/site'

// 3. shared 는 internal 그룹의 맨 뒤
import { ROUTES } from '@/shared/config/constants'
import { Button } from '@/shared/ui/button'

// 4. 타입 전용 import 는 가장 마지막 그룹
import type { Site } from '@/entities/sites/site'
```

> 순서를 손으로 맞추려 하지 말고 `npx eslint --fix <파일>` 로 정리한다.

---

## 새 기능 추가 체크리스트

### 새 엔티티 추가 시
1. `entities/{entity-name}/` 폴더 생성
2. `model/types.ts` - 타입 정의
3. `api/{entity}Api.ts` - API 함수
4. `ui/` - 엔티티 표시 컴포넌트 (필요 시)
5. `index.ts` - Public API export

### 새 기능 추가 시
1. `features/{feature-name}/` 폴더 생성
2. `ui/` - UI 컴포넌트
3. `model/` - 비즈니스 로직, 상태 (필요 시)
4. `index.ts` - Public API export

### 새 페이지 추가 시
1. `pages/{page-name}/` 폴더 생성
2. `ui/{PageName}Page.tsx` - 페이지 컴포넌트
3. `index.ts` - Public API export
4. `app/providers/RouterProvider.tsx` - 라우트 추가

---

## Anti-Patterns (피해야 할 것)

### ❌ 같은 레이어 내 슬라이스 간 import
```typescript
// ❌ entities/sites/site 에서 entities/patches/patch 를 import
import { Patch } from '@/entities/patches/patch'
```

### ❌ 하위 레이어에서 상위 레이어 import
```typescript
// ❌ entities에서 features import
import { SiteForm } from '@/features/sites/site-management'
```

### ❌ shared에 비즈니스 로직 포함
```typescript
// ❌ shared/api/siteApi.ts - 잘못된 위치
// ✅ entities/sites/site/api/siteApi.ts - 올바른 위치
```

### ❌ 내부 파일 직접 import
```typescript
// ❌ index.ts 우회
import { useSites } from '@/entities/sites/site/queries/siteQueries'

// ✅ Public API 사용
import { useSites } from '@/entities/sites/site'
```

### ❌ 페이지에 비즈니스 로직 직접 작성
```typescript
// ❌ 페이지에서 직접 mutation 정의
const createMutation = useMutation({ ... })

// ✅ features에서 정의하고 import
import { useCreateSite } from '@/entities/sites/site'
```

---

## 프로젝트별 도메인 구조

### Release Manager 도메인

```
entities/
├── sites/        # 사이트(구 고객사), 특이사항, 사이트 버전
├── releases/     # 릴리즈 버전
├── patches/      # 누적 패치
├── messages/     # 사용자 메시지 / 시스템 알림
├── operations/   # 계정, 프로젝트, API 로그
├── infrastructure/, remote-jobs/, board/, auth/
└── _shared/      # 코드·메뉴·부서 등 도메인 공통

features/
├── auth/login, auth/signup
├── sites/site-management
├── patches/patch-management
├── messages/message-management
├── releases/standard, releases/custom
├── operations/{account,department,project,file-sync,...}-management
└── sharing/{file,link,publishing,service}-management
```

---

## Quick Reference

| 질문 | 레이어 |
|------|--------|
| API 클라이언트 (axios)는? | `shared/api/client.ts` |
| 공통 API 타입(ApiResponse/PageResponse)은? | `shared/api/types.ts` |
| Site 타입은? | `entities/sites/site/model/types.ts` |
| Site API는? | `entities/sites/site/api/siteApi.ts` |
| React Query 훅은? | `entities/{그룹}/{슬라이스}/queries/` |
| 사이트 등록 폼은? | `features/sites/site-management/ui/` |
| 탑바 위젯(벨·프로젝트 선택)은? | `widgets/_shared/` |
| 사이트 관리 페이지는? | `pages/sites/SitesPage.tsx` |
| 라우트 상수 / 권한은? | `shared/config/constants.ts` / `permissions.ts` |
| 전역 스토어(auth·project·theme)는? | `shared/store/` |
| Button 컴포넌트는? | `shared/ui/button.tsx` |
| 날짜 포맷(KST 변환)은? | `shared/lib/utils/date.ts` |
