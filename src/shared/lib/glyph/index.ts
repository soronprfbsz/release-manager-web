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
 * 10가지 파스텔 톤 글리프 색상 팔레트
 * light/dark 테마 모두 자연스럽게 보이도록 설계
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
    key: 'lavender',
    label: '라벤더',
    swatchClass: 'bg-violet-200 dark:bg-violet-800',
    glyphClass:
      'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  },
  {
    key: 'peach',
    label: '피치',
    swatchClass: 'bg-orange-200 dark:bg-orange-800',
    glyphClass:
      'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
  },
  {
    key: 'sky',
    label: '스카이',
    swatchClass: 'bg-sky-200 dark:bg-sky-800',
    glyphClass:
      'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  },
  {
    key: 'lemon',
    label: '레몬',
    swatchClass: 'bg-yellow-200 dark:bg-yellow-800',
    glyphClass:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300',
  },
  {
    key: 'rose',
    label: '로즈',
    swatchClass: 'bg-rose-200 dark:bg-rose-800',
    glyphClass:
      'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  },
  {
    key: 'coral',
    label: '코랄',
    swatchClass: 'bg-red-200 dark:bg-red-800',
    glyphClass:
      'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300',
  },
  {
    key: 'sage',
    label: '세이지',
    swatchClass: 'bg-green-200 dark:bg-green-800',
    glyphClass:
      'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300',
  },
  {
    key: 'lilac',
    label: '라일락',
    swatchClass: 'bg-purple-200 dark:bg-purple-800',
    glyphClass:
      'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
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
 * 색상 키로 팔레트 항목 조회
 */
export function getGlyphColorEntry(key: string): GlyphColorEntry | undefined {
  return GLYPH_COLORS.find((c) => c.key === key)
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
