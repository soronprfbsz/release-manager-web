# Sidebar Collapse / Expand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 데스크탑 사이드바 256↔64px collapse (hover popout 으로 2/3depth 탐색) + 모바일 (<768px) Sheet drawer 자동 전환 + `Ctrl+B` 단축키 + localStorage persist 를 구현한다.

**Architecture:** 새 Zustand store (`useSidebarStore`) + matchMedia hook (`useIsMobile`) 을 만들고, 기존 290-line `Sidebar.tsx` 를 wrapper / DesktopSidebar / MobileSidebar / SidebarMenuItem / SidebarTrigger / shortcut hook 으로 분해한다. shadcn Popover 로 collapsed hover popout, shadcn Sheet 로 모바일 drawer 처리. 토큰 기반 색상이라 다크/라이트 양쪽 자동 호환.

**Tech Stack:** React 19, TypeScript, Vite 5, Tailwind, shadcn-ui (Popover/Tooltip/Sheet/Button), Zustand (`devtools + persist`), React Router (`useLocation`), lucide-react (`PanelLeftClose` / `PanelLeftOpen` / `Menu`).

**Related spec:** `docs/superpowers/specs/2026-05-15-sidebar-collapse-expand-design.md`

---

## File Structure

### Create

| 파일 | 책임 | 추정 라인 |
|---|---|---|
| `src/shared/store/useSidebarStore.ts` | Zustand store — `desktopCollapsed` (persist) + `mobileOpen` (ephemeral) 와 토글 액션 | ~55 |
| `src/shared/hooks/useIsMobile.ts` | `matchMedia('(max-width: 767px)')` reactive hook | ~30 |
| `src/widgets/_shared/sidebar/ui/DesktopSidebar.tsx` | 데스크탑 사이드바 본체 — 256/64px 분기, 헤더 / nav / footer | ~140 |
| `src/widgets/_shared/sidebar/ui/MobileSidebar.tsx` | 모바일 Sheet drawer — 라우트 변경 시 자동 close | ~80 |
| `src/widgets/_shared/sidebar/ui/SidebarMenuItem.tsx` | 재귀 메뉴 아이템 — `variant='inline' \| 'collapsed-popout'` | ~150 |
| `src/widgets/_shared/sidebar/ui/SidebarTrigger.tsx` | topbar 토글 버튼 — 데스크탑/모바일 자동 분기 | ~35 |
| `src/widgets/_shared/sidebar/ui/useSidebarShortcut.ts` | document keydown listener — `Ctrl+B` / `Cmd+B` | ~30 |

### Modify

| 파일 | 변경 내용 |
|---|---|
| `src/shared/store/index.ts` | `useSidebarStore` re-export 추가 |
| `src/widgets/_shared/sidebar/ui/Sidebar.tsx` | 290 라인을 ~25 라인 wrapper 로 축소 — `useIsMobile()` 분기 |
| `src/widgets/_shared/sidebar/index.ts` | `SidebarTrigger` named export 추가 |
| `src/app/layouts/MainLayout.tsx` | `<header>` 좌측에 `<SidebarTrigger />` 추가, `useSidebarShortcut()` 호출 |

### Do Not Touch

- 다른 store / 다른 위젯
- `useMenus`, `MenuItem` 타입 등 메뉴 데이터 흐름
- `MainLayout` 의 main / overflow / breadcrumb / ProjectSelector / ThemeToggle 부분
- 다크/라이트 토큰 / `globals.css` (직전 작업 원복됨)

---

## Task 1: `useSidebarStore` (Zustand store)

**Files:**
- Create: `src/shared/store/useSidebarStore.ts`
- Modify: `src/shared/store/index.ts`

- [ ] **Step 1: store 파일 작성**

다음 내용으로 `src/shared/store/useSidebarStore.ts` 생성. 기존 `useThemeStore.ts` 의 패턴 (`devtools(persist(...))` + `createJSONStorage` + `partialize`) 을 따라간다.

```ts
/**
 * Sidebar Store (Zustand)
 * 데스크탑 collapse 여부 (persist) + 모바일 drawer 열림 (ephemeral) 를 관리.
 */

import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

interface SidebarState {
  /** 데스크탑 사이드바 collapsed 여부 — localStorage 에 persist */
  desktopCollapsed: boolean
  /** 모바일 drawer 열림 여부 — ephemeral (새로고침 시 false 로 리셋) */
  mobileOpen: boolean

  toggleDesktop: () => void
  setDesktop: (value: boolean) => void
  toggleMobile: () => void
  setMobile: (value: boolean) => void
  /** 라우트 변경 시 자동 호출용 */
  closeMobile: () => void
}

export const useSidebarStore = create<SidebarState>()(
  devtools(
    persist(
      (set) => ({
        desktopCollapsed: false,
        mobileOpen: false,

        toggleDesktop: () =>
          set((s) => ({ desktopCollapsed: !s.desktopCollapsed }), false, 'toggleDesktop'),
        setDesktop: (value: boolean) =>
          set({ desktopCollapsed: value }, false, 'setDesktop'),
        toggleMobile: () =>
          set((s) => ({ mobileOpen: !s.mobileOpen }), false, 'toggleMobile'),
        setMobile: (value: boolean) =>
          set({ mobileOpen: value }, false, 'setMobile'),
        closeMobile: () =>
          set({ mobileOpen: false }, false, 'closeMobile'),
      }),
      {
        name: 'sidebar-storage',
        storage: createJSONStorage(() => localStorage),
        // desktopCollapsed 만 persist. mobileOpen 은 새로고침 시 항상 false.
        partialize: (state) => ({ desktopCollapsed: state.desktopCollapsed }),
      }
    ),
    { name: 'SidebarStore' }
  )
)
```

- [ ] **Step 2: barrel export 추가**

`src/shared/store/index.ts` 의 export 목록에 `useSidebarStore` 한 줄 추가:

```ts
export { useAuthStore, initializeAuth } from './useAuthStore'
export { useProjectStore } from './useProjectStore'
export { useThemeStore, type Theme } from './useThemeStore'
export { useSshSessionStore, type SshSession } from './useSshSessionStore'
export { useSidebarStore } from './useSidebarStore'
```

- [ ] **Step 3: type-check 통과 확인**

Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run type-check`
Expected: 통과.

- [ ] **Step 4: 커밋**

```bash
git add src/shared/store/useSidebarStore.ts src/shared/store/index.ts
git commit -m "$(cat <<'EOF'
feat(sidebar): useSidebarStore (Zustand) 추가

