/**
 * Content Layout Constants
 * 컨텐츠 영역 공통 스타일 상수
 */

export const CONTENT_SPACING = {
  // 컨텐츠 카드 내부 패딩 (헤더 없을 때)
  CARD_PADDING: 'px-8 pt-8 pb-8',
  CARD_PADDING_X: 'px-8',
  CARD_PADDING_Y: 'pt-8 pb-8',
  // 헤더가 있을 때 컨텐츠 패딩 (수직 패딩 없음 - 내부 컨텐츠가 제어)
  CARD_PADDING_WITH_HEADER: 'px-8',

  // 헤더 패딩 (상단 패딩 + 컨텐츠와 작은 간격)
  HEADER_PADDING: 'px-8 pt-8 pb-3',

  // Split 레이아웃
  SPLIT_GAP: 'gap-6',
  /**
   * Split 패널 높이.
   *  ⟡ Backstage 셸 (flex chain) 에서는 부모 (PageLayout 의 flex-1 min-h-0) 가
   *    높이를 공급하므로 `h-full` 만으로 viewport-남은-공간을 채움.
   *  ⟡ 옛 NavigationBar 기반의 `calc(100vh-18rem)` 매직 넘버는 폐기.
   *  ⟡ 최소 높이는 400px 로 안전망 — PageLayout 외부에서 쓰여도 깨지지 않도록.
   */
  SPLIT_HEIGHT: 'h-full min-h-[400px]',
} as const
