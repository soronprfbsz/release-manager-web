# Sidebar Collapse / Expand — Design

- 작성일: 2026-05-15
- 작성자: Claude + jhlee
- 적용 범위: `release-manager-web` 의 사이드바 위젯 + `MainLayout` topbar
- 영향 테마: 다크 / 라이트 양쪽 (토큰 기반이라 추가 작업 없음)

## 1. 배경

현재 `MainLayout` 은 좌측 256px 고정폭 사이드바 + 우측 메인 콘텐츠 (header + main) 구조다. 사이드바를 collapse 할 방법이 없어 작은 노트북 화면이나 깊은 데이터 분석 페이지에서 메인 콘텐츠가 가용 폭에 압박을 받는다. 모바일 (`<768px`) 에서는 사이드바 256px 가 화면의 1/3 이상을 차지해 사용성이 떨어진다.

모던 SaaS (Linear, Vercel new dashboard, shadcn/ui sidebar, Ant Design Sider) 가 공통적으로 채택한 **collapsed icon-only + hover popout + 모바일 drawer overlay** 패턴을 적용한다.

## 2. 목표

1. 데스크탑에서 사이드바를 256px ↔ 64px collapse / expand 토글 가능.
2. Collapsed 상태에서도 1depth 아이콘 hover 시 2/3depth 자식 메뉴를 floating popout 으로 즉시 탐색 가능 (사이드바 폭은 64px 유지).
3. Collapse 상태를 새로고침해도 유지 (`localStorage` persist).
4. 키보드 단축키 `Ctrl+B` / `Cmd+B` 로 토글.
5. 모바일 (`<768px`) 에서는 drawer overlay 로 자동 전환 — collapse 모드 대신 hamburger 토글 + drawer.
6. 다크 / 라이트 양쪽 테마에서 동일하게 동작.

## 3. 비목표 (Out of Scope)

- ❌ Swipe gesture (모바일 가장자리 드래그로 drawer 열기) — 후속 spec
- ❌ Popout pin-to-open (popout 클릭으로 popout 고정) — 후속 spec
- ❌ 사용자 width preference (drag-to-resize)
- ❌ Cascading popouts (popout 안에서 더 깊은 hover 시 또 다른 popout)
- ❌ 사이드바 컬러 / 테마 토큰 변경 (직전 라이트 테마 작업은 원복되었음)
- ❌ 메뉴 데이터 구조 변경 (`useMenus` 그대로 활용)

## 4. 디자인 결정

### 4.1 상태 모델

새 store `useSidebarStore` (Zustand + devtools + persist, 기존 `useThemeStore` 와 동일 패턴):

```ts
interface SidebarState {
  /** 데스크탑 사이드바 collapse 여부 — localStorage persist */
  desktopCollapsed: boolean
  /** 모바일 drawer 열림 여부 — 휘발성 (persist 안 함) */
  mobileOpen: boolean

  toggleDesktop: () => void
  setDesktop: (value: boolean) => void
  toggleMobile: () => void
  setMobile: (value: boolean) => void
  closeMobile: () => void  // route 변경 시 호출
}
```

- `persist` middleware 의 `partialize` 로 `desktopCollapsed` 만 직렬화.
- 초기값: `desktopCollapsed: false`, `mobileOpen: false`.
- LocalStorage 키: `sidebar-store` (기존 store naming 컨벤션 — `theme-store` 와 동일 형식).

### 4.2 반응형 hook

새 hook `useIsMobile()`:

```ts
function useIsMobile(): boolean {
  // window.matchMedia('(max-width: 767px)') — Tailwind md 기준
  // mount 시 subscribe, change 이벤트로 reactive
}
```

SSR 우려는 없음 (Vite SPA, 클라이언트 only). 첫 렌더에서 `window` 안전 사용.

### 4.3 컴포넌트 구조

```
Sidebar (wrapper, ~30 lines)
  ├─ useIsMobile() 분기
  ├─ if mobile  → <MobileSidebar />
  └─ else       → <DesktopSidebar />
```

#### DesktopSidebar
- 폭: `desktopCollapsed ? 64px : 256px`, transition `width 200ms ease-out`
- 구성: 로고 영역(`h-16`) + 메뉴 nav(`flex-1`) + 사용자 영역(`border-t`)
- collapsed: 로고는 R 아이콘만 노출 (텍스트 숨김), 사용자 영역은 아바타만 (DropdownMenu 트리거)