desktopCollapsed (persist) + mobileOpen (ephemeral) 토글 액션 제공.
기존 useThemeStore 의 devtools+persist 패턴을 따른다.

spec: docs/superpowers/specs/2026-05-15-sidebar-collapse-expand-design.md
EOF
)"
```

---

## Task 2: `useIsMobile` hook

**Files:**
- Create: `src/shared/hooks/useIsMobile.ts`

- [ ] **Step 1: 디렉토리 확인 후 hook 작성**

`src/shared/hooks/` 디렉토리가 없으면 생성. 그 다음 파일 작성:

```ts
/**
 * useIsMobile — 화면이 모바일 폭 (< 768px, Tailwind `md` 미만) 인지 반응형으로 감지.
 *
 * Vite SPA 클라이언트 only — SSR 고려 불필요.
 * 마운트 시 matchMedia 구독, change 시 자동 리렌더.
 */

import { useEffect, useState } from 'react'

const MOBILE_MEDIA = '(max-width: 767px)'

function getInitialIsMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_MEDIA).matches
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(getInitialIsMobile)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_MEDIA)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    // Safari < 14 는 addEventListener 미지원 — fallback
    if (mql.addEventListener) {
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    } else {
      mql.addListener(handler)
      return () => mql.removeListener(handler)
    }
  }, [])

  return isMobile
}
```

- [ ] **Step 2: type-check 통과 확인**

Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run type-check`
Expected: 통과.

- [ ] **Step 3: 커밋**

```bash
git add src/shared/hooks/useIsMobile.ts
git commit -m "$(cat <<'EOF'
feat(sidebar): useIsMobile reactive hook 추가

matchMedia('(max-width: 767px)') 구독으로 Tailwind md 미만 폭 감지.
Safari <14 호환 addListener fallback 포함.

spec: docs/superpowers/specs/2026-05-15-sidebar-collapse-expand-design.md
EOF
)"
```

---

## Task 3: `SidebarMenuItem` (재귀, inline / collapsed-popout 양쪽)

**Files:**
- Create: `src/widgets/_shared/sidebar/ui/SidebarMenuItem.tsx`

이 컴포넌트가 가장 복잡하다. 현재 `Sidebar.tsx` 안의 inline `SidebarMenuItem` 의 로직을 가져오고, `variant='collapsed-popout'` 분기를 추가한다.

- [ ] **Step 1: 파일 작성**

