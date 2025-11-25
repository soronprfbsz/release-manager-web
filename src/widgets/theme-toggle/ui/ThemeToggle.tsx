import { useState, useRef, useCallback } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { useTheme } from '@/app/providers/ThemeProvider'

export function ThemeToggle() {
  const { setTheme } = useTheme()
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
        <DropdownMenuItem onClick={() => { setTheme('light'); setOpen(false) }}>
          라이트
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme('dark'); setOpen(false) }}>
          다크
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
