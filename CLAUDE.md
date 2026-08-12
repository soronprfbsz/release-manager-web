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
`/ws` 도 같은 타겟으로 프록시된다 (WebSocket 알림 / 터미널).

---

## 작업 원칙

화면을 만들거나 고칠 때 **아래 두 가이드를 반드시 따른다.** 새 방식을 만들기 전에
기존 화면이 어떻게 하고 있는지부터 확인한다 — 통일성이 개별 최적화보다 우선이다.

1. **FSD 레이어 규칙 준수** — 의존 방향은 `app → pages → widgets → features → entities → shared`
   단방향이며, 같은 레이어의 다른 슬라이스를 import 하지 않는다. 슬라이스 외부에서는
   내부 파일이 아니라 `index.ts`(Public API)만 가져다 쓴다.
2. **공용 컴포넌트 우선** — `shared/ui/` 에 있으면 그것을 쓴다. 없을 때만 새로 만들되,
   **두 번 이상 쓰이거나 재사용 가능성이 있다고 판단되면 `shared/ui/` 에 공용 컴포넌트로
   만들어 사용한다.** 같은 UI 를 두 번째 복사하려는 순간이 공용화 시점이다.
3. **화면 일관성** — 레이아웃 골격, 아이콘 위치/크기, 폰트 크기, 영역별 표시 처리는
   `UI_GUIDE.md` 규격을 따른다. 임의 색상·뷰포트 매직 넘버를 쓰지 않는다.

아래 두 문서는 이 파일에 import 되어 함께 로드된다.
(로드되지 않았다면 `release-manager-web/.claude/` 에서 직접 읽을 것)

@.claude/FSD_GUIDE.md
@.claude/UI_GUIDE.md

---

## 자주 틀리는 것

실제로 사고가 났던 항목이다. 코드를 짜기 전에 확인한다.

| 항목 | 올바른 것 |
|---|---|
| 토스트 import | `@/shared/lib/hooks/use-toast` (`@/shared/hooks/...` 아님) |
| 테이블 | `DataTable autoHeight` — `visibleRows` 는 쓰지 않는다 |
| 스크롤 테이블 | Radix `ScrollArea` 안에 `<Table>` 금지 (sticky 헤더가 행과 겹침) |
| 페이지 주요 액션 | `PageLayout actions` 에 **아이콘 + Tooltip** (텍스트 버튼 아님) |
| 삭제 | 반드시 `AlertDialog` 확인을 거친다 |
| import 순서 | eslint `import/order` 를 지킨다 — `npx eslint --fix <파일>` 로 정리 |

## 검증

작업 종료 전 **반드시** 통과시킨다.

```bash
npm run type-check && npm run lint && npm run build
```

화면 동작 확인은 dev proxy 가 운영 API 를 가리키는 경우가 많아 로그인이 막힐 수 있다.
그때는 정적 검증(타입·린트·빌드)까지 마친 뒤, 확인하지 못한 범위를 명시적으로 보고한다.

## API 연동

- 백엔드 응답은 `ApiResponse<T>` 로 감싸져 오고 `apiClient` 가 `data` 를 벗겨서 반환한다.
- 페이징 응답은 `PageResponse<T>` (`content` / `totalElements` / `totalPages` …).
- access token 은 **in-memory** 보관(15분 만료), refresh 는 인터셉터가 처리한다.
  → `localStorage` 에 토큰을 저장하지 않는다.
- API 변경이 필요하면 백엔드 담당에게 스펙을 먼저 확인한다 (루트 `CLAUDE.md` 공통 규칙).
