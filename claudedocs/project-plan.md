# Release Manager Web - 프로젝트 계획서

## 📋 프로젝트 개요

릴리즈 버전 관리 시스템의 웹 프론트엔드 애플리케이션 구축

### 기술 스택
- **프레임워크**: React 18+ (최신 버전)
- **언어**: TypeScript
- **아키텍처**: FSD (Feature-Sliced Design)
- **UI 컴포넌트**: shadcn/ui
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **상태 관리**: TanStack Query (React Query)
- **라우팅**: React Router v6
- **HTTP 클라이언트**: Axios

---

## 🎯 주요 기능 요구사항

### 1. 네비게이션 바 (계층적 메뉴)
```
📁 릴리즈 버전 관리
  ├─ 표준 릴리즈
  └─ 커스텀 릴리즈

📁 패치본 관리
  ├─ 누적 패치 생성
  ├─ 생성 이력 조회
  └─ 누적 패치 다운로드

📁 기타
  ├─ 백업 스크립트 다운로드
  └─ 복구 스크립트 다운로드
```

### 2. 릴리즈 버전 트리
- 계층 구조: `1.0.x (그룹)` > `1.0.0, 1.0.1, ... (노드)`
- 노드 클릭 시 상세 정보 표시
- 데이터베이스별 파일 목록 표시

### 3. 테마 선택 기능
- 라이트/다크 모드 전환
- shadcn/ui 테마 시스템 활용

---

## 🗂️ FSD 디렉토리 구조

```
src/
├─ app/                          # 앱 초기화 및 설정
│  ├─ providers/                 # 컨텍스트 제공자
│  │  ├─ QueryProvider.tsx       # TanStack Query
│  │  ├─ ThemeProvider.tsx       # 테마
│  │  └─ RouterProvider.tsx      # 라우터
│  ├─ styles/                    # 글로벌 스타일
│  │  └─ globals.css
│  └─ App.tsx
│
├─ pages/                        # 페이지 레이어
│  ├─ releases/                  # 릴리즈 버전 관리
│  │  ├─ standard/               # 표준 릴리즈
│  │  └─ custom/                 # 커스텀 릴리즈
│  ├─ patches/                   # 패치 관리
│  │  ├─ generate/               # 누적 패치 생성
│  │  ├─ history/                # 생성 이력
│  │  └─ download/               # 다운로드
│  └─ scripts/                   # 스크립트
│     ├─ backup/
│     └─ restore/
│
├─ widgets/                      # 복합 UI 블록
│  ├─ navigation/                # 네비게이션 바
│  │  ├─ ui/
│  │  │  ├─ NavigationBar.tsx
│  │  │  └─ NavigationMenu.tsx
│  │  └─ model/
│  │     └─ menuItems.ts
│  ├─ release-tree/              # 릴리즈 버전 트리
│  │  ├─ ui/
│  │  │  ├─ ReleaseTree.tsx
│  │  │  ├─ TreeNode.tsx
│  │  │  └─ TreeGroup.tsx
│  │  └─ model/
│  │     └─ useReleaseTree.ts
│  └─ theme-toggle/              # 테마 전환
│     └─ ui/
│        └─ ThemeToggle.tsx
│
├─ features/                     # 사용자 인터랙션
│  ├─ release-version/
│  │  ├─ create/                 # 버전 생성
│  │  ├─ update/                 # 버전 수정
│  │  └─ delete/                 # 버전 삭제
│  ├─ cumulative-patch/
│  │  ├─ generate/               # 패치 생성
│  │  └─ download/               # 패치 다운로드
│  └─ release-file/
│     ├─ upload/                 # 파일 업로드
│     └─ download/               # 파일 다운로드
│
├─ entities/                     # 비즈니스 엔티티
│  ├─ release-version/
│  │  ├─ api/
│  │  │  └─ releaseVersionApi.ts
│  │  ├─ model/
│  │  │  └─ types.ts
│  │  └─ ui/
│  │     ├─ ReleaseVersionCard.tsx
│  │     └─ ReleaseVersionDetail.tsx
│  ├─ cumulative-patch/
│  │  ├─ api/
│  │  │  └─ cumulativePatchApi.ts
│  │  ├─ model/
│  │  │  └─ types.ts
│  │  └─ ui/
│  │     └─ PatchHistoryItem.tsx
│  └─ release-file/
│     ├─ api/
│     │  └─ releaseFileApi.ts
│     ├─ model/
│     │  └─ types.ts
│     └─ ui/
│        └─ FileListItem.tsx
│
├─ shared/                       # 공유 리소스
│  ├─ api/
│  │  ├─ client.ts               # Axios 인스턴스
│  │  └─ types.ts                # 공통 API 타입
│  ├─ ui/                        # shadcn/ui 컴포넌트
│  │  ├─ button.tsx
│  │  ├─ card.tsx
│  │  ├─ dialog.tsx
│  │  ├─ dropdown-menu.tsx
│  │  ├─ navigation-menu.tsx
│  │  ├─ tree.tsx
│  │  └─ ...
│  ├─ lib/
│  │  └─ utils.ts                # 유틸리티 함수
│  └─ config/
│     └─ constants.ts            # 상수
│
└─ main.tsx                      # 엔트리 포인트
```

