/**
 * Theme Store (Zustand)
 * Backstage redesign — Light / Dark only. Dark 기본.
 */

import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface ThemeState {
  /** 사용자가 선택한 테마 */
  theme: Theme
  /** 실제 DOM 에 적용된 모드 — xterm / syntax highlighter 처럼 CSS 변수를 못 읽고
   *  JS 로 팔레트를 골라야 하는 곳에서 참조한다. */
  resolvedTheme: Theme

  setTheme: (theme: Theme) => void
}

function applyThemeToDOM(theme: Theme): Theme {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  return theme
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'dark',
        resolvedTheme: 'dark',

        setTheme: (theme: Theme) => {
          const resolvedTheme = applyThemeToDOM(theme)
          set({ theme, resolvedTheme }, false, 'setTheme')
        },
      }),
      {
        name: 'theme-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ theme: state.theme }),
        onRehydrateStorage: () => (state) => {
          // 저장값이 없거나 light 가 아니면 기본 dark — 알 수 없는 값이 DOM 에
          // 그대로 클래스로 붙는 것을 막는다
          const next: Theme = state?.theme === 'light' ? 'light' : 'dark'
          const resolved = applyThemeToDOM(next)

          if (state) {
            state.theme = next
            state.resolvedTheme = resolved
          }
        },
      }
    ),
    { name: 'ThemeStore' }
  )
)

// 초기 테마 적용 — 스토어 인스턴스화 직후
const initial = useThemeStore.getState()
const initialResolved = applyThemeToDOM(initial.theme)
useThemeStore.setState({ resolvedTheme: initialResolved })
