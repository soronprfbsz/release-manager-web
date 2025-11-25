# Release Manager Web

릴리즈 버전 관리 시스템의 웹 프론트엔드 애플리케이션

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

- ✅ 릴리즈 버전 관리 (표준/커스텀)
- ✅ 릴리즈 버전 트리 구조
- ✅ 누적 패치 생성 및 관리
- ✅ 파일 업로드/다운로드
- ✅ 테마 전환 (라이트/다크 모드)

## 개발 참고사항

### npm 이슈

이 프로젝트는 npm의 optional dependencies 버그로 인해 **yarn**을 사용합니다.
npm 대신 yarn을 사용해주세요.

### 환경 변수

- `.env.development`: 개발 환경 설정
- `.env.production`: 프로덕션 환경 설정

## 문서

상세한 프로젝트 계획은 `claudedocs/project-plan.md`를 참고하세요.

## 라이선스

Private
