/**
 * Password Field Component
 * 비밀번호 입력 필드 + 표시 토글 (Eye/EyeOff). RHF FormField 내부에서 사용.
 */

import { useState } from 'react'

import { Eye, EyeOff, Lock } from 'lucide-react'


import { Button } from '@/shared/ui/button'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'

import type { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'

interface PasswordFieldProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>
  label: string
  placeholder?: string
  /** current-password | new-password */
  autoComplete?: string
}

export function PasswordField<TFieldValues extends FieldValues>({
  field,
  label,
  placeholder,
  autoComplete = 'new-password',
}: PasswordFieldProps<TFieldValues>) {
  const [show, setShow] = useState(false)

  return (
    <FormItem>
      <FormLabel className="flex items-center gap-1">
        <Lock className="h-3.5 w-3.5" />
        {label}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            type={show ? 'text' : 'password'}
            placeholder={placeholder}
            autoComplete={autoComplete}
            {...field}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShow(!show)}
          >
            {show ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}
