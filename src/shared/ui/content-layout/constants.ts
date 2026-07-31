/**
 * Content Layout Constants
 * 컨텐츠 영역 공통 스타일 상수
 *
 * 여기가 레이아웃 여백의 단일 소스다. 화면별로 pt-6 / pb-7 을 직접 쓰지 말고
 * 이 상수를 가져다 쓸 것 — 그래야 이 파일 한 곳만 고쳐 전 화면이 함께 바뀐다.
 */

export const CONTENT_SPACING = {
  // 컨텐츠 카드 내부 패딩 (헤더 없을 때)
  CARD_PADDING: 'px-4 pt-4 pb-4',
  CARD_PADDING_X: 'px-4',
  CARD_PADDING_Y: 'pt-4 pb-4',
  // 헤더가 있을 때 컨텐츠 패딩 (수직 패딩 없음 - 내부 컨텐츠가 제어)
  CARD_PADDING_WITH_HEADER: 'px-4',

  // 헤더 패딩 (상단 패딩 + 컨텐츠와 작은 간격)
  HEADER_PADDING: 'px-4 pt-4 pb-2',

  // Split 레이아웃 — 좌/우 pane 사이 수평 간격
  SPLIT_GAP: 'gap-6',

  /* ---- 상세 패널 (사이트 상세 / 버전 상세 등) ----
     같은 구조를 화면마다 복붙하던 값들. 여기로 모아 한 번에 제어한다. */
  // 패널 루트 상단 여백
  DETAIL_PANEL_TOP: 'pt-4',
  // 타이틀(Hero + Meta Rail) 하단 여백 = 타이틀 영역과 첫 섹션 사이 간격
  DETAIL_HERO_BOTTOM: 'pb-5',
  // 섹션 사이 간격 — 구분선 없이 영역을 나눌 때의 표준 24px (8pt 그리드)
  DETAIL_SECTION_GAP: 'pt-6',
  DETAIL_SECTION_STACK: 'space-y-6',
} as const