```tsx
/**
 * SidebarMenuItem — 사이드바 메뉴 아이템 (재귀).
 *
 * variant:
 *   'inline'            : Desktop expanded / Mobile drawer 에서 사용. 자식 들이 indent 로 트리 표시.
 *   'collapsed-popout'  : Desktop collapsed 에서 1depth (depth=0) 만 호출. 자식이 있으면 Popover 로,
 *                         없으면 Tooltip 으로 표시.
 */

import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { type MenuItem } from '@/entities/_shared/menu'

import { getMenuIcon } from '@/shared/config/menu-icons'
import { cn } from '@/shared/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

export function isPathActive(currentPath: string, targetPath?: string): boolean {
  if (!targetPath) return false
  if (targetPath === '/') return currentPath === '/'
  return currentPath === targetPath || currentPath.startsWith(targetPath + '/')
}

export function hasActiveDescendant(item: MenuItem, currentPath: string): boolean {
  if (isPathActive(currentPath, item.path)) return true
  if (item.children) {
    return item.children.some((c) => hasActiveDescendant(c, currentPath))
  }
  return false
}

export type SidebarMenuItemVariant = 'inline' | 'collapsed-popout'

interface SidebarMenuItemProps {
  item: MenuItem
  depth: number
  currentPath: string
  opens: Record<string, boolean>
  onToggle: (id: string) => void
  variant: SidebarMenuItemVariant
  /** 메뉴 클릭 후 호출 — 모바일 drawer close / popover close 등에 사용. 없으면 no-op. */
  onNavigate?: () => void
}

export function SidebarMenuItem(props: SidebarMenuItemProps) {
  const { variant } = props

  // collapsed-popout 은 depth 0 (1depth) 에서만 호출되어야 한다.
  if (variant === 'collapsed-popout' && props.depth === 0) {
    return <CollapsedPopoutItem {...props} />
  }

  return <InlineItem {...props} />
}

/* ─────────────────────────  inline (expanded / drawer)  ───────────────────────── */

function InlineItem({ item, depth, currentPath, opens, onToggle, onNavigate }: SidebarMenuItemProps) {
  const hasChildren = !!(item.children && item.children.length > 0)
  const isOpen = !!opens[item.menuId]
  const isOn = isPathActive(currentPath, item.path)
  const parentOn = hasChildren && hasActiveDescendant(item, currentPath)

  if (hasChildren) {
    return (
      <>
        <button
          onClick={() => onToggle(item.menuId)}
          className={cn(
            'group/sb flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[13px] font-medium text-left transition-colors',
            'hover:bg-muted/40'
          )}
          style={{ color: parentOn ? 'hsl(var(--sidebar-fg))' : 'hsl(var(--sidebar-fg-muted))' }}
        >
          {item.isIconVisible !== false && depth === 0 && (
            <span className="shrink-0 inline-grid place-items-center w-4 h-4 [&_svg]:w-4 [&_svg]:h-4">
              {getMenuIcon(item.icon)}
            </span>
          )}
          <span className="flex-1 truncate">{item.label}</span>
          <ChevronRight
            className={cn(
              'shrink-0 h-3 w-3 transition-transform duration-150',
              isOpen && 'rotate-90'
            )}
            style={{ color: 'hsl(var(--sidebar-fg-muted))' }}
          />
        </button>
        {isOpen && (
          <div
            className="flex flex-col gap-0.5 ml-3 mt-0.5 pl-3 border-l"
            style={{ borderColor: 'hsl(var(--sidebar-border))' }}
          >
            {item.children!.map((child) => (
              <SidebarMenuItem
                key={child.menuId}
                item={child}
                depth={depth + 1}
                currentPath={currentPath}
                opens={opens}
                onToggle={onToggle}
                variant="inline"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </>
    )
  }

  if (!item.path || item.isLineBreak) {
    return null
  }

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12.5px] font-medium transition-colors',
        'hover:bg-muted/40'
      )}
      style={
        isOn
          ? {
              background: 'hsl(var(--sidebar-active-bg))',
              color: 'hsl(var(--sidebar-active-fg))',
              boxShadow: 'inset 0 0 0 1px hsl(var(--sidebar-active-border))',
            }
          : { color: 'hsl(var(--sidebar-fg-muted))' }
      }
    >
      {depth === 0 && item.isIconVisible !== false && (
        <span className="shrink-0 inline-grid place-items-center w-4 h-4 [&_svg]:w-4 [&_svg]:h-4">
          {getMenuIcon(item.icon)}
        </span>
      )}
      {depth > 0 && (
        <span
          className="shrink-0 w-[5px] h-[5px] rounded-full"
          style={{ background: 'currentColor', opacity: 0.55 }}
        />
      )}
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  )
}

/* ─────────────────────────  collapsed-popout (depth=0 only)  ───────────────────────── */

function CollapsedPopoutItem(props: SidebarMenuItemProps) {
  const { item, currentPath, onNavigate } = props
  const hasChildren = !!(item.children && item.children.length > 0)
  const isOnAny = hasActiveDescendant(item, currentPath)

  const iconButtonClass = cn(
    'flex items-center justify-center w-10 h-10 mx-auto rounded-md transition-colors',
    'hover:bg-muted/40 [&_svg]:w-4 [&_svg]:h-4'
  )

  const iconStyle = isOnAny
    ? {
        background: 'hsl(var(--sidebar-active-bg))',
        color: 'hsl(var(--sidebar-active-fg))',
        boxShadow: 'inset 0 0 0 1px hsl(var(--sidebar-active-border))',
      }
    : { color: 'hsl(var(--sidebar-fg-muted))' }

  // 자식 없는 leaf — 단순 Link + Tooltip
  if (!hasChildren) {
    if (!item.path || item.isLineBreak) return null
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={item.path}
            onClick={onNavigate}
            className={iconButtonClass}
            style={iconStyle}
            aria-label={item.label}
          >
            {item.isIconVisible !== false && (
              <span className="inline-grid place-items-center">{getMenuIcon(item.icon)}</span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  // 자식 있음 — Popover 로 자식 트리 표시. 호버 enter/leave 로 open 제어.
  return (
    <HoverPopover
      label={item.label}
      iconButtonClass={iconButtonClass}
      iconStyle={iconStyle}
      iconNode={
        item.isIconVisible !== false ? (
          <span className="inline-grid place-items-center">{getMenuIcon(item.icon)}</span>
        ) : null
      }
    >
      <PopoutChildren
        item={item}
        currentPath={currentPath}
        onNavigate={onNavigate}
      />
    </HoverPopover>
  )
}

/* hover 진입/이탈 delay 가 있는 Popover wrapper */
interface HoverPopoverProps {
  label: string
  iconButtonClass: string
  iconStyle: React.CSSProperties
  iconNode: React.ReactNode
  children: React.ReactNode
}

import { useRef, useState } from 'react'

function HoverPopover({ label, iconButtonClass, iconStyle, iconNode, children }: HoverPopoverProps) {
  const [open, setOpen] = useState(false)
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelTimers = () => {
    if (enterTimer.current) clearTimeout(enterTimer.current)
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    enterTimer.current = null
    leaveTimer.current = null
  }

  const handleEnter = () => {
    cancelTimers()
    enterTimer.current = setTimeout(() => setOpen(true), 100)
  }
  const handleLeave = () => {
    cancelTimers()
    leaveTimer.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={iconButtonClass}
          style={iconStyle}
          aria-label={label}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          {iconNode}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-64 p-2"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="px-2 pb-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          {label}
        </div>
        {children}
      </PopoverContent>
    </Popover>
  )
}

interface PopoutChildrenProps {
  item: MenuItem
  currentPath: string
  onNavigate?: () => void
}

function PopoutChildren({ item, currentPath, onNavigate }: PopoutChildrenProps) {
  // popout 안에서는 모든 분기를 expanded 로 보여준다.
  // toggle 동작은 popout 안에서 비활성 — 매번 다 열린 상태로 표시한다.
  const allOpen: Record<string, boolean> = {}
  const visit = (m: MenuItem) => {
    if (m.children && m.children.length > 0) {
      allOpen[m.menuId] = true
      m.children.forEach(visit)
    }
  }
  visit(item)

  return (
    <div className="flex flex-col gap-0.5">
      {item.children!.map((child) => (
        <SidebarMenuItem
          key={child.menuId}
          item={child}
          depth={1}
          currentPath={currentPath}
          opens={allOpen}
          onToggle={() => { /* popout 안에서는 toggle 비활성 — 항상 열린 상태 */ }}
          variant="inline"
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: type-check 통과 확인**

Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run type-check`
Expected: 통과.

`Popover`, `PopoverContent`, `PopoverTrigger` / `Tooltip` 컴포넌트의 export 가 정확한지 type-check 가 검증한다. 만약 export 이름이 다르면 import 줄 수정.

- [ ] **Step 3: 커밋**

```bash
git add src/widgets/_shared/sidebar/ui/SidebarMenuItem.tsx
git commit -m "$(cat <<'EOF'
feat(sidebar): SidebarMenuItem 재귀 컴포넌트 신규 추출

기존 Sidebar.tsx 안의 inline SidebarMenuItem 로직을 분리하고
variant='collapsed-popout' (depth=0 only) 분기 추가. 자식 있으면
HoverPopover 로 자식 트리 표시, leaf 는 Tooltip 으로 라벨만.

spec: docs/superpowers/specs/2026-05-15-sidebar-collapse-expand-design.md
EOF
)"
```

---

## Task 4: `SidebarTrigger` (topbar 토글 버튼)

**Files:**
- Create: `src/widgets/_shared/sidebar/ui/SidebarTrigger.tsx`

- [ ] **Step 1: 파일 작성**

```tsx
/**
 * SidebarTrigger — topbar 에 노출되는 사이드바 토글 버튼.
 *
 * 데스크탑 (>=768px): PanelLeftClose / PanelLeftOpen 아이콘, desktopCollapsed 토글.
 * 모바일  (<768px) : Menu (hamburger) 아이콘, mobileOpen 토글.
 */

import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { useSidebarStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'

export function SidebarTrigger() {
  const isMobile = useIsMobile()
  const desktopCollapsed = useSidebarStore((s) => s.desktopCollapsed)
  const toggleDesktop = useSidebarStore((s) => s.toggleDesktop)
  const toggleMobile = useSidebarStore((s) => s.toggleMobile)

  if (isMobile) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="사이드바 열기"
        onClick={toggleMobile}
      >
        <Menu className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={desktopCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
      onClick={toggleDesktop}
    >
      {desktopCollapsed ? (
        <PanelLeftOpen className="h-5 w-5" />
      ) : (
        <PanelLeftClose className="h-5 w-5" />
      )}
    </Button>
  )
}
```

