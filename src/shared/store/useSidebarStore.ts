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
