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
| `ui/` | React 컴포넌트 | `LoginForm.tsx`, `CustomerCard.tsx` |
| `model/` | 타입, 스토어, 훅, 로직 | `types.ts`, `useCustomer.ts` |
| `api/` | API 함수, React Query 훅 | `customerApi.ts`, `queries.ts` |
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
├── config/       # 전역 설정, 라우트 상수
└── types/        # 공통 타입 (ApiResponse, Pagination 등)
```

**shared/api에 포함되어야 할 것**:
- `client.ts` - axios 인스턴스
- 공통 인터셉터, 에러 핸들러

**shared/api에 포함되면 안 되는 것**:
- 도메인별 API (customerApi, releaseApi 등) → `entities/`로 이동

**shared/types에 포함되어야 할 것**:
```typescript
// shared/types/api.ts
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
}
```

---

### 2. `entities/` - 엔티티 레이어

**목적**: 비즈니스 도메인 모델 정의

```
entities/
├── customer/
│   ├── api/
│   │   └── customerApi.ts    # Customer CRUD API
│   ├── model/
│   │   ├── types.ts          # Customer 타입 정의
│   │   └── useCustomer.ts    # Customer 관련 훅
│   ├── ui/
│   │   ├── CustomerCard.tsx  # Customer 표시 컴포넌트
│   │   └── CustomerBadge.tsx
│   └── index.ts              # Public API
├── release/
│   ├── api/
│   ├── model/
│   ├── ui/
│   └── index.ts
├── patch/
│   └── ...
└── user/
    └── ...
