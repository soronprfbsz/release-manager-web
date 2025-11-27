import { useMutation } from '@tanstack/react-query'
import { sessionApi } from '../api/sessionApi'
import type { SignUpRequest, SignInRequest } from '../model/types'

// Mutation Hooks
export const useSignUp = () =>
  useMutation({
    mutationFn: (data: SignUpRequest) => sessionApi.signUp(data),
  })

export const useSignIn = () =>
  useMutation({
    mutationFn: (data: SignInRequest) => sessionApi.signIn(data),
  })

export const useLogout = () =>
  useMutation({
    mutationFn: () => sessionApi.logout(),
  })