- [ ] **Step 2: type-check 통과 확인**

Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run type-check`
Expected: 통과. `Button` variant/size prop, lucide 아이콘 import 가 모두 유효해야 한다.

- [ ] **Step 3: 커밋**

```bash
git add src/widgets/_shared/sidebar/ui/SidebarTrigger.tsx
git commit -m "$(cat <<'EOF'
feat(sidebar): SidebarTrigger 토글 버튼 추가

데스크탑은 PanelLeftClose/Open 아이콘으로 desktopCollapsed 토글,
모바일은 Menu(hamburger) 아이콘으로 mobileOpen 토글. topbar 좌상단에
배치 예정.

spec: docs/superpowers/specs/2026-05-15-sidebar-collapse-expand-design.md
EOF
)"
```

---

## Task 5: `DesktopSidebar` (데스크탑 본체)

**Files:**
- Create: `src/widgets/_shared/sidebar/ui/DesktopSidebar.tsx`

기존 `Sidebar.tsx` 의 데스크탑 구조 (로고 / nav / 사용자 영역) 를 가져오고 collapsed 분기 추가.

- [ ] **Step 1: 파일 작성**

```tsx
/**
 * DesktopSidebar — 데스크탑 (md+) 에서만 렌더되는 사이드바 본체.
 *
 * 폭: desktopCollapsed ? 64px : 256px (transition 200ms).
 * collapsed 일 때 메뉴 트리는 1depth 만 아이콘으로 보이고 자식은 hover popout.
 */

import { useEffect, useMemo, useState } from 'react'

import { LogOut, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ProfileEditForm } from '@/widgets/_shared/profile-edit'

import { useMenus, type MenuItem } from '@/entities/_shared/menu'

import { ROUTES } from '@/shared/config/constants'
import { cn } from '@/shared/lib/utils'
import { useAuthStore, useSidebarStore } from '@/shared/store'
import { DiceBearAvatar, DEFAULT_AVATAR_STYLE, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { TooltipProvider } from '@/shared/ui/tooltip'

import { SidebarMenuItem, hasActiveDescendant } from './SidebarMenuItem'

export function DesktopSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const collapsed = useSidebarStore((s) => s.desktopCollapsed)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { data: menus, isLoading, error } = useMenus()

  const [profileOpen, setProfileOpen] = useState(false)

  // 활성 메뉴 그룹은 항상 열린 상태로 초기화 (expanded 일 때만 의미 있음)
  const initialOpens = useMemo(() => {
    const opens: Record<string, boolean> = {}
    const visit = (item: MenuItem) => {
      if (item.children && item.children.length > 0) {
        if (hasActiveDescendant(item, location.pathname)) {
          opens[item.menuId] = true
        }
      }
      item.children?.forEach(visit)
    }
    menus?.forEach(visit)
    return opens
  }, [menus, location.pathname])

  const [opens, setOpens] = useState<Record<string, boolean>>(initialOpens)
  useEffect(() => {
    setOpens((s) => ({ ...s, ...initialOpens }))
  }, [initialOpens])

  const toggle = (id: string) =>
    setOpens((s) => ({ ...s, [id]: !s[id] }))

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname !== ROUTES.HOME) navigate(ROUTES.HOME)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <TooltipProvider delayDuration={500}>
      <aside
        className={cn(
          'flex flex-col flex-none border-r border-border overflow-y-auto overflow-x-hidden transition-[width] duration-200 ease-out',
          collapsed ? 'w-16' : 'w-[256px]'
        )}
        style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
        aria-label="주 메뉴"
      >
        {/* 로고 영역 — topbar 와 동일한 h-16 */}
        <a
          href={ROUTES.HOME}
          onClick={handleLogoClick}
          className={cn(
            'flex items-center gap-2.5 h-16 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors flex-none',
            collapsed ? 'px-0 justify-center' : 'px-4'
          )}
          aria-label="홈으로"
        >
          <span
            className="inline-grid place-items-center w-[30px] h-[30px] rounded-md text-white text-[13px] font-extrabold tracking-[0.5px] shrink-0"
            style={{
              background: 'linear-gradient(180deg, hsl(170 80% 40%), hsl(173 76% 25%))',
              boxShadow: '0 1px 2px rgba(0,0,0,0.10), inset 0 -1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.10)',
            }}
          >
            R
          </span>
          {!collapsed && (
            <div className="flex flex-col leading-none transition-opacity duration-150 ease-out opacity-100">
              <strong className="text-sm font-bold" style={{ color: 'hsl(var(--sidebar-fg))' }}>
                Release Manager
              </strong>
              <small className="mt-1 text-[11px] font-medium" style={{ color: 'hsl(var(--sidebar-fg-muted))' }}>
                Backstage
              </small>
            </div>
          )}
        </a>

        {/* 메뉴 영역 */}
        <nav
          className={cn('flex flex-col flex-1 min-h-0', collapsed ? 'gap-1 px-1.5 py-3' : 'gap-0.5 px-2 py-3')}
        >
          {isLoading ? (
            <div className="px-3 py-2 text-xs" style={{ color: 'hsl(var(--sidebar-fg-muted))' }}>
              {collapsed ? '…' : '메뉴 로딩 중…'}
            </div>
          ) : error ? (
            <div className="px-3 py-2 text-xs text-destructive">{collapsed ? '!' : '메뉴 로드 실패'}</div>
          ) : (
            menus?.map((item) => (
              <SidebarMenuItem
                key={item.menuId}
                item={item}
                depth={0}
                currentPath={location.pathname}
                opens={opens}
                onToggle={toggle}
                variant={collapsed ? 'collapsed-popout' : 'inline'}
              />
            ))
          )}
        </nav>

        {/* 사용자 영역 */}
        {user && (
          <div className={cn('border-t border-border', collapsed ? 'px-1 py-2' : 'px-2 py-2')}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    collapsed ? 'justify-center p-1' : 'px-2 py-2'
                  )}
                  style={{ color: 'hsl(var(--sidebar-fg))' }}
                  aria-label="사용자 메뉴"
                >
                  <DiceBearAvatar
                    seed={user.avatarSeed || user.email}
                    style={(user.avatarStyle as AvatarStyleKey) || DEFAULT_AVATAR_STYLE}
                    size={32}
                    name={user.accountName}
                  />
                  {!collapsed && (
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-[13px] font-semibold truncate w-full text-left">
                        {user.accountName}
                      </span>
                      <span
                        className="text-[11px] truncate w-full text-left"
                        style={{ color: 'hsl(var(--sidebar-fg-muted))' }}
                      >
                        {user.role}
                      </span>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{user.accountName}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  내 정보 수정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>

      <ProfileEditForm open={profileOpen} onOpenChange={setProfileOpen} />
    </TooltipProvider>
  )
}
```

- [ ] **Step 2: type-check 통과 확인**

Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run type-check`
Expected: 통과. `TooltipProvider` import 가 `@/shared/ui/tooltip` 에 존재해야 한다. 없으면 shadcn 기본 tooltip 컴포넌트 파일 (`src/shared/ui/tooltip.tsx`) 에 추가되어 있는지 확인하고, 없으면 그 파일에 `TooltipProvider = TooltipPrimitive.Provider` 한 줄 export 추가.

