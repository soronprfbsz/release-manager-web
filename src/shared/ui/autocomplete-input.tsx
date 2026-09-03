/**
 * Autocomplete Input Component
 * datalist 기반 자동완성을 지원하는 Input 컴포넌트
 */

import * as React from 'react'
import { useId } from 'react'

import { cn } from '@/shared/lib/utils'

export interface AutocompleteInputProps
  extends Omit<React.ComponentProps<'input'>, 'list'> {
  /** 자동완성 목록 (문자열 또는 숫자 배열) */
  suggestions?: (string | number)[]
}

const AutocompleteInput = React.forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ className, type, suggestions = [], ...props }, ref) => {
    const datalistId = useId()

    return (
      <>
        <input
          type={type}
          autoComplete="off"
          list={suggestions.length > 0 ? datalistId : undefined}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
          )}
          ref={ref}
          {...props}
        />
        {suggestions.length > 0 && (
          <datalist id={datalistId}>
            {suggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        )}
      </>
    )
  }
)
AutocompleteInput.displayName = 'AutocompleteInput'

export { AutocompleteInput }
