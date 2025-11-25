import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { authApi } from '@/shared/api/authApi'
import { apiClient } from '@/shared/api/client'
import type { AccountInfo, SignUpRequest } from '@/shared/api/types'

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
  const [user, setUser] = useState<AccountInfo | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY)
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [isLoading, setIsLoading] = useState(true)

  // 초기 로드 시 토큰 유효성 확인
  useEffect(() => {
    const initAuth = async () => {
      const token = apiClient.getAccessToken()
      const savedUser = localStorage.getItem(USER_KEY)

      if (token && savedUser) {
        try {
          // 토큰 갱신 시도로 유효성 확인
          const response = await authApi.refresh()
          apiClient.setAccessToken(response.data.accessToken)
          setUser(response.data.accountInfo)
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.accountInfo))
        } catch {
          // 토큰이 유효하지 않으면 초기화
          apiClient.clearAccessToken()
          localStorage.removeItem(USER_KEY)
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.signIn({ email, password })
    const { accessToken, accountInfo } = response.data

    apiClient.setAccessToken(accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(accountInfo))
    setUser(accountInfo)
  }, [])

  const signup = useCallback(async (data: SignUpRequest) => {
    await authApi.signUp(data)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
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
