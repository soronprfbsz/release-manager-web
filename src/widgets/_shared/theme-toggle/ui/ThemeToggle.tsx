import { Moon, Sun } from 'lucide-react'

import { useThemeStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'

/**
 * Theme toggle — Backstage redesign
 * Light / Dark 2-state, 단일 클릭 토글. 현재 모드의 반대 아이콘을 표시.
 */
export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  const isDark = theme === 'dark'
  const next: 'light' | 'dark' = isDark ? 'light' : 'dark'

  return (
    <Button
      variant="ghost-icon"
      size="icon-sm"
      onClick={() => setTheme(next)}
      title={isDark ? 'Light 테마로 전환' : 'Dark 테마로 전환'}
    >
      {isDark ? (
        <Sun className="h-[1.1rem] w-[1.1rem]" />
      ) : (
        <Moon className="h-[1.1rem] w-[1.1rem]" />
      )}
      <span className="sr-only">테마 전환</span>
    </Button>
  )
}
