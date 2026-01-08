/**
 * Category Color Utilities
 * 카테고리별 색상 유틸리티 - theme-color 변수 기반으로 테마 대응
 *
 * theme-color-1 ~ theme-color-5 CSS 변수를 순환하여 카테고리별 색상 적용
 * 테마(light/dark)에 따라 자동으로 적절한 색상 적용됨
 * 차트 색상(chart-1~5)과 분리되어 독립적으로 관리 가능
 */

const THEME_COLORS = [
  'theme-color-1',
  'theme-color-2',
  'theme-color-3',
  'theme-color-4',
  'theme-color-5',
] as const

type ThemeColor = (typeof THEME_COLORS)[number]

/**
 * 인덱스 기반 theme-color 색상 변수 반환
 * @param index - 카테고리 인덱스 (0부터 시작)
 * @returns theme-color 색상 변수명 (e.g. 'theme-color-1')
 */
export function getThemeColorByIndex(index: number): ThemeColor {
  return THEME_COLORS[index % THEME_COLORS.length]
}

/**
 * 카테고리 인덱스 기반 카드 배경 색상 클래스 반환
 * @param index - 카테고리 인덱스 (0부터 시작)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCategoryCardColorClass(index: number): string {
  const colorNumber = (index % 5) + 1 // 1-5
  return `border-theme-color-${colorNumber}/30 bg-theme-color-${colorNumber}/10 hover:border-theme-color-${colorNumber}/50 hover:bg-theme-color-${colorNumber}/15`
}

/**
 * 카테고리 이름으로 인덱스를 계산하여 카드 색상 클래스 반환
 * @param categoryName - 카테고리 이름
 * @param allCategories - 전체 카테고리 목록 (순서 유지)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCategoryCardColorByName(
  categoryName: string,
  allCategories: string[]
): string {
  const index = allCategories.indexOf(categoryName)
  if (index === -1) {
    // 찾지 못한 경우 기본 색상
    return 'border-border bg-muted/50 hover:border-border hover:bg-muted/70'
  }
  return getCategoryCardColorClass(index)
}

/**
 * 카테고리 인덱스 기반 텍스트 색상 클래스 반환
 * @param index - 카테고리 인덱스 (0부터 시작)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCategoryTextColorClass(index: number): string {
  const colorNumber = (index % 5) + 1
  return `text-theme-color-${colorNumber}`
}

/**
 * 카테고리 인덱스 기반 배지 색상 클래스 반환
 * @param index - 카테고리 인덱스 (0부터 시작)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCategoryBadgeColorClass(index: number): string {
  const colorNumber = (index % 5) + 1
  return `bg-theme-color-${colorNumber}/10 text-theme-color-${colorNumber} border-theme-color-${colorNumber}/30`
}

/**
 * 카테고리 인덱스 기반 그룹 헤더 아이콘 배경 색상 클래스 반환
 * @param index - 카테고리 인덱스 (0부터 시작)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCategoryIconBgColorClass(index: number): string {
  const colorNumber = (index % 5) + 1
  return `bg-theme-color-${colorNumber}/10`
}

/**
 * 카테고리 인덱스 기반 아이콘 색상 클래스 반환
 * @param index - 카테고리 인덱스 (0부터 시작)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCategoryIconColorClass(index: number): string {
  const colorNumber = (index % 5) + 1
  return `text-theme-color-${colorNumber}`
}
