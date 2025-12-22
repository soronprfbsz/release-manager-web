import { useState, useRef, useCallback } from 'react'

import { Moon, Sun, Check } from 'lucide-react'

import { useThemeStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const [open, setOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    clearCloseTimeout()
    setOpen(true)
  }, [clearCloseTimeout])

  const handleMouseLeave = useCallback(() => {
    clearCloseTimeout()
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 150)
  }, [clearCloseTimeout])

  return (
    <DropdownMenu open={open} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.preventDefault()}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">테마 전환</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem onClick={() => { setTheme('white'); setOpen(false) }}>
          <div className="flex items-center gap-2 w-full">
            <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300" />
            <span className="flex-1">White</span>
            {theme === 'white' && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme('black'); setOpen(false) }}>
          <div className="flex items-center gap-2 w-full">
            <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-700" />
            <span className="flex-1">Black</span>
            {theme === 'black' && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme('gruvbox'); setOpen(false) }}>
          <div className="flex items-center gap-2 w-full">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#282828', borderWidth: '2px', borderColor: '#fabd2f' }} />
            <span className="flex-1">Gruvbox</span>
            {theme === 'gruvbox' && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
