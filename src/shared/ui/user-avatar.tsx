/**
 * User Avatar Component
 * 사용자 아바타 또는 삭제된 사용자 아이콘을 표시하는 공통 컴포넌트
 */

import { UserX } from 'lucide-react'

import { DiceBearAvatar, DEFAULT_AVATAR_STYLE, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import { cn } from '@/shared/lib/utils'

interface UserAvatarProps {
    /** 사용자 이메일 (또는 이름) */
    email: string
    /** 사용자 이름 (initials 스타일에서 사용) */
    accountName?: string | null
    /** 아바타 스타일 (DiceBear) */
    avatarStyle?: string | null
    /** 아바타 시드 */
    avatarSeed?: string | null
    /** 삭제된 사용자 여부 */
    isDeleted?: boolean
    /** 크기 (px) */
    size?: number
    /** 추가 클래스 */
    className?: string
}

export function UserAvatar({
    email,
    accountName,
    avatarStyle,
    avatarSeed,
    isDeleted = false,
    size = 28,
    className,
}: UserAvatarProps) {
    if (isDeleted) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center rounded-full bg-muted flex-shrink-0',
                    className
                )}
                style={{ width: size, height: size }}
            >
                <UserX className="text-muted-foreground" style={{ width: size * 0.6, height: size * 0.6 }} />
            </div>
        )
    }

    return (
        <DiceBearAvatar
            seed={avatarSeed || email}
            style={(avatarStyle as AvatarStyleKey) || DEFAULT_AVATAR_STYLE}
            size={size}
            name={accountName || email}
            className={cn('flex-shrink-0', className)}
        />
    )
}
