/**
 * Avatar Component
 * 사용자 아바타 (이미지 또는 이니셜 기반)
 */

import * as React from 'react'

import { cn } from '@/shared/lib/utils'

// 이름 기반 색상 생성 (일관된 색상 매핑)
const AVATAR_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
] as const

function getColorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

function getInitials(name: string): string {
  if (!name) return '?'
  const trimmed = name.trim()
  return trimmed.charAt(0).toUpperCase()
}

// ===== New Composable Avatar (Radix-style) =====

interface AvatarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const AvatarRoot = React.forwardRef<HTMLDivElement, AvatarRootProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AvatarRoot.displayName = 'Avatar'

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt = '', ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false)

    // Reset error state when src changes
    React.useEffect(() => {
      setHasError(false)
    }, [src])

    if (!src || hasError) {
      return null
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn('aspect-square h-full w-full object-cover', className)}
        onError={() => setHasError(true)}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = 'AvatarImage'

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AvatarFallback.displayName = 'AvatarFallback'

// ===== Legacy Avatar (backward compatible) =====

interface LegacyAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
}

function LegacyAvatar({ name, size = 'md', className, ...props }: LegacyAvatarProps) {
  const initials = getInitials(name)
  const colorClass = getColorFromName(name)

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-white font-medium select-none',
        sizeClasses[size],
        colorClass,
        className
      )}
      {...props}
    >
      {initials}
    </div>
  )
}

// Export both patterns
export { AvatarRoot as Avatar, AvatarImage, AvatarFallback, LegacyAvatar }
