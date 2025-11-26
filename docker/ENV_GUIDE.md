# 환경 변수 설정 가이드

## 개요
프론트엔드 애플리케이션은 백엔드 API 주소를 환경 변수로 관리합니다.

## 환경 변수 목록

### VITE_API_BASE_URL
- **설명**: 백엔드 API 서버 주소
- **형식**: `http://host:port` 또는 `https://domain.com`
- **예시**: 
  - 로컬: `http://localhost:8080`
  - 개발: `http://dev-api.example.com`
  - 프로덕션: `https://api.example.com`

### VITE_APP_TITLE
- **설명**: 애플리케이션 제목
- **기본값**: `Release Manager`

## 사용 방법

### 1. 로컬 개발
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 수정
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=Release Manager

# 개발 서버 실행
npm run dev
```

### 2. Docker Compose
```bash
# docker/.env 파일 생성
cd docker
cp ../.env.example .env

# .env 파일 수정
VITE_API_BASE_URL=http://backend:8080
WEB_PORT=3000

# 실행
docker-compose up -d
```

### 3. GitLab CI/CD
GitLab 프로젝트 Settings > CI/CD > Variables에 다음 변수 추가:

- `VITE_API_BASE_URL`: 백엔드 API URL
- `VITE_APP_TITLE`: 애플리케이션 제목 (선택)
- `WEB_PORT`: 웹 서버 포트 (기본: 3000)

## 빌드 시점 vs 런타임

### 빌드 시점 (Build-time)
Vite는 빌드 시점에 환경 변수를 번들에 포함시킵니다.
- Docker 이미지 빌드 시 `--build-arg`로 전달
- 이미지에 하드코딩됨

### 런타임 (Runtime)
nginx는 정적 파일만 서빙하므로 런타임 환경 변수 변경 불가.
환경별로 다른 이미지를 빌드해야 합니다.

## 환경별 설정 예시

### 개발 환경
```env
VITE_API_BASE_URL=http://dev-backend:8080
VITE_APP_TITLE=Release Manager (Dev)
```

### 스테이징 환경
```env
VITE_API_BASE_URL=http://staging-backend:8080
VITE_APP_TITLE=Release Manager (Staging)
```

### 프로덕션 환경
```env
VITE_API_BASE_URL=https://api.production.com
VITE_APP_TITLE=Release Manager
```

## 주의사항

1. **보안**: `.env` 파일은 절대 Git에 커밋하지 마세요
2. **VITE_ 접두사**: Vite는 `VITE_`로 시작하는 변수만 클라이언트에 노출
3. **빌드 시점**: 환경 변수는 빌드 시점에 결정되므로 환경별로 이미지 재빌드 필요
