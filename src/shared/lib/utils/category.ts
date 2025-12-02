/**
 * 카테고리명을 짧은 표시명으로 변환
 */
export function getCategoryShortName(category: string): string {
  const shortNames: Record<string, string> = {
    DATABASE: 'DB',
    WEB: 'WEB',
    ENGINE: 'ENGINE',
    INSTALL: 'INSTALL',
  }

  return shortNames[category.toUpperCase()] || category
}