- [ ] **Step 3: 커밋**

```bash
git add src/widgets/_shared/sidebar/ui/DesktopSidebar.tsx
git commit -m "$(cat <<'EOF'
feat(sidebar): DesktopSidebar 컴포넌트 신규 추가

desktopCollapsed 에 따라 256↔64px 전환 + transition. collapsed 시
로고 텍스트 숨김, nav 는 SidebarMenuItem variant='collapsed-popout'
로, 사용자 영역은 아바타만. TooltipProvider 로 모든 leaf tooltip 통일.

spec: docs/superpowers/specs/2026-05-15-sidebar-collapse-expand-design.md
EOF
)"
```

---

## Task 6: `MobileSidebar` (Sheet drawer)

**Files:**
- Create: `src/widgets/_shared/sidebar/ui/MobileSidebar.tsx`

- [ ] **Step 1: 파일 작성**

```tsx
/**
 * MobileSidebar — 모바일 (<768px) 에서만 렌더되는 Sheet drawer.
 *
 * mobileOpen 으로 open 상태 제어. 라우트 변경 감지 시 자동 close.
 */

import { useEffect, useMemo, useState } from 'react'

import { LogOut, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ProfileEditForm } from '@/widgets/_shared/profile-edit'

import { useMenus, type MenuItem } from '@/entities/_shared/menu'

import { ROUTES } from '@/shared/config/constants'
import { useAuthStore, useSidebarStore } from '@/shared/store'
import { DiceBearAvatar, DEFAULT_AVATAR_STYLE, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle } from '@/shared/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { SidebarMenuItem, hasActiveDescendant } from './SidebarMenuItem'

export function MobileSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const open = useSidebarStore((s) => s.mobileOpen)
  const setMobile = useSidebarStore((s) => s.setMobile)
  const closeMobile = useSidebarStore((s) => s.closeMobile)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { data: menus, isLoading, error } = useMenus()

  const [profileOpen, setProfileOpen] = useState(false)

  // 라우트 변경 시 자동 close — 메뉴 클릭 후 페이지 이동되면 drawer 닫힘
  useEffect(() => {
    closeMobile()
  }, [location.pathname, closeMobile])

  const initialOpens = useMemo(() => {
    const opens: Record<string, boolean> = {}
    const visit = (item: MenuItem) => {
      if (item.children && item.children.length > 0) {
        if (hasActiveDescendant(item, location.pathname)) {
          opens[item.menuId] = true
        }
      }
      item.children?.forEach(visit)
    }
    menus?.forEach(visit)
    return opens
  }, [menus, location.pathname])

  const [opens, setOpens] = useState<Record<string, boolean>>(initialOpens)
  useEffect(() => {
    setOpens((s) => ({ ...s, ...initialOpens }))
  }, [initialOpens])

  const toggle = (id: string) =>
    setOpens((s) => ({ ...s, [id]: !s[id] }))

  const handleLogout = () => {
    logout()
    closeMobile()
    navigate('/login')
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setMobile}>
        <SheetContent
          side="left"
          className="w-72 p-0 flex flex-col"
          style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
        >
          <VisuallyHidden asChild>
            <SheetTitle>주 메뉴</SheetTitle>
          </VisuallyHidden>

          {/* 로고 영역 */}
          <div
            className="flex items-center gap-2.5 h-16 px-4 border-b border-border flex-none"
          >
            <span
              className="inline-grid place-items-center w-[30px] h-[30px] rounded-md text-white text-[13px] font-extrabold tracking-[0.5px]"
              style={{
                background: 'linear-gradient(180deg, hsl(170 80% 40%), hsl(173 76% 25%))',
                boxShadow: '0 1px 2px rgba(0,0,0,0.10), inset 0 -1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.10)',
              }}
            >
              R
            </span>
            <div className="flex flex-col leading-none">
              <strong className="text-sm font-bold" style={{ color: 'hsl(var(--sidebar-fg))' }}>
                Release Manager
              </strong>
              <small className="mt-1 text-[11px] font-medium" style={{ color: 'hsl(var(--sidebar-fg-muted))' }}>
                Backstage
              </small>
            </div>
          </div>

          {/* 메뉴 영역 */}
          <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-xs" style={{ color: 'hsl(var(--sidebar-fg-muted))' }}>
                메뉴 로딩 중…
              </div>
            ) : error ? (
              <div className="px-3 py-2 text-xs text-destructive">메뉴 로드 실패</div>
            ) : (
              menus?.map((item) => (
                <SidebarMenuItem
                  key={item.menuId}
                  item={item}
                  depth={0}
                  currentPath={location.pathname}
                  opens={opens}
                  onToggle={toggle}
                  variant="inline"
                  onNavigate={closeMobile}
                />
              ))
            )}
          </nav>

          {/* 사용자 영역 */}
          {user && (
            <div className="border-t border-border px-2 py-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex w-full items-center gap-2.5 px-2 py-2 rounded-md hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ color: 'hsl(var(--sidebar-fg))' }}
                  >
                    <DiceBearAvatar
                      seed={user.avatarSeed || user.email}
                      style={(user.avatarStyle as AvatarStyleKey) || DEFAULT_AVATAR_STYLE}
                      size={32}
                      name={user.accountName}
                    />
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-[13px] font-semibold truncate w-full text-left">
                        {user.accountName}
                      </span>
                      <span className="text-[11px] truncate w-full text-left" style={{ color: 'hsl(var(--sidebar-fg-muted))' }}>
                        {user.role}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{user.accountName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    내 정보 수정
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ProfileEditForm open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}
```