```

**entities/customer/model/types.ts 예시**:
```typescript
export interface Customer {
  customerId: number
  customerCode: string
  customerName: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomerCreateRequest {
  customerCode: string
  customerName: string
  description?: string
  isActive?: boolean
}

export interface CustomerUpdateRequest {
  customerName?: string
  description?: string
  isActive?: boolean
}
```

**entities/customer/api/customerApi.ts 예시**:
```typescript
import { apiClient } from '@/shared/api/client'
import type { Customer, CustomerCreateRequest } from '../model/types'

export const customerApi = {
  getList: async (params?: { isActive?: boolean; keyword?: string }) => {
    const response = await apiClient.get<Customer[]>('/api/v1/customers', { params })
    return response.data
  },
  // ...
}
```

**entities/customer/index.ts (Public API)**:
```typescript
// Types
export type { Customer, CustomerCreateRequest, CustomerUpdateRequest } from './model/types'

// API
export { customerApi } from './api/customerApi'

// UI Components
export { CustomerCard } from './ui/CustomerCard'
export { CustomerBadge } from './ui/CustomerBadge'

// Hooks
export { useCustomer } from './model/useCustomer'
```

---

### 3. `features/` - 기능 레이어

**목적**: 사용자 시나리오, 비즈니스 액션 구현

```
features/
├── auth/
│   ├── login/
│   │   ├── ui/
│   │   │   └── LoginForm.tsx
│   │   ├── model/
│   │   │   └── useLogin.ts
│   │   └── index.ts
│   └── signup/
│       └── ...
├── customer-management/
│   ├── create-customer/
│   │   ├── ui/
│   │   │   └── CreateCustomerForm.tsx
│   │   └── index.ts
│   └── delete-customer/
│       └── ...
├── patch-generation/
│   ├── ui/
│   │   └── PatchGenerateForm.tsx
│   ├── model/
│   │   └── usePatchGenerate.ts
│   └── index.ts
```

**features vs entities 구분**:
- `entities`: "무엇을" (데이터 모델, CRUD)
- `features`: "어떻게" (사용자 행동, 비즈니스 프로세스)

| entities | features |
|----------|----------|
| Customer 타입/API | 고객 생성 폼 |
| Release 타입/API | 릴리즈 업로드 |
| Patch 타입/API | 패치 생성 프로세스 |

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
├── customer-table/
│   ├── ui/
│   │   └── CustomerTable.tsx
│   └── index.ts
```

---

### 5. `pages/` - 페이지 레이어

**목적**: 라우트별 페이지 조합

```
pages/
├── home/
│   ├── ui/
│   │   └── HomePage.tsx
│   └── index.ts
├── customers/
│   ├── list/
│   │   ├── ui/
│   │   │   └── CustomerListPage.tsx
│   │   └── index.ts
│   └── index.ts
├── patches/
│   ├── generate/
│   │   └── ...
│   └── history/
│       └── ...
```

**pages/customers/list/ui/CustomerListPage.tsx 예시**:
```typescript
import { CustomerTable } from '@/widgets/customer-table'
import { CreateCustomerButton } from '@/features/customer-management/create-customer'
import { Customer } from '@/entities/customer'

export function CustomerListPage() {
  // 페이지는 조합만 담당, 비즈니스 로직은 widgets/features에 위임
  return (
    <div>
      <CreateCustomerButton />
      <CustomerTable />
    </div>
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
- 컴포넌트: `PascalCase.tsx` (예: `CustomerCard.tsx`)
- 훅: `useCamelCase.ts` (예: `useCustomer.ts`)
- 유틸/API: `camelCase.ts` (예: `customerApi.ts`)
- 타입: `types.ts` 또는 `{domain}.types.ts`

### 폴더명
- 모두 `kebab-case` (예: `customer-management`, `theme-toggle`)

### Export 규칙
- 각 슬라이스는 반드시 `index.ts`로 Public API 노출
- 외부에서는 `index.ts`를 통해서만 import

```typescript
// ✅ 올바른 import
import { Customer, customerApi } from '@/entities/customer'
import { LoginForm } from '@/features/auth/login'

// ❌ 잘못된 import (내부 파일 직접 접근)
import { Customer } from '@/entities/customer/model/types'
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

**표준 import 순서**:
```typescript
// 1. 외부 라이브러리
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. app 레이어
import { useAuth } from '@/app/providers/AuthProvider'

// 3. pages (보통 import 안 함)

// 4. widgets
import { CustomerTable } from '@/widgets/customer-table'

// 5. features
import { CreateCustomerForm } from '@/features/customer-management/create-customer'

// 6. entities
import { Customer, customerApi } from '@/entities/customer'

// 7. shared
import { Button } from '@/shared/ui/button'
import { formatDate } from '@/shared/lib/utils'
```

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
// ❌ entities/customer에서 entities/release import
import { Release } from '@/entities/release'
```

### ❌ 하위 레이어에서 상위 레이어 import
```typescript
// ❌ entities에서 features import
import { CreateCustomerForm } from '@/features/customer-management'
```

### ❌ shared에 비즈니스 로직 포함
```typescript
// ❌ shared/api/customerApi.ts - 잘못된 위치
// ✅ entities/customer/api/customerApi.ts - 올바른 위치
```

### ❌ 내부 파일 직접 import
```typescript
// ❌ index.ts 우회
import { useCustomer } from '@/entities/customer/model/useCustomer'

// ✅ Public API 사용
import { useCustomer } from '@/entities/customer'
```

### ❌ 페이지에 비즈니스 로직 직접 작성
```typescript
// ❌ 페이지에서 직접 mutation 정의
const createMutation = useMutation({ ... })

// ✅ features에서 정의하고 import
import { useCreateCustomer } from '@/features/customer-management/create-customer'
```

---

## 프로젝트별 도메인 구조

### Release Manager 도메인

```
entities/
├── customer/     # 고객사
├── release/      # 릴리즈 버전
├── patch/        # 누적 패치
└── user/         # 사용자/계정

features/
├── auth/
│   ├── login/
│   └── signup/
├── customer-management/
│   ├── create-customer/
│   ├── update-customer/
│   └── delete-customer/
├── release-management/
│   └── upload-release/
└── patch-generation/
    └── generate-patch/
```

---

## Quick Reference

| 질문 | 레이어 |
|------|--------|
| API 클라이언트 (axios)는? | `shared/api/client.ts` |
| Customer 타입은? | `entities/customer/model/types.ts` |
| Customer API는? | `entities/customer/api/customerApi.ts` |
| 고객 생성 폼은? | `features/customer-management/create-customer/ui/` |
| 고객 목록 테이블 위젯은? | `widgets/customer-table/ui/` |
| 고객 관리 페이지는? | `pages/customers/list/ui/` |
| Button 컴포넌트는? | `shared/ui/button.tsx` |
| formatDate 유틸은? | `shared/lib/utils.ts` |
