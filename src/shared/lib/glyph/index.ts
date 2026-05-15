/**
 * Glyph Color Palette & Resolver (Shared)
 * 글리프 배지 색상 정의 및 fallback 해석기 — 도메인 독립적 버전
 */

/**
 * 글리프 색상 팔레트 항목
 */
export interface GlyphColorEntry {
  key: string
  label: string
  /** 색상 선택 UI 에서 쓰이는 swatch 배경 클래스 */
  swatchClass: string
  /** 카드 글리프 배지에 적용되는 배경+텍스트 클래스 */
  glyphClass: string
}

/**
 * 글리프 색상 팔레트 (10가지) — 명확히 구분되는 색상만 채택.
 * light/dark 테마 모두 자연스럽게 보이도록 100/700, 950/300 으로 짝지음.
 */
export const GLYPH_COLORS: GlyphColorEntry[] = [
  {
    key: 'mint',
    label: '민트',
    swatchClass: 'bg-emerald-200 dark:bg-emerald-800',
    glyphClass:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  {
    key: 'teal',
    label: '틸',
    swatchClass: 'bg-teal-200 dark:bg-teal-800',
    glyphClass:
      'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
  },
  {
    key: 'sky',
    label: '스카이',
    swatchClass: 'bg-sky-200 dark:bg-sky-800',
    glyphClass:
      'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  },
  {
    key: 'indigo',
    label: '인디고',
    swatchClass: 'bg-indigo-200 dark:bg-indigo-800',
    glyphClass:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  },
  {
    key: 'lavender',
    label: '라벤더',
    swatchClass: 'bg-violet-200 dark:bg-violet-800',
    glyphClass:
      'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  },
  {
    key: 'fuchsia',
    label: '푸시아',
    swatchClass: 'bg-fuchsia-200 dark:bg-fuchsia-800',
    glyphClass:
      'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/60 dark:text-fuchsia-300',
  },
  {
    key: 'rose',
    label: '로즈',
    swatchClass: 'bg-rose-200 dark:bg-rose-800',
    glyphClass:
      'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  },
  {
    key: 'peach',
    label: '피치',
    swatchClass: 'bg-orange-200 dark:bg-orange-800',
    glyphClass:
      'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
  },
  {
    key: 'lemon',
    label: '레몬',
    swatchClass: 'bg-yellow-200 dark:bg-yellow-800',
    glyphClass:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300',
  },
  {
    key: 'slate',
    label: '슬레이트',
    swatchClass: 'bg-slate-200 dark:bg-slate-700',
    glyphClass:
      'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
  },
]

/**
 * 이전 색상 키 → 새 키 alias (기존 DB 저장 데이터 호환)
 *  - sage (green)  → teal       (mint 와 너무 비슷해 교체)
 *  - lilac (purple) → indigo    (lavender 와 너무 비슷해 교체)
 *  - coral (red)   → fuchsia    (rose 와 너무 비슷해 교체)
 */
const COLOR_ALIASES: Record<string, string> = {
  sage: 'teal',
  lilac: 'indigo',
  coral: 'fuchsia',
}

/**
 * 색상 키로 팔레트 항목 조회 (alias 자동 변환)
 */
export function getGlyphColorEntry(key: string): GlyphColorEntry | undefined {
  const resolvedKey = COLOR_ALIASES[key] ?? key
  return GLYPH_COLORS.find((c) => c.key === resolvedKey)
}

/**
 * 이름 해시 기반 팔레트 인덱스 계산
 * char-code 합 % 10
 */
function hashName(name: string): number {
  let sum = 0
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i)
  }
  return sum % GLYPH_COLORS.length
}

/**
 * 도메인 독립적 글리프 텍스트 + 색상 클래스 해석기
 * - glyphText / glyphBackgroundColor 가 null/빈문자열이면 name 기반 fallback 적용
 */
export function resolveGlyph(item: {
  glyphText?: string | null
  glyphBackgroundColor?: string | null
  name: string
}): {
  text: string
  glyphClass: string
} {
  const text =
    item.glyphText && item.glyphText.trim().length > 0
      ? item.glyphText.trim()
      : item.name.charAt(0).toUpperCase()

  const colorKey =
    item.glyphBackgroundColor && item.glyphBackgroundColor.trim().length > 0
      ? item.glyphBackgroundColor.trim()
      : GLYPH_COLORS[hashName(item.name)].key

  const entry = getGlyphColorEntry(colorKey)
  const glyphClass = entry
    ? entry.glyphClass
    : GLYPH_COLORS[hashName(item.name)].glyphClass

  return { text, glyphClass }
}

/**
 * 글리프 텍스트 길이에 따라 폰트 크기 클래스 반환
 */
export function getGlyphFontSizeClass(text: string): string {
  if (text.length === 1) return 'text-base'
  if (text.length === 2) return 'text-sm'
  return 'text-xs'
}
