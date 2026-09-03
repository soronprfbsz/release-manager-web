/**
 * GlyphBadge — 글리프 배지 공통 컴포넌트
 *
 * 도메인을 모른다. `glyphText` / `glyphBackgroundColor` / `name` 만 받아
 * `shared/lib/glyph` 의 해석기에 넘긴다 — 값이 없으면 이름 해시로 폴백한다.
 *
 * `size`
 *  - `sm` : 20px. 선택 목록(CommandItem / DropdownMenuItem)의 행 높이를 넘기지
 *           않는 크기다. 배지 때문에 행이 커지면 목록이 훑기 어려워진다.
 *  - `md` : 36px. 카드·목록의 기본 크기.
 */

import { resolveGlyph, getGlyphFontSizeClass } from '@/shared/lib/glyph'
import { cn } from '@/shared/lib/utils'

const SIZE_CLASS = {
  sm: 'h-5 w-5 rounded',
  md: 'h-9 w-9 rounded-md',
} as const

/**
 * sm 은 20px 안에 글자를 넣어야 하므로 md 의 사다리(text-base/sm/xs)를 쓸 수 없다.
 * 글리프는 최대 3자까지 들어온다.
 */
function smallFontClass(text: string): string {
  if (text.length === 1) return 'text-[11px]'
  if (text.length === 2) return 'text-[9px]'
  return 'text-[8px]'
}

interface GlyphBadgeProps {
  /** 글리프 값이 없을 때 폴백(첫 글자 + 색상 해시)에 쓰이는 이름 */
  name: string
  glyphText?: string | null
  glyphBackgroundColor?: string | null
  size?: keyof typeof SIZE_CLASS
  className?: string
}

export function GlyphBadge({
  name,
  glyphText,
  glyphBackgroundColor,
  size = 'md',
  className,
}: GlyphBadgeProps) {
  const { text, glyphClass } = resolveGlyph({ name, glyphText, glyphBackgroundColor })

  return (
    <span
      aria-hidden
      className={cn(
        'flex-shrink-0 inline-flex items-center justify-center',
        'font-mono font-semibold select-none leading-none',
        SIZE_CLASS[size],
        size === 'sm' ? smallFontClass(text) : getGlyphFontSizeClass(text),
        glyphClass,
        className,
      )}
    >
      {text}
    </span>
  )
}
