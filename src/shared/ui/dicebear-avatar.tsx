/**
 * DiceBear Avatar Component
 * DiceBear 라이브러리를 사용한 아바타 컴포넌트
 */

import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import {
  avataaars,
  avataaarsNeutral,
  bottts,
  botttsNeutral,
  glass,
  icons,
  identicon,
  initials,
  lorelei,
  openPeeps,
  pixelArt,
  pixelArtNeutral,
  rings,
  shapes,
  thumbs,
} from '@dicebear/collection'

import { cn } from '@/shared/lib/utils'

// Available avatar styles
export const AVATAR_STYLES = {
  avataaars: { name: 'Avataaars', style: avataaars },
  avataaarsNeutral: { name: 'Avataaars Neutral', style: avataaarsNeutral },
  bottts: { name: 'Bottts', style: bottts },
  botttsNeutral: { name: 'Bottts Neutral', style: botttsNeutral },
  glass: { name: 'Glass', style: glass },
  icons: { name: 'Icons', style: icons },
  identicon: { name: 'Identicon', style: identicon },
  initials: { name: 'Initials', style: initials },
  lorelei: { name: 'Lorelei', style: lorelei },  
  openPeeps: { name: 'Open Peeps', style: openPeeps },
  pixelArt: { name: 'Pixel Art', style: pixelArt },
  pixelArtNeutral: { name: 'Pixel Art Neutral', style: pixelArtNeutral },
  rings: { name: 'Rings', style: rings },
  shapes: { name: 'Shapes', style: shapes },
  thumbs: { name: 'Thumbs', style: thumbs },
} as const

export type AvatarStyleKey = keyof typeof AVATAR_STYLES

// Default style
export const DEFAULT_AVATAR_STYLE: AvatarStyleKey = 'initials'

// Recommended styles for profile selection (subset of all styles)
export const RECOMMENDED_AVATAR_STYLES: AvatarStyleKey[] = [
  'initials',
  'bottts',
  'pixelArt',
  'identicon',
  'shapes',
  'thumbs',
]

interface DiceBearAvatarProps {
  /** Seed for avatar generation (usually email or username) */
  seed: string
  /** Avatar style */
  style?: AvatarStyleKey
  /** Size in pixels */
  size?: number
  /** User name (used for initials style) */
  name?: string
  /** Additional class names */
  className?: string
}

export function DiceBearAvatar({
  seed,
  style = DEFAULT_AVATAR_STYLE,
  size = 32,
  name,
  className,
}: DiceBearAvatarProps) {
  const avatarSvg = useMemo(() => {
    const styleConfig = AVATAR_STYLES[style]
    if (!styleConfig) {
      return null
    }

    // For initials style, use name as seed to show the first character
    const avatarSeed = style === 'initials' && name ? name : seed

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avatar = createAvatar(styleConfig.style as any, {
      seed: avatarSeed,
      size,
      // For initials style, show only 1 character
      ...(style === 'initials' ? { chars: 1 } : {}),
    })

    return avatar.toDataUri()
  }, [seed, style, size, name])

  if (!avatarSvg) {
    return null
  }

  return (
    <img
      src={avatarSvg}
      alt="Avatar"
      width={size}
      height={size}
      className={cn('rounded-full', className)}
    />
  )
}

/** Generate avatar data URI for a given seed and style */
export function generateAvatarDataUri(
  seed: string,
  style: AvatarStyleKey = DEFAULT_AVATAR_STYLE,
  size = 32
): string {
  const styleConfig = AVATAR_STYLES[style]
  if (!styleConfig) {
    return ''
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const avatar = createAvatar(styleConfig.style as any, {
    seed,
    size,
  })

  return avatar.toDataUri()
}
