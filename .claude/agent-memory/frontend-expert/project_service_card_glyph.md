---
name: 서비스 카드 글리프 배지 리뉴얼
description: ServiceCard 디자인 리뉴얼 + 글리프 배지(텍스트+색상) UI 구현 내역
type: project
---

서비스 카드를 새 디자인으로 리뉴얼하고, 글리프 배지 입력 UI를 폼에 추가했다.

**Why:** 백엔드에 glyphText / glyphBackgroundColor 필드가 추가되어 카드 좌상단에 배지를 표시하고 폼에서 입력할 수 있도록 함.

**How to apply:** 이후 Service 관련 기능 작업 시 `resolveGlyph()` / `GLYPH_COLORS` 는 `features/sharing/service-management/lib/glyph.ts` 에서 import 하고, entity 타입에는 `glyphText / glyphBackgroundColor` 가 포함되어 있음.

주요 변경:
- `entities/infrastructure/service/model/types.ts` — Service, ServiceCreateRequest, ServiceUpdateRequest 에 glyphText/glyphBackgroundColor 추가
- `entities/infrastructure/service/api/serviceApi.ts` — update 메서드를 patch → put 으로 변경 (PUT /api/services/{id})
- `features/sharing/service-management/lib/glyph.ts` (신규) — GLYPH_COLORS 10개, resolveGlyph(), getGlyphFontSizeClass()
- `features/sharing/service-management/model/types.ts` — ServiceFormData 에 glyphText/glyphBackgroundColor 추가
- `features/sharing/service-management/ui/ServiceCard.tsx` — 리뉴얼: 좌상단 글리프 배지, 호버 시 fade-in 액션/드래그핸들, 푸터 "+ 링크 추가"
- `features/sharing/service-management/ui/ServiceForm.tsx` — 글리프 텍스트 input(maxLength=3) + 색상 swatch 그리드 + 라이브 프리뷰
- `widgets/sharing/resource/service-tab/ui/ServiceTab.tsx` — INITIAL_SERVICE_FORM, handleEditService, submit request 에 글리프 필드 반영