---

## 🔌 백엔드 API 엔드포인트

### ReleaseVersion API (`/api/v1/releases`)

#### 조회
- `GET /standard/tree` - 표준 릴리즈 트리
- `GET /custom/{customerCode}/tree` - 커스텀 릴리즈 트리
- `GET /{type}/versions` - 타입별 버전 목록
- `GET /versions/{id}` - 버전 상세

#### 생성/수정/삭제
- `POST /standard/versions` - 표준 버전 생성
- `POST /standard/versions/batch` - 파일과 함께 일괄 생성
- `POST /custom/versions` - 커스텀 버전 생성
- `PUT /versions/{id}` - 버전 수정
- `DELETE /versions/{id}` - 버전 삭제

### CumulativePatch API (`/api/patch-histories`)
- `POST /generate` - 누적 패치 생성
- `GET /` - 누적 패치 목록
- `GET /{id}` - 누적 패치 상세

### ReleaseFile API (`/api/v1/releases`)
- `GET /versions/{versionId}/files` - 버전별 파일 목록
- `GET /files/{fileId}` - 파일 상세
- `GET /files/{fileId}/download` - 파일 다운로드
- `POST /versions/{versionId}/files/upload` - 파일 업로드
- `PUT /files/{fileId}` - 파일 수정
- `DELETE /files/{fileId}` - 파일 삭제

---

## 📦 주요 타입 정의

### ReleaseVersion 트리 구조
```typescript
interface TreeResponse {
  releaseType: 'STANDARD' | 'CUSTOM';
  customerCode?: string;
  majorMinorGroups: MajorMinorNode[];
}

interface MajorMinorNode {
  majorMinor: string;        // "1.0.x"
  versions: VersionNode[];
}

interface VersionNode {
  versionId: number;
  version: string;           // "1.0.0"
  createdAt: string;
  createdBy: string;
  comment: string;
  isInstall: boolean;
  databases: DatabaseNode[];
}

interface DatabaseNode {
  databaseType: 'MARIADB' | 'CRATEDB';
  files: string[];
}
```

### CumulativePatch
```typescript
interface CumulativePatchDetail {
  cumulativePatchId: number;
  releaseType: string;
  customerCode?: string;
  fromVersion: string;
  toVersion: string;
  patchName: string;
  outputPath: string;
  generatedAt: string;
  generatedBy: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  errorMessage?: string;
}
```

---

## 🚀 구현 단계

### Phase 1: 프로젝트 초기화 ✅
- [x] 백엔드 API 분석
- [x] 프로젝트 계획 수립
- [ ] Vite + React + TypeScript 프로젝트 생성
- [ ] 필수 라이브러리 설치
- [ ] FSD 디렉토리 구조 생성
- [ ] shadcn/ui 설정
- [ ] Tailwind CSS 설정

