import axios from 'axios'

import type { ApiResponse } from '@/shared/api/types'
import { API_BASE_URL } from '@/shared/config/constants'

import type {
  SignUpRequest,
  SignUpResponse,
  SignInRequest,
  AccessTokenResponse,
} from '../model/types'

const ENDPOINTS = {
  signup: '/api/auth/signup',
  signin: '/api/auth/signin',
  refresh: '/api/auth/refresh',
  logout: '/api/auth/logout',
} as const

const authAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const sessionApi = {
  /** 회원가입 */
  signUp: async (data: SignUpRequest): Promise<ApiResponse<SignUpResponse>> => {
    const response = await authAxios.post<ApiResponse<SignUpResponse>>(ENDPOINTS.signup, data)
    return response.data
  },

  /** 로그인 */
  signIn: async (data: SignInRequest): Promise<ApiResponse<AccessTokenResponse>> => {
    const response = await authAxios.post<ApiResponse<AccessTokenResponse>>(ENDPOINTS.signin, data)
    return response.data
  },

  /** 토큰 갱신 */
  refresh: async (): Promise<ApiResponse<AccessTokenResponse>> => {
    const response = await authAxios.post<ApiResponse<AccessTokenResponse>>(ENDPOINTS.refresh)
    return response.data
  },

  /** 로그아웃 */
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await authAxios.post<ApiResponse<{ message: string }>>(ENDPOINTS.logout)
    return response.data
  },
}