`ROUTES` import 가 사용되지 않으면 제거. 위 구현은 로고 영역에서 사용 안 함 — 모바일 drawer 에서 로고 클릭으로 홈 이동은 불필요 (메뉴에 홈 항목 있음). 따라서 `import { ROUTES }` 줄과 unused `navigate` 도 제거 필요. 위 코드에서 `navigate` 는 logout 분기에서 사용되므로 유지, `ROUTES` 는 제거.

수정된 import 블록:
```tsx
import { useAuthStore, useSidebarStore } from '@/shared/store'
import { DiceBearAvatar, DEFAULT_AVATAR_STYLE, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
```
(`ROUTES` 줄 제거)

- [ ] **Step 2: `Sheet` / `SheetContent` / `SheetTitle` export 확인**

`src/shared/ui/sheet.tsx` 를 빠르게 보고 위 3개 모두 named export 되어 있는지 확인. 없으면 import 줄 조정 필요.

Run: `grep -E "^export.*Sheet" /mnt/c/Soronprfbs/project/release-manager/release-manager-web/src/shared/ui/sheet.tsx`
Expected: `SheetContent`, `SheetTitle`, `Sheet` (또는 `Sheet = ...`) 가 export 되어 있음.

VisuallyHidden 은 `@radix-ui/react-visually-hidden` — 만약 dependency 에 없으면, 대신 `className="sr-only"` 를 단 일반 `SheetTitle` 로 대체:
```tsx
<SheetTitle className="sr-only">주 메뉴</SheetTitle>
```
이 fallback 으로 가는 게 simpler. 이번 plan 에서는 **`className="sr-only"` fallback 을 default 로** 채택하고 위 `VisuallyHidden` import 와 wrapper 를 삭제한다.

따라서 최종 코드에서 다음 import 도 제거:
```tsx
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
```
그리고 다음 JSX 블록을:
```tsx
<VisuallyHidden asChild>
  <SheetTitle>주 메뉴</SheetTitle>
</VisuallyHidden>
```
다음으로 교체:
```tsx
<SheetTitle className="sr-only">주 메뉴</SheetTitle>
```

- [ ] **Step 3: type-check 통과 확인**

Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run type-check`
Expected: 통과.

- [ ] **Step 4: 커밋**

```bash
git add src/widgets/_shared/sidebar/ui/MobileSidebar.tsx
git commit -m "$(cat <<'EOF'
feat(sidebar): MobileSidebar Sheet drawer 신규 추가

mobileOpen 으로 제어되는 shadcn Sheet (side='left' w-72). 라우트
변경 시 useEffect 로 자동 close. 메뉴는 항상 expanded variant.
SheetTitle 은 sr-only 로 a11y 확보.

spec: docs/superpowers/specs/2026-05-15-sidebar-collapse-expand-design.md
EOF
)"
```

---

## Task 7: `Sidebar` wrapper 축소 + barrel export

**Files:**
- Modify: `src/widgets/_shared/sidebar/ui/Sidebar.tsx`
- Modify: `src/widgets/_shared/sidebar/index.ts`

- [ ] **Step 1: `Sidebar.tsx` 전체 교체**

기존 290 라인을 다음 wrapper 로 완전 교체:

```tsx
/**
 * Sidebar — wrapper. 화면 폭에 따라 DesktopSidebar / MobileSidebar 분기.
 */

import { useIsMobile } from '@/shared/hooks/useIsMobile'

import { DesktopSidebar } from './DesktopSidebar'
import { MobileSidebar } from './MobileSidebar'

export function Sidebar() {
  const isMobile = useIsMobile()
  // 모바일에서는 좌측 컬럼이 사라지고 Sheet drawer 가 overlay 로 동작.
  // 데스크탑에서는 사이드바가 flex 형제로 자리잡음.
  return isMobile ? <MobileSidebar /> : <DesktopSidebar />
}
```

- [ ] **Step 2: 화면 폭 변화 시 mobileOpen 정리**

화면 폭이 모바일 → 데스크탑으로 바뀌면 `MobileSidebar` 가 unmount 되지만 store 의 `mobileOpen` 은 `true` 가 남는다. 다시 모바일 폭이 되면 drawer 가 열린 상태로 나타나서 위화감. 이걸 wrapper 레벨에서 정리:

수정된 `Sidebar.tsx`:
```tsx
/**
 * Sidebar — wrapper. 화면 폭에 따라 DesktopSidebar / MobileSidebar 분기.
 * 화면 폭이 변할 때 mobileOpen 잔존 상태를 정리한다.
 */

import { useEffect } from 'react'

import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { useSidebarStore } from '@/shared/store'

import { DesktopSidebar } from './DesktopSidebar'
import { MobileSidebar } from './MobileSidebar'

export function Sidebar() {
  const isMobile = useIsMobile()
  const closeMobile = useSidebarStore((s) => s.closeMobile)

  // 데스크탑 폭으로 전환되면 mobileOpen 잔존 상태 정리
  useEffect(() => {
    if (!isMobile) closeMobile()
  }, [isMobile, closeMobile])

  return isMobile ? <MobileSidebar /> : <DesktopSidebar />
}
```

- [ ] **Step 3: barrel export 갱신**

`src/widgets/_shared/sidebar/index.ts` 가 현재 어떤 export 를 갖고 있는지 먼저 확인. 일반 패턴은:
```ts
export { Sidebar } from './ui/Sidebar'
```

여기에 `SidebarTrigger` 추가:
```ts
export { Sidebar } from './ui/Sidebar'
export { SidebarTrigger } from './ui/SidebarTrigger'
```

- [ ] **Step 4: type-check + build 통과**

Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run type-check`
Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run build`
Expected: 둘 다 통과.

- [ ] **Step 5: 커밋**

```bash
git add src/widgets/_shared/sidebar/ui/Sidebar.tsx src/widgets/_shared/sidebar/index.ts
git commit -m "$(cat <<'EOF'
refactor(sidebar): Sidebar.tsx 를 폭 분기 wrapper 로 축소

