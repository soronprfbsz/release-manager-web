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
  /** 실제 DOM 에 적용된 모드 (terminal/syntax highlighter 등에서 참조)
   *  Light/Dark 만 있으니 theme 와 항상 동일하지만, 향후 system 도입 여지를 위해 분리. */
  resolvedTheme: Theme

  setTheme: (theme: Theme) => void
}

function applyThemeToDOM(theme: Theme): Theme {
  const root = window.document.documentElement
  // 기존/신규 모든 테마 클래스 제거
  root.classList.remove('light', 'dark', 'white', 'black', 'gruvbox', 'system')
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
          if (state?.theme) {
            // 기존 (white/black/gruvbox/system) 값이 저장되어 있어도 안전 매핑
            const legacy = state.theme as string
            const next: Theme =
              legacy === 'white' || legacy === 'light'
                ? 'light'
                : legacy === 'black' || legacy === 'gruvbox' || legacy === 'dark'
                ? 'dark'
                : (() => {
                    // 'system' 또는 기타 — OS preference 로 fallback
                    if (typeof window !== 'undefined' && window.matchMedia) {
                      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                    }
                    return 'dark'
                  })()
            const resolved = applyThemeToDOM(next)
            ;(state as ThemeState).theme = next
            ;(state as ThemeState).resolvedTheme = resolved
          } else {
            applyThemeToDOM('dark')
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
