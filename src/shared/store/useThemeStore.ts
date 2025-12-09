/**
 * Theme Store (Zustand)
 * 테마 설정 관리
 */

import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

export type Theme =
  | 'dark'
  | 'light'
  | 'solarized-dark'
  | 'monokai'
  | 'dracula'
  | 'nord'
  | 'gruvbox'
  | 'latte'
  | 'system'

interface ThemeState {
  // State
  theme: Theme

  // Actions
  setTheme: (theme: Theme) => void
}

const darkThemes: Theme[] = [
  'dark',
  'solarized-dark',
  'monokai',
  'dracula',
  'nord',
  'gruvbox',
]

const applyThemeToDOM = (theme: Theme) => {
  const root = window.document.documentElement

  root.classList.remove(
    'light',
    'dark',
    'solarized-dark',
    'monokai',
    'dracula',
    'nord',
    'gruvbox',
    'latte'
  )

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'

    root.classList.add(systemTheme)
    return
  }

  if (darkThemes.includes(theme)) {
    root.classList.add('dark')
  }

  root.classList.add(theme)
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        theme: 'system',

        // Actions
        setTheme: (theme: Theme) => {
          set({ theme }, false, 'setTheme')
          applyThemeToDOM(theme)
        },
      }),
      {
        name: 'theme-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ theme: state.theme }),
        onRehydrateStorage: () => (state) => {
          // 스토어 복원 후 테마 DOM 적용
          if (state?.theme) {
            applyThemeToDOM(state.theme)
          }
        },
      }
    ),
    { name: 'ThemeStore' }
  )
)

// 초기 테마 적용
const initialTheme = useThemeStore.getState().theme
applyThemeToDOM(initialTheme)
