# Release Manager Web

버전 관리 시스템의 웹 프론트엔드 애플리케이션

## 기술 스택

- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite 5
- **아키텍처**: FSD (Feature-Sliced Design)
- **UI 컴포넌트**: shadcn/ui + Tailwind CSS
- **상태 관리**: TanStack Query (React Query)
- **라우팅**: React Router v6
- **HTTP 클라이언트**: Axios

## 시작하기

### 필수 요구사항

- Node.js 22+
- Yarn 1.22+

### 설치

```bash
yarn install
```

### 개발 서버 실행

```bash
yarn dev
```

개발 서버가 http://localhost:3000 에서 실행됩니다.

### 빌드

```bash
yarn build
```

### 프리뷰

```bash
yarn preview
```

## 프로젝트 구조

FSD (Feature-Sliced Design) 아키텍처를 따릅니다:

```
src/
├─ app/              # 앱 초기화 및 프로바이더
├─ pages/            # 페이지 컴포넌트
├─ widgets/          # 복합 UI 블록
├─ features/         # 사용자 인터랙션 기능
├─ entities/         # 비즈니스 엔티티
└─ shared/           # 공유 리소스 (UI, API, utils)
```

## 주요 기능

- ✅ 버전 관리 (표준/커스텀)
- ✅ 릴리즈 버전 트리 구조
- ✅ 패치 생성 및 관리
- ✅ 파일 업로드/다운로드
- ✅ 테마 전환

## 개발 참고사항

### 환경 변수

- env.example 파일을 수정하여 .env 파일을 생성하여 사용