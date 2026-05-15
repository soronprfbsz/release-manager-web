# CLAUDE.md — release-manager-web

> React 19 + TypeScript + Vite 5. **WSL2 (Ubuntu) 셸에서 실행한다.**
> Windows PowerShell 에서는 vite shim (`vite.cmd`) 이 누락되어 실패한다.

## 명령

```bash
npm install          # 첫 셋업 / deps 갱신 시
npm run dev          # 개발 서버 (포트는 .env 의 SERVER_PORT, 기본 3001)
npm run type-check   # 타입 체크 (tsc --noEmit)
npm run lint         # 린트 (eslint)
npm run build        # 빌드 (tsc -b + vite build)
npm run test         # E2E (Playwright)
```

`.env` 의 `VITE_API_SERVER_URL` 이 vite dev proxy 의 `/api` 타겟이다.
로컬 검증 시 `http://localhost:8081`, 운영 서버 테스트 시 운영 URL.
