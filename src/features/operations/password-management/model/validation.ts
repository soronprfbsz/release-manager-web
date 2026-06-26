/**
 * Password Management Validation
 * 비밀번호 변경 Zod 스키마 (자가 변경 / 강제 변경 공용)
 * 정책: NIST SP 800-63B 정렬 — 8~64자, 조합 비강제, 현재와 동일 금지 (PRD §8)
 */

import * as z from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력하세요.'),
    newPassword: z
      .string()
      .min(8, '새 비밀번호는 8자 이상이어야 합니다.')
      .max(64, '새 비밀번호는 64자 이하여야 합니다.'),
    confirmPassword: z.string().min(1, '새 비밀번호 확인을 입력하세요.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '새 비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
    path: ['newPassword'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