#### MobileSidebar
- `<Sheet>` (shadcn) 사용. `mobileOpen` 으로 open 제어.
- `side="left"`, 폭 `w-72` (288px) — drawer 표준
- 내부 내용은 DesktopSidebar 의 expanded 형태와 동일
- Route 변경 감지 → `closeMobile()` 자동 호출 (`useLocation` watcher)

#### SidebarMenuItem (재귀)
- 양쪽 (Desktop expanded, Desktop collapsed, Mobile) 에서 공용
- prop: `item`, `depth`, `currentPath`, `opens`, `onToggle`, **`variant: 'inline' | 'collapsed-popout'`**
- `variant='inline'`: 현재 `Sidebar.tsx` 의 동작 그대로 (depth indent + 자식 inline)
- `variant='collapsed-popout'`: 1depth 만 아이콘 + tooltip + Popover. Popover content 안에서 자식들은 다시 `variant='inline'` 으로 렌더 (재귀 자기 자신 사용)
- depth ≥ 1 은 inline 만 — popout 외부에서는 호출되지 않음

#### SidebarTrigger
- 위치: `MainLayout` 의 `<header>` 좌측, breadcrumb 앞
- Desktop: 아이콘은 `PanelLeftClose` (expanded 일 때) / `PanelLeftOpen` (collapsed 일 때)
- Mobile: 아이콘은 `Menu` (hamburger) — `useIsMobile` 로 분기
- 클릭: 데스크탑이면 `toggleDesktop()`, 모바일이면 `toggleMobile()`
- shadcn `Button` variant=ghost size=icon 사용
- aria-label: "사이드바 토글"

### 4.4 hover popout 동작 (Desktop collapsed only)

Radix `Popover` 사용 (이미 프로젝트에 있는 Tooltip / Dropdown 과 같은 Radix 패턴 채택).

- **Trigger**: 1depth 아이콘 버튼 (자식이 있는 경우만 popout, 자식 없는 leaf 는 단순 Link + tooltip)
- **Open 조건**: `onMouseEnter` 후 100ms delay (불필요한 popup 방지)
- **Close 조건**:
  - Trigger 또는 PopoverContent 의 `onMouseLeave` 후 150ms grace period (cursor 가 Trigger → PopoverContent 로 이동할 시간)
  - PopoverContent 안에서 메뉴 항목 클릭 → 라우트 이동 후 자동 close
  - ESC 키 → close
- **Placement**: `side="right"`, `align="start"`, `sideOffset={8}`
- **Width**: 자식 메뉴 라벨에 자연스러운 너비 (auto), `max-w-xs` 정도로 제한
- **PopoverContent 안의 메뉴**: `SidebarMenuItem variant='inline'` 으로 자식 트리 렌더. 헤더에는 1depth 메뉴의 라벨을 강조 표시.

### 4.5 Tooltip (Desktop collapsed, leaf 메뉴 한정)

자식이 없는 leaf 메뉴 (예: "패치 관리") 는 popout 대신 단순 Tooltip 으로 라벨만 표시. shadcn `Tooltip` 사용. `side="right"`, `sideOffset={8}`. open delay 500ms (Radix 기본).

### 4.6 active state 처리

| 상태 | 1depth | 자식 |
|---|---|---|
| Desktop expanded | 현재 path 가 leaf 와 직접 매칭 → active bg + brand fg. 부모는 자식이 active 면 텍스트 색만 진하게 (`text-foreground`) | 깊이별 inline indent + active bg |
| Desktop collapsed | 현재 path 가 그 분기의 어떤 자식이든 매칭 → 아이콘 box 에 active bg + brand fg. Popout 닫혀있어도 시각적 인지 가능 | 해당 없음 (popout 안에서만 표시) |
| Desktop collapsed + popout 열림 | 동일 (아이콘 active 유지) | popout 안에서 path 매칭으로 자식 active |
| Mobile drawer | Desktop expanded 와 동일 | 동일 |

기존 `isPathActive` / `hasActiveDescendant` 헬퍼를 그대로 사용. 차이는 collapsed 상태에서 leaf 가 아닌 분기도 "자손에 active 가 있으면 아이콘 자체를 active 로 표시" 한다는 점 — `hasActiveDescendant` 가 이미 그 로직을 제공.

### 4.7 키보드 단축키

`MainLayout` 또는 별도 hook (`useSidebarShortcut`) 에서 `document` keydown listener 등록:

