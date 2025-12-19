/**
 * Category Color Utilities
 * 카테고리별 색상 유틸리티 - chart 변수 기반으로 테마 대응
 *
 * chart-1 ~ chart-5 CSS 변수를 순환하여 카테고리별 색상 적용
 * 테마(light/dark)에 따라 자동으로 적절한 색상 적용됨
 */

const CHART_COLORS = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const

type ChartColor = (typeof CHART_COLORS)[number]

/**
 * 인덱스 기반 chart 색상 변수 반환
 * @param index - 카테고리 인덱스 (0부터 시작)
 * @returns chart 색상 변수명 (예: 'chart-1')
 */
export function getChartColorByIndex(index: number): ChartColor {
  return CHART_COLORS[index % CHART_COLORS.length]
}

/**
 * 카테고리 인덱스 기반 카드 배경 색상 클래스 반환
 * @param index - 카테고리 인덱스 (0부터 시작)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCategoryCardColorClass(index: number): string {
  const chartColor = getChartColorByIndex(index)
  return `border-[hsl(var(--${chartColor})/0.3)] bg-[hsl(var(--${chartColor})/0.1)] hover:border-[hsl(var(--${chartColor})/0.5)] hover:bg-[hsl(var(--${chartColor})/0.15)]`
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
  const chartColor = getChartColorByIndex(index)
  return `text-[hsl(var(--${chartColor}))]`
}

/**
 * 카테고리 인덱스 기반 배지 색상 클래스 반환
 * @param index - 카테고리 인덱스 (0부터 시작)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCategoryBadgeColorClass(index: number): string {
  const chartColor = getChartColorByIndex(index)
  return `bg-[hsl(var(--${chartColor})/0.1)] text-[hsl(var(--${chartColor}))] border-[hsl(var(--${chartColor})/0.3)]`
}

/**
 * 카테고리 인덱스 기반 그룹 헤더 아이콘 배경 색상 클래스 반환
 * @param index - 카테고리 인덱스 (0부터 시작)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCategoryIconBgColorClass(index: number): string {
  const chartColor = getChartColorByIndex(index)
  return `bg-[hsl(var(--${chartColor})/0.1)]`
}

/**
 * 카테고리 인덱스 기반 아이콘 색상 클래스 반환
 * @param index - 카테고리 인덱스 (0부터 시작)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCategoryIconColorClass(index: number): string {
  const chartColor = getChartColorByIndex(index)
  return `text-[hsl(var(--${chartColor}))]`
}
