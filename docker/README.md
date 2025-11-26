# Release Manager Web - Docker Setup

## 파일 구조

```
release-manager-web/
├── .gitlab-ci.yml         # GitLab CI/CD 파이프라인
├── .dockerignore          # Docker 빌드 컨텍스트 제외 파일
└── docker/
    ├── Dockerfile         # 프로덕션 빌드용 Dockerfile
    ├── Dockerfile.ci      # CI/CD 최적화 Dockerfile
    ├── docker-compose.yml # Docker Compose 설정
    ├── nginx.conf         # Nginx 설정 파일
    └── README.md          # 이 문서
```

## Dockerfile 구분

### docker/Dockerfile
- **용도**: 로컬 개발 및 프로덕션 배포
- **특징**: 표준 멀티스테이지 빌드

### docker/Dockerfile.ci
- **용도**: GitLab CI/CD 파이프라인
- **특징**: 
  - 레이어 캐싱 최적화
  - `--prefer-offline --no-audit` 플래그로 빌드 속도 향상
  - 헬스체크 포함

## 주요 기능

### Nginx 설정
- **SPA 라우팅**: 모든 경로를 `index.html`로 리다이렉트
- **Gzip 압축**: 텍스트 기반 파일 압축으로 전송 속도 향상
- **보안 헤더**: XSS, Clickjacking 방지
- **정적 자산 캐싱**: JS/CSS/이미지 1년 캐시
- **헬스체크**: `/health` 엔드포인트

## 사용 방법

### 로컬 개발
```bash
# docker 디렉토리로 이동
cd docker

# Docker Compose로 실행
docker-compose up -d

# 접속
http://localhost:3000

# 중지
docker-compose down
```

### 프로덕션 빌드
```bash
# 프로젝트 루트에서 실행
docker build -f docker/Dockerfile -t release-manager-web:latest .

# 컨테이너 실행
docker run -p 80:80 release-manager-web:latest
```

### CI 빌드 (GitLab CI에서 자동 실행)
```bash
# CI용 Dockerfile 사용
docker build -f docker/Dockerfile.ci -t release-manager-web:ci .
```

### GitLab CI/CD 환경 변수 설정

GitLab 프로젝트 Settings > CI/CD > Variables에 다음 변수를 추가하세요:

#### Docker Registry
- `CI_REGISTRY`: GitLab Container Registry URL
- `CI_REGISTRY_USER`: Registry 사용자명
- `CI_REGISTRY_PASSWORD`: Registry 비밀번호

#### Staging 환경
- `STAGING_SERVER`: Staging 서버 호스트
- `STAGING_USER`: SSH 사용자명
- `SSH_PRIVATE_KEY`: SSH 개인키

#### Production 환경
- `PRODUCTION_SERVER`: Production 서버 호스트
- `PRODUCTION_USER`: SSH 사용자명

## 배포 프로세스

1. **개발 브랜치 (`develop`)**: 
   - 빌드 및 테스트 자동 실행
   - Staging 배포는 수동 트리거

2. **메인 브랜치 (`main`)**: 
   - 빌드, 테스트, Docker 이미지 빌드 자동 실행
   - Production 배포는 수동 트리거

3. **태그**: 
   - 버전 태그 생성 시 자동 빌드
   - Production 배포 가능

## 커스터마이징

### API 프록시 설정
백엔드 API를 프록시하려면 `docker/nginx.conf`의 주석 처리된 부분을 활성화:

```nginx
location /api {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
```

### 환경 변수
런타임 환경 변수가 필요한 경우 `docker-compose.yml`에 추가:

```yaml
environment:
  - VITE_API_URL=http://api.example.com
```
