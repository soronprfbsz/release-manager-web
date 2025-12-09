/**
 * Auth Store (Zustand)
 * 인증 상태 및 사용자 정보 관리
 */

import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

import { sessionApi, type AccountInfo, type SignUpRequest } from '@/entities/session'

import { apiClient } from '@/shared/api'
import { ROUTES } from '@/shared/config/constants'

interface AuthState {
  // State
  user: AccountInfo | null
  isLoading: boolean

  // Computed
  isAuthenticated: () => boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignUpRequest) => Promise<void>
  logout: () => Promise<void>
  initAuth: () => Promise<void>
  handleAuthFailure: () => void
  setUser: (user: AccountInfo | null) => void
  setIsLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isLoading: true,

        // Computed
        isAuthenticated: () => get().user !== null,

        // Actions
        setUser: (user) => set({ user }, false, 'setUser'),

        setIsLoading: (isLoading) => set({ isLoading }, false, 'setIsLoading'),

        handleAuthFailure: () => {
          apiClient.clearAccessToken()
          set({ user: null }, false, 'handleAuthFailure')

          // 로그인 페이지로 이동 (현재 페이지가 로그인 페이지가 아닌 경우에만)
          if (window.location.pathname !== ROUTES.AUTH.LOGIN) {
            window.location.href = ROUTES.AUTH.LOGIN
          }
        },

        initAuth: async () => {
          const currentUser = get().user

          // Zustand persist에서 복원된 user가 있으면 refresh token 시도
          if (currentUser) {
            try {
              const response = await sessionApi.refresh()
              apiClient.setAccessToken(response.data.accessToken)
              const accountInfo = response.data.accountInfo
              set({ user: accountInfo, isLoading: false }, false, 'initAuth/success')
            } catch {
              apiClient.clearAccessToken()
              set({ user: null, isLoading: false }, false, 'initAuth/failure')
            }
          } else {
            set({ isLoading: false }, false, 'initAuth/noSavedUser')
          }
        },

        login: async (email: string, password: string) => {
          const response = await sessionApi.signIn({ email, password })
          const { accessToken, accountInfo } = response.data

          apiClient.setAccessToken(accessToken)
          set({ user: accountInfo }, false, 'login')
        },

        signup: async (data: SignUpRequest) => {
          await sessionApi.signUp(data)
        },

        logout: async () => {
          try {
            await sessionApi.logout()
          } catch {
            // 로그아웃 API 실패해도 로컬 상태는 초기화
          } finally {
            apiClient.clearAccessToken()
            set({ user: null }, false, 'logout')
          }
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: 'AuthStore' }
  )
)

// Initialize auth on store creation
let initPromise: Promise<void> | null = null

export const initializeAuth = () => {
  if (!initPromise) {
    const { handleAuthFailure, initAuth } = useAuthStore.getState()
    // apiClient에 인증 실패 콜백 등록
    apiClient.setAuthFailureCallback(handleAuthFailure)
    initPromise = initAuth()
  }
  return initPromise
}