### Phase 2: 공유 레이어 구성
- [ ] Axios 클라이언트 설정
- [ ] API Response 타입 정의
- [ ] shadcn/ui 기본 컴포넌트 설치
  - button, card, dialog, dropdown-menu
  - navigation-menu, tree, input
  - select, toast, table
- [ ] 테마 시스템 구성

### Phase 3: Entities 레이어
- [ ] ReleaseVersion 엔티티
  - API 함수 작성
  - 타입 정의
  - UI 컴포넌트
- [ ] CumulativePatch 엔티티
  - API 함수 작성
  - 타입 정의
  - UI 컴포넌트
- [ ] ReleaseFile 엔티티
  - API 함수 작성
  - 타입 정의
  - UI 컴포넌트

### Phase 4: Widgets 레이어
- [ ] NavigationBar 위젯
  - 계층적 메뉴 구성
  - 라우팅 연결
- [ ] ReleaseTree 위젯
  - 트리 구조 렌더링
  - 노드 선택 핸들링
  - 상세 정보 표시
- [ ] ThemeToggle 위젯
  - 라이트/다크 모드 전환

### Phase 5: Features 레이어
- [ ] 릴리즈 버전 CRUD
  - 생성 폼
  - 수정 폼
  - 삭제 확인
- [ ] 누적 패치 생성
  - 버전 범위 선택
  - 생성 폼
- [ ] 파일 업로드/다운로드
  - 파일 선택
  - 업로드 진행률
  - 다운로드 트리거

### Phase 6: Pages 레이어
- [ ] 릴리즈 버전 관리 페이지
  - 표준 릴리즈
  - 커스텀 릴리즈
- [ ] 패치 관리 페이지
  - 누적 패치 생성
  - 생성 이력
  - 다운로드
- [ ] 스크립트 페이지
  - 백업/복구 스크립트

### Phase 7: 통합 및 테스트
- [ ] 라우팅 설정
- [ ] 에러 핸들링
- [ ] 로딩 상태 관리
- [ ] 반응형 디자인 검증
- [ ] 크로스 브라우저 테스트

---

## 📝 개발 규칙

### 코드 스타일
- TypeScript strict 모드 사용
- ESLint + Prettier 설정
- 컴포넌트명: PascalCase
- 파일명: kebab-case (UI), camelCase (로직)

### 컴포넌트 작성
- 함수형 컴포넌트 사용
- Props 타입 명시
- UI/로직 분리 (커스텀 훅 활용)

### API 통신
- TanStack Query 사용
- 에러 핸들링 표준화
- 로딩 상태 통합 관리

### 스타일링
- Tailwind CSS 유틸리티 우선
- shadcn/ui 컴포넌트 커스터마이징
- CSS 변수로 테마 관리

---

## 🎨 UI/UX 가이드

### 컬러 스키마
- Primary: Blue (릴리즈 버전 관리)
- Secondary: Green (패치 관리)
- Accent: Purple (기타)
- 테마별 색상 변수 사용

### 레이아웃
- 네비게이션: 상단 고정
- 사이드바: 릴리즈 트리 (왼쪽, 접기 가능)
- 메인 컨텐츠: 중앙
- 반응형: 모바일에서 사이드바 오버레이

### 인터랙션
- 트리 노드 클릭: 상세 정보 표시
- 호버: 툴팁 표시
- 로딩: 스켈레톤 UI
- 에러: Toast 알림

---

## ⚙️ 환경 설정

### 개발 환경변수 (.env.development)
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=Release Manager
```

### 프로덕션 환경변수 (.env.production)
```env
VITE_API_BASE_URL=https://api.release-manager.com
VITE_APP_TITLE=Release Manager
```

---

## 🔍 다음 단계

1. **프로젝트 초기화**
   - Vite 프로젝트 생성
   - 필수 패키지 설치
   - 디렉토리 구조 생성

2. **기본 설정**
   - TypeScript 설정
   - Tailwind CSS 설정
   - shadcn/ui 초기화

3. **개발 시작**
   - Shared 레이어부터 순차적 구현
   - 각 레이어별 테스트 작성
   - 문서화 병행

---

**작성일**: 2025-11-24
**버전**: 1.0.0
