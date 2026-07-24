/**
 * SiteSelect — 사이트 검색 선택 공통 컴포넌트
 *
 * 제품 전역의 사이트 선택 콤보박스를 단일 컴포넌트로 통일한다.
 * - 고객사 / 내부 테스트로 그룹핑하여 표시 (그룹 헤딩 + 그룹 교차 검색)
 * - 값 키는 항상 siteCode. onChange 로 선택된 site 객체도 함께 전달해
 *   siteId 가 필요한 호출부는 site.siteId 로 변환한다.
 * - includeNone 으로 "없음" 단독 항목을 그룹 위에 표시 (센티널 값은 noneValue).
 *
 * sites 는 최소 구조(SiteSelectOption)만 만족하면 되므로, 전체 Site 타입뿐
 * 아니라 CustomPatchSite 처럼 경량 타입도 그대로 받을 수 있다. 제네릭이라
 * onChange 의 site 는 호출부가 넘긴 원본 타입을 그대로 돌려준다.
 */

import { Combobox, type ComboboxGroup } from '@/shared/ui/combobox'

import { SITE_CATEGORIES } from '../model/categories'

import type { SiteCategory } from '../model/types'

/** SiteSelect 가 요구하는 최소 사이트 형태 */
export interface SiteSelectOption {
  siteId: number
  siteCode: string
  siteName: string
  siteCategory: SiteCategory
}

export interface SiteSelectProps<T extends SiteSelectOption> {
  /** 표시 대상 사이트 목록 (활성 필터 등은 호출부에서 결정) */
  sites: T[]
  /** 선택된 siteCode. 미선택 시 '' 또는 noneValue */
  value: string
  /** (siteCode, site) — 미선택 항목 선택 시 site 는 null */
  onChange: (siteCode: string, site: T | null) => void
  /** "없음" 단독 항목 표시 여부 */
  includeNone?: boolean
  noneLabel?: string
  noneValue?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function SiteSelect<T extends SiteSelectOption>({
  sites,
  value,
  onChange,
  includeNone = false,
  noneLabel = '없음',
  noneValue = '__none__',
  placeholder = '사이트 선택...',
  searchPlaceholder = '사이트 검색...',
  emptyText = '결과가 없습니다.',
  disabled = false,
  className,
}: SiteSelectProps<T>) {
  const groups: ComboboxGroup[] = []

  if (includeNone) {
    groups.push({ options: [{ value: noneValue, label: noneLabel }] })
  }

  const toOption = (s: T) => ({
    value: s.siteCode,
    label: `${s.siteName} (${s.siteCode})`,
  })
  const byName = (a: T, b: T) => a.siteName.localeCompare(b.siteName, 'ko')

  const knownCategories = new Set<string>(SITE_CATEGORIES.map((c) => c.value))

  for (const cat of SITE_CATEGORIES) {
    const groupSites = sites.filter((s) => s.siteCategory === cat.value).sort(byName)
    if (groupSites.length === 0) continue
    groups.push({ heading: cat.label, options: groupSites.map(toOption) })
  }

  // 알 수 없는/누락된 카테고리 사이트는 그룹 없이 노출 (예: API 가 siteCategory 를
  // 아직 안 내려주는 배포 과도기) — 목록에서 사라지지 않도록 하는 안전망.
  const uncategorized = sites
    .filter((s) => !knownCategories.has(s.siteCategory))
    .sort(byName)
  if (uncategorized.length > 0) {
    groups.push({ options: uncategorized.map(toOption) })
  }

  const handleValueChange = (next: string) => {
    if (next === noneValue) {
      onChange(noneValue, null)
      return
    }
    const site = sites.find((s) => s.siteCode === next) ?? null
    onChange(next, site)
  }

  return (
    <Combobox
      groups={groups}
      value={value}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyText={emptyText}
      disabled={disabled}
      className={className}
    />
  )
}