기존 290 라인 단일 파일 → useIsMobile() 으로 DesktopSidebar /
MobileSidebar 를 선택하는 25 라인 wrapper. 데스크탑 폭 복귀 시
mobileOpen 잔존 상태도 정리. SidebarTrigger 도 barrel export 노출.

spec: docs/superpowers/specs/2026-05-15-sidebar-collapse-expand-design.md
EOF
)"
```

---

## Task 8: 단축키 hook + MainLayout 통합

**Files:**
- Create: `src/widgets/_shared/sidebar/ui/useSidebarShortcut.ts`
- Modify: `src/app/layouts/MainLayout.tsx`

- [ ] **Step 1: `useSidebarShortcut` hook 작성**

```ts
/**
 * useSidebarShortcut — Ctrl+B / Cmd+B 로 사이드바 토글.
 * 데스크탑이면 desktopCollapsed 토글, 모바일이면 mobileOpen 토글.
 *
 * IME composition 중에는 무시. input/textarea 포커스 중에도 동작 (VS Code 표준).
 */

import { useEffect } from 'react'

import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { useSidebarStore } from '@/shared/store'

export function useSidebarShortcut() {
  const isMobile = useIsMobile()
  const toggleDesktop = useSidebarStore((s) => s.toggleDesktop)
  const toggleMobile = useSidebarStore((s) => s.toggleMobile)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.isComposing) return
      const isMod = e.metaKey || e.ctrlKey
      if (!isMod) return
      if (e.key.toLowerCase() !== 'b') return
      // 브라우저의 북마크 사이드바 단축키 (Ctrl+B) 가 있는 환경도 있음 — 우리가 잡는다.
      e.preventDefault()
      if (isMobile) toggleMobile()
      else toggleDesktop()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isMobile, toggleDesktop, toggleMobile])
}
```

- [ ] **Step 2: `MainLayout.tsx` 수정 — header 에 SidebarTrigger + shortcut hook 호출**

```tsx
import { ReactNode } from 'react'

import { ProjectSelector } from '@/widgets/_shared/project-selector'
import { Sidebar, SidebarTrigger } from '@/widgets/_shared/sidebar'
import { useSidebarShortcut } from '@/widgets/_shared/sidebar/ui/useSidebarShortcut'
import { ThemeToggle } from '@/widgets/_shared/theme-toggle'

import { DynamicBreadcrumb } from '@/shared/ui/dynamic-breadcrumb'

interface MainLayoutProps {
  children: ReactNode
}

/**
 * Backstage redesign — sidebar shell layout.
 *  ┌────────────┬──────────────────────────────────────┐
 *  │  Sidebar   │  Topbar  [trigger][breadcrumb] […]   │
 *  │ (or Sheet) ├──────────────────────────────────────┤
 *  │  on mobile │  <main> flex-1 min-h-0 overflow-auto │
 *  └────────────┴──────────────────────────────────────┘
 */
