# Release Manager Web - Docker Setup

## 파일 구조

```
release-manager-web/
├── .github/workflows/deploy.yml  # GitHub Actions 빌드·배포 워크플로
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
- **용도**: GitHub Actions 배포 워크플로 (`.github/workflows/deploy.yml`)
- **특징**: 
  - 워크플로에서 먼저 빌드한 `dist/` 를 복사만 함 (이미지 안에서 node 빌드 없음)
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

**프로젝트 루트에서 실행하세요.**

```bash
# 시작
docker compose -f docker/docker-compose.yml --env-file .env up -d

# 로그
docker compose -f docker/docker-compose.yml logs -f web

# 접속
http://localhost:3000

# 중지
docker compose -f docker/docker-compose.yml down
```

### 프로덕션 빌드
```bash
# 프로젝트 루트에서 실행
docker build -f docker/Dockerfile -t release-manager-web:latest .

# 컨테이너 실행
docker run -p 80:80 release-manager-web:latest
```

### CI 빌드 (GitHub Actions에서 자동 실행)
```bash
# CI용 Dockerfile 사용
docker build -f docker/Dockerfile.ci -t release-manager-web:ci .
```

### CI/CD 설정값

- 웹은 **GitHub Secrets 가 필요 없다.** 설정값(`SERVER_PORT`, `API_SERVER_URL`, 이미지 이름)은 모두
  `.github/workflows/deploy.yml` 상단 `env:` 에서 관리한다.

## 배포 프로세스

`main` 브랜치에 push 하면 배포 서버의 self-hosted runner(label `rm-106`)에서 자동 실행된다
(Actions 탭 → Deploy → Run workflow 로 수동 실행도 가능). `tscorp-dev2` 조직 저장소에서만 실행된다.

1. **Build dist**: `yarn install --frozen-lockfile && yarn build`
2. **Build image**: `docker/Dockerfile.ci` 로 `ts/release-manager-web:latest` 빌드 (label `git-sha`=커밋)
3. **Deploy web**: web 컨테이너 교체
4. **Health check**: `/health` 확인

API 와 함께 배포할 때는 **web → api 순서**로 push 한다.

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

## 🐛 문제 해결

### 환경 변수 경고

**증상**: 환경 변수 관련 경고 또는 오류

**해결**: `--env-file .env` 옵션 추가
```bash
# ✅ 올바름
docker compose -f docker/docker-compose.yml --env-file .env up -d

# ❌ 오류 (env-file 없음)
docker compose -f docker/docker-compose.yml up -d
```

### 컨테이너 시작 실패

```bash
# 로그 확인
docker compose -f docker/docker-compose.yml logs --tail 100 web

# 강제 재생성
docker compose -f docker/docker-compose.yml --env-file .env up -d --force-recreate
```
