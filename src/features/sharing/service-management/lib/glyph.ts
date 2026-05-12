/**
 * Glyph helpers (service-management 레이어)
 * 실제 구현은 shared/lib/glyph 에 위치 — 여기서는 re-export 만 수행
 */

export type { GlyphColorEntry } from '@/shared/lib/glyph'
export {
  GLYPH_COLORS,
  getGlyphColorEntry,
  resolveGlyph as resolveGlyphBase,
  getGlyphFontSizeClass,
} from '@/shared/lib/glyph'

import type { Service } from '@/entities/infrastructure/service'
import { resolveGlyph as sharedResolveGlyph } from '@/shared/lib/glyph'

/**
 * Service 전용 resolveGlyph 어댑터
 * Service 타입을 shared resolveGlyph 의 generic 인터페이스로 변환
 */
export function resolveGlyph(
  service: Pick<Service, 'serviceName' | 'glyphText' | 'glyphBackgroundColor'>
): { text: string; glyphClass: string } {
  return sharedResolveGlyph({
    name: service.serviceName,
    glyphText: service.glyphText,
    glyphBackgroundColor: service.glyphBackgroundColor,
  })
}

// GLYPH_COLORS 는 위에서 re-export 됨