export function MainLayout({ children }: MainLayoutProps) {
  useSidebarShortcut()

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <header className="flex items-center gap-3 px-6 h-16 border-b border-border bg-background flex-none">
          <SidebarTrigger />
          <div className="flex-1 min-w-0 overflow-hidden">
            <DynamicBreadcrumb />
          </div>
          <ProjectSelector />
          <div className="h-5 w-px bg-border mx-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
```

변경 요점:
- 새 import 2개 (`SidebarTrigger`, `useSidebarShortcut`)
- 함수 시작 부에 `useSidebarShortcut()` 1회 호출
- `<header>` 안 `<DynamicBreadcrumb>` 앞에 `<SidebarTrigger />` 추가
- 주석 도식만 살짝 갱신 (선택 — 기능 영향 없음)

- [ ] **Step 3: type-check + build 통과**

Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run type-check`
Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run build`
Expected: 둘 다 통과.

- [ ] **Step 4: 커밋**

```bash
git add src/widgets/_shared/sidebar/ui/useSidebarShortcut.ts src/app/layouts/MainLayout.tsx
git commit -m "$(cat <<'EOF'
feat(sidebar): Ctrl+B 단축키 + topbar SidebarTrigger 통합

useSidebarShortcut hook 신규 — Ctrl+B / Cmd+B 로 데스크탑은
desktopCollapsed, 모바일은 mobileOpen 토글. MainLayout 의 <header>
좌측에 SidebarTrigger 노출. 단축키는 input 포커스 중에도 동작
(VS Code 표준). IME composition 중에는 무시.

spec: docs/superpowers/specs/2026-05-15-sidebar-collapse-expand-design.md
EOF
)"
```

---

## Task 9: 통합 검증

**Files:** 없음 — 검증 단계.

- [ ] **Step 1: 자동 검증**

Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run type-check`
Expected: 통과.

Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run lint`
Expected: 우리가 손댄 파일들 (`useSidebarStore.ts`, `useIsMobile.ts`, `SidebarMenuItem.tsx`, `SidebarTrigger.tsx`, `DesktopSidebar.tsx`, `MobileSidebar.tsx`, `Sidebar.tsx`, `useSidebarShortcut.ts`, `MainLayout.tsx`, store/index.ts, sidebar/index.ts) 에 새 lint 에러 0건. pre-existing 에러는 무시.

검증 명령:
```bash
npm run lint 2>&1 | grep -E "(useSidebarStore|useIsMobile|SidebarMenuItem|SidebarTrigger|DesktopSidebar|MobileSidebar|sidebar/ui/Sidebar|useSidebarShortcut|MainLayout|sidebar/index|store/index)"
```
Expected: 매치 없음.

Run: `cd /mnt/c/Soronprfbs/project/release-manager/release-manager-web && npm run build`
Expected: 통과.

- [ ] **Step 2: 시각 / 동작 회귀 체크리스트 — 데스크탑**

dev 서버를 띄우고 (`npm run dev`) 브라우저에서 (≥768px):

- [ ] 페이지 로드 시 사이드바 256px expanded 로 보임 (초기 desktopCollapsed=false)
- [ ] topbar 좌상단의 `PanelLeftClose` 버튼 클릭 → 64px collapsed 로 transition (200ms)
- [ ] 다시 클릭 → 256px expanded 로 복귀
- [ ] `Ctrl+B` (Mac: `Cmd+B`) 단축키로 토글 정상
- [ ] collapsed 상태에서:
  - [ ] 1depth 아이콘만 보이고 라벨 숨김
  - [ ] 자식 있는 1depth (예: "운영 관리") 아이콘에 hover → 100ms 뒤 우측에 popout 표시. 자식 트리 (프로젝트 / 고객사 / 부서 / 계정) 모두 보임. 깊이 있는 자식 (예: 계정 > 권한 관리) 도 inline 으로 펼쳐져서 보임.
  - [ ] popout 안 메뉴 클릭 → 해당 페이지 이동 + popout 자동 close
  - [ ] 자식 없는 leaf (예: "패치 관리") 아이콘에 hover → tooltip 으로 라벨만 표시
  - [ ] 현재 페이지가 속한 1depth 아이콘에 active highlight 색
- [ ] 새로고침 후 collapsed 상태 그대로 복원
- [ ] 사용자 영역 (아바타) collapsed 시 아바타만, expanded 시 이름/role 함께. dropdown 메뉴 정상 동작

- [ ] **Step 3: 시각 / 동작 회귀 체크리스트 — 모바일**

브라우저 devtools 의 responsive mode 또는 폭을 < 768px 로 줄여서:

- [ ] 사이드바 자체가 사라지고 topbar 의 hamburger 아이콘만 보임
- [ ] hamburger 클릭 → Sheet drawer 좌측에서 슬라이드 인. 메뉴 expanded 형태로 모두 표시
- [ ] drawer 안의 메뉴 클릭 → 라우트 이동 + drawer 자동 close
- [ ] backdrop 클릭 → drawer close
- [ ] ESC 키 → drawer close
- [ ] 다시 모바일 폭에서 데스크탑 폭으로 확장 → 사이드바가 expanded 또는 (이전 collapsed 상태 였다면) collapsed 로 정상 복원

- [ ] **Step 4: 라이트 / 다크 테마 회귀**

- [ ] 다크 모드 (기본): 사이드바 색상 정상
- [ ] 라이트 모드 (테마 토글): 사이드바 색상 정상
- [ ] 두 모드 모두에서 collapsed popout / mobile drawer 의 색상 정상
- [ ] active 메뉴 highlight 두 모드 모두 인지 가능

- [ ] **Step 5: 회귀 — 메뉴 트리 깊이별**

- [ ] 1 depth 만 있는 메뉴 (root level — 예: 홈) → collapsed 시 아이콘 + tooltip
- [ ] 2 depth 있는 메뉴 (1 + 자식) → collapsed 시 아이콘 + popout
- [ ] 3 depth 있는 메뉴 (1 + 자식 + 손자) → collapsed 시 아이콘 + popout 안에서 깊은 자식도 모두 인라인으로 펼쳐서 표시
- [ ] expanded 시 깊이별 indent + 트리 toggle 정상

- [ ] **Step 6: 사용자 인수**

dev 서버 띄운 채로 사용자에게 확인 요청:
> "데스크탑 (≥768px) 에서 topbar 좌상단 토글 / Ctrl+B / collapsed hover popout, 그리고 모바일 폭에서 hamburger drawer 모두 확인 부탁드립니다. 라이트/다크 토글에도 영향 없는지 함께 확인 부탁드립니다."

사용자 OK 후 plan 완료.

- [ ] **Step 7: (필요 시) 미세 조정 커밋**

검증 중 발견된 미세 조정 (transition duration, popout sideOffset, hover delay 등) 이 있다면 별도 커밋. 없으면 스킵.

---

## Self-Review

**1. Spec 커버리지**
- spec §4.1 store 모델 → Task 1 ✅
- spec §4.2 useIsMobile → Task 2 ✅
- spec §4.3 컴포넌트 구조 → Task 3 (SidebarMenuItem), Task 5 (DesktopSidebar), Task 6 (MobileSidebar), Task 7 (Sidebar wrapper) ✅
- spec §4.4 hover popout 동작 → Task 3 의 HoverPopover ✅
- spec §4.5 leaf tooltip → Task 3 의 CollapsedPopoutItem 분기 ✅
- spec §4.6 active state 처리 → Task 3 의 `isPathActive` / `hasActiveDescendant` 활용 ✅
- spec §4.7 단축키 → Task 8 ✅
- spec §4.8 애니메이션 → Task 5 (transition width / opacity) + Task 3 (Radix Popover 기본) ✅
- spec §4.9 라우트 변경 시 모바일 close → Task 6 의 `useEffect([location.pathname])` ✅
- spec §4.10 z-index → shadcn 기본 사용 (별도 task 없음 — 자동 해결) ✅
- spec §5 파일 구조 → 모든 신규 파일 task 에 매핑 ✅
- spec §6 데이터 흐름 → Task 7 의 wrapper + Task 8 의 trigger / shortcut 가 정확히 구현 ✅
- spec §7 edge cases → Task 7 Step 2 의 화면 폭 전환 시 mobileOpen 정리 + Task 8 의 IME composition / input focus 처리 ✅
- spec §8 다크/라이트 호환 → 토큰만 사용, 추가 토큰 없음 ✅
- spec §9 검증 → Task 9 ✅
- spec §10 롤백 → 6 커밋 reset 가능 (Task 1~Task 8 의 8 커밋, Task 9 는 검증만)

**2. Placeholder 스캔**
- TBD / "implement later" / "add error handling" 등 없음 ✅
- 모든 코드 step 에 실제 코드 블록 포함 ✅
- 모든 `git commit` 명령에 실제 메시지 포함 ✅

**3. Type / 이름 일관성**
- `desktopCollapsed`, `mobileOpen` — Task 1 정의와 Task 4 / 5 / 6 / 7 / 8 의 사용처가 모두 일관 ✅
- `toggleDesktop`, `toggleMobile`, `setMobile`, `closeMobile` — Task 1 정의와 사용처 일치 ✅
- `SidebarMenuItemVariant = 'inline' \| 'collapsed-popout'` — Task 3 정의와 Task 5 / 6 의 prop 전달 일치 ✅
- `useIsMobile` 반환 타입 (boolean) — Task 2 정의와 Task 4 / 7 / 8 의 분기 일치 ✅
- `useSidebarShortcut` (no args, no return) — Task 8 정의와 MainLayout 호출 일치 ✅
- `SidebarTrigger` (no args) — Task 4 정의와 MainLayout 사용 일치 ✅
- `isPathActive` / `hasActiveDescendant` — Task 3 에 정의, Task 5 / 6 에서 named import ✅
- localStorage 키 `sidebar-storage` — 기존 `theme-storage` 와 동일 컨벤션 ✅

자가 검토 통과.
