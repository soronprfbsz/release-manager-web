import * as React from 'react'
import { Input } from './input'
import { normalizePhoneNumber, formatPhoneNumber } from '@/shared/lib/utils/phone'

export interface PhoneInputProps
  extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
  /** 정규화된 전화번호 (숫자만, 예: 01012345678) */
  value: string
  /** 정규화된 값으로 변경 이벤트 전달 */
  onChange: (value: string) => void
  /** 최대 숫자 길이 (기본값: 11) */
  maxDigits?: number
}

/**
 * 전화번호 입력 컴포넌트
 * - 입력 시 자동으로 하이픈 포맷팅 (010-1234-5678)
 * - 내부적으로 숫자만 저장 (01012345678)
 * - 휴대폰, 서울(02), 지역번호 모두 지원
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, maxDigits = 11, placeholder = '010-1234-5678', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const normalized = normalizePhoneNumber(e.target.value)
      if (normalized.length <= maxDigits) {
        onChange(normalized)
      }
    }

    return (
      <Input
        ref={ref}
        type="tel"
        value={formatPhoneNumber(value)}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxDigits + 2} // 하이픈 2개 포함
        {...props}
      />
    )
  }
)
PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
