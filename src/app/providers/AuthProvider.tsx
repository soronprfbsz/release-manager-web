import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'

import { sessionApi, type AccountInfo, type SignUpRequest } from '@/entities/session'

import { apiClient } from '@/shared/api'
import { ROUTES } from '@/shared/config/constants'

interface AuthContextType {
  user: AccountInfo | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignUpRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_KEY = 'user'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initRef = useRef(false)

  // 인증 실패 시 호출되는 콜백 (refresh token 만료 등)
  const handleAuthFailure = useCallback(() => {
    apiClient.clearAccessToken()
    localStorage.removeItem(USER_KEY)
    setUser(null)
    // 로그인 페이지로 이동 (현재 페이지가 로그인 페이지가 아닌 경우에만)
    if (window.location.pathname !== ROUTES.AUTH.LOGIN) {
      window.location.href = ROUTES.AUTH.LOGIN
    }
  }, [])

  useEffect(() => {
    // Strict Mode에서 두 번 실행 방지
    if (initRef.current) return

    // apiClient에 인증 실패 콜백 등록
    apiClient.setAuthFailureCallback(handleAuthFailure)

    const initAuth = async () => {
      const savedUser = localStorage.getItem(USER_KEY)

      // savedUser가 있으면 refresh token으로 accessToken 재발급 시도
      if (savedUser) {
        try {
          const response = await sessionApi.refresh()
          apiClient.setAccessToken(response.data.accessToken)
          setUser(response.data.accountInfo)
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.accountInfo))
        } catch {
          apiClient.clearAccessToken()
          localStorage.removeItem(USER_KEY)
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    initRef.current = true
    initAuth()
  }, [handleAuthFailure])

  const login = useCallback(async (email: string, password: string) => {
    const response = await sessionApi.signIn({ email, password })
    const { accessToken, accountInfo } = response.data

    apiClient.setAccessToken(accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(accountInfo))
    setUser(accountInfo)
  }, [])

  const signup = useCallback(async (data: SignUpRequest) => {
    await sessionApi.signUp(data)
  }, [])

  const logout = useCallback(async () => {
    try {
      await sessionApi.logout()
    } catch {
      // 로그아웃 API 실패해도 로컬 상태는 초기화
    } finally {
      apiClient.clearAccessToken()
      localStorage.removeItem(USER_KEY)
      setUser(null)
    }
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