- Win/Linux: `Ctrl+B` (또는 `Ctrl+\`)
- Mac: `Cmd+B`
- 데스크탑 → `toggleDesktop()`
- 모바일 → `toggleMobile()` (선택 — 모바일은 보통 키보드 단축키 무의미. 단축키 자체는 무해)
- IME composition 중에는 무시 (`event.isComposing`)
- `<input>` / `<textarea>` 포커스 중에도 동작? — **Yes**, 일관성을 위해 (VS Code 도 같음). 단 modifier key 가 있으므로 일반 텍스트 입력 방해 없음.

### 4.8 애니메이션

- DesktopSidebar width: `transition-[width] duration-200 ease-out`
- DesktopSidebar 내부 라벨 (메뉴 텍스트, 로고 텍스트): `transition-opacity duration-150 ease-out`. collapsed 일 때 `opacity-0 pointer-events-none w-0 overflow-hidden`. 라벨 fade 가 width transition 직후 살짝 늦게 보이도록 별도 transition.
- Popover: Radix 기본 (`data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 ...`).
- Sheet (모바일): shadcn 기본.

### 4.9 라우트 변경 시 모바일 drawer 자동 close

`MobileSidebar` 내부에서 `useLocation` 을 watch 하고, pathname 변경 시 `closeMobile()` 호출. (또는 store 에서 처리할 수도 있지만 컴포넌트 라이프사이클과 묶는 게 자연스러움.)

### 4.10 적절한 z-index / overlay

- Sheet 는 shadcn 기본 z-index (50) 사용. backdrop 도 shadcn 기본.
- Popover 역시 Radix 기본 z-index.
- DesktopSidebar 는 일반 흐름 (z 0).

## 5. 파일 구조

| 파일 | 라인 추정 | 책임 |
|---|---|---|
| `src/shared/store/useSidebarStore.ts` | ~60 | Zustand store. `useThemeStore` 패턴. |
| `src/shared/store/index.ts` | +1 export | re-export 추가 |
| `src/shared/hooks/useIsMobile.ts` | ~30 | matchMedia reactive hook |
| `src/widgets/_shared/sidebar/ui/Sidebar.tsx` | ~25 (현재 290) | wrapper — useIsMobile() 분기 |
| `src/widgets/_shared/sidebar/ui/DesktopSidebar.tsx` | ~140 (신규) | desktop 사이드바 본체 |
| `src/widgets/_shared/sidebar/ui/MobileSidebar.tsx` | ~80 (신규) | 모바일 Sheet drawer |
| `src/widgets/_shared/sidebar/ui/SidebarMenuItem.tsx` | ~150 (신규) | 재귀 메뉴 아이템 — variant='inline' \| 'collapsed-popout' |
| `src/widgets/_shared/sidebar/ui/SidebarTrigger.tsx` | ~30 (신규) | topbar 토글 버튼 |
| `src/widgets/_shared/sidebar/ui/useSidebarShortcut.ts` | ~25 (신규) | Ctrl+B 키보드 단축키 hook |
| `src/widgets/_shared/sidebar/index.ts` | +exports | Sidebar + SidebarTrigger named export |
| `src/app/layouts/MainLayout.tsx` | +5 | `<header>` 좌측에 `<SidebarTrigger />` 추가, `useSidebarShortcut()` 호출 |

기존 `Sidebar.tsx` (290 줄) 는 너무 많은 책임을 짊어지고 있어 이번 작업에서 **분해 + 신규 collapse 기능** 을 함께 처리한다. 분해는 본 작업 목표 달성에 필요한 범위로 한정.

## 6. 데이터 흐름

```
useMenus (TanStack Query)
   ↓
Sidebar (wrapper)
   ├─ useIsMobile() = true  → MobileSidebar
   │                            └─ useLocation watcher → store.closeMobile()
   └─ useIsMobile() = false → DesktopSidebar
                                ├─ useSidebarStore.desktopCollapsed 구독
                                ├─ collapsed → SidebarMenuItem variant='collapsed-popout'
                                └─ expanded  → SidebarMenuItem variant='inline'

useSidebarShortcut() (MainLayout 에서 1회 호출)
   └─ document keydown → toggleDesktop / toggleMobile (useIsMobile 에 따라)

SidebarTrigger (MainLayout header 안)
   └─ 클릭 → toggleDesktop / toggleMobile
```

## 7. Edge cases

| 케이스 | 처리 |
|---|---|
| 데스크탑 collapsed 상태에서 화면 폭을 768px 미만으로 줄임 | `useIsMobile` 이 `true` 가 되어 `Sidebar` 가 `MobileSidebar` 로 전환. `desktopCollapsed` 는 보존 (다시 데스크탑 폭으로 키우면 collapsed 상태 복귀) |
| 모바일에서 drawer 열려있을 때 화면 폭을 768px 이상으로 키움 | `useIsMobile` 이 `false` 가 되어 `MobileSidebar` 가 unmount. `mobileOpen` 은 `true` 로 남지만 영향 없음 (Sheet 가 더 이상 렌더되지 않으므로). 다시 모바일 폭이 되면 drawer 가 열린 상태로 다시 나타남 — 위화감 줄이려면 `useIsMobile` false 전환 시 `closeMobile()` 호출 |
| 라우트 변경 (Link 클릭) | 모바일: 자동 `closeMobile()`. 데스크탑: 변화 없음 (사이드바는 항상 열림) |
| Popover 열린 상태에서 사용자가 사이드바를 expand 토글 | Popover 자동 close (Trigger 가 사라지지 않지만 `desktopCollapsed=false` 일 땐 popout variant 자체가 인라인으로 바뀌므로 Popover 가 unmount). 부작용 없음 |
| 자식이 있지만 자기 자신도 `path` 를 가진 메뉴 (예: "운영 관리" 가 `/operations` 로도 이동 가능한 경우) | 현재 `Sidebar.tsx` 에서 children 이 있으면 항상 button (toggle) 로만 렌더, 자기 자신 path 로 이동 불가. **이 동작 유지** — collapsed popout 안에서도 동일하게 children 만 렌더 |
| 모바일에서 한 번도 토글 안 한 사용자 | `mobileOpen=false` 가 초기값. 사이드바 자체가 안 보이고 topbar 의 hamburger 만 노출. 명시적으로 누르기 전엔 메뉴 없음 — 정상 |

## 8. 다크 / 라이트 호환

- 모든 색상은 기존 토큰 (`--sidebar-bg`, `--sidebar-fg`, `--sidebar-active-bg`, `--sidebar-active-fg`, `--sidebar-border`, `--sidebar-hover`) 사용.
- Popover content 는 `bg-popover text-popover-foreground border-border` 표준 shadcn 패턴.
- 추가 토큰 신규 정의 없음.

## 9. 검증 방법 (Success Criteria)

### 자동
- `npm run type-check` 통과
- `npm run lint` 새 에러 0건 (기존 pre-existing 에러 제외)
- `npm run build` 통과

### 시각 / 동작
- [ ] 데스크탑: 토글 버튼 클릭으로 256 ↔ 64px transition 정상
- [ ] 데스크탑: `Ctrl+B` (Mac: `Cmd+B`) 단축키 동작
- [ ] 데스크탑 collapsed: 1depth 자식 있는 아이콘 hover → 우측에 popout 정상 표시 + 자식 메뉴 라벨/아이콘 보임
- [ ] 데스크탑 collapsed: 1depth leaf 아이콘 hover → tooltip 으로 라벨만 표시
- [ ] 데스크탑 collapsed: 현재 페이지가 속한 분기의 1depth 아이콘에 active highlight
- [ ] 새로고침 후 데스크탑 collapsed 상태 복원
- [ ] 모바일 (브라우저 폭 < 768px): 사이드바 자체 숨김, topbar 의 hamburger 만 노출
- [ ] 모바일: hamburger 클릭 → Sheet drawer 좌측에서 슬라이드 인
- [ ] 모바일: drawer 의 메뉴 클릭 → 라우트 이동 + drawer 자동 close
- [ ] 다크 / 라이트 양쪽 테마에서 동일하게 동작
- [ ] 데스크탑 → 모바일 폭으로 줄였다가 다시 확장 시 정상 복원

### 회귀 체크
- [ ] 기존 expanded 사이드바의 모든 메뉴 동작 (트리 expand / 라우트 이동 / active 표시 / 사용자 영역 dropdown) 그대로
- [ ] MainLayout 의 다른 header 항목 (DynamicBreadcrumb, ProjectSelector, ThemeToggle) 위치 / 동작 보존
- [ ] 페이지 콘텐츠의 스크롤 동작 보존 (main 의 overflow-y-auto)

## 10. 롤백 전략

이번 작업은 신규 파일 6개 + 기존 파일 3개 (`Sidebar.tsx`, `MainLayout.tsx`, `src/shared/store/index.ts`) 수정. `git revert <merge SHA>` 또는 6개 커밋 reset 으로 단순 롤백 가능. 다른 기능과의 의존성 없음.
