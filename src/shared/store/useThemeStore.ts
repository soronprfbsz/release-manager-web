/**
 * Theme Store (Zustand)
 * 테마 설정 관리
 */

import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

export type Theme =
  | 'black'
  | 'white'
  | 'dracula'
  | 'nord'
  | 'gruvbox'
  | 'system'

interface ThemeState {
  // State
  theme: Theme

  // Actions
  setTheme: (theme: Theme) => void
}

const darkThemes: Theme[] = [
  'black',
  'dracula',
  'nord',
  'gruvbox',
]

const applyThemeToDOM = (theme: Theme) => {
  const root = window.document.documentElement

  // 모든 테마 관련 클래스 제거
  root.classList.remove(
    'light',
    'dark',
    'white',
    'black',
    'dracula',
    'nord',
    'gruvbox'
  )

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'black'
      : 'white'

    if (systemTheme === 'black') {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }
    root.classList.add(systemTheme)
    return
  }

  // dark 계열 테마는 'dark' 클래스 추가, light 계열은 'light' 클래스 추가
  if (darkThemes.includes(theme)) {
    root.classList.add('dark')
  } else {
    root.classList.add('light')
  }

  // 테마 이름 클래스 추가
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
