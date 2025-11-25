import axios from 'axios'
import { API_BASE_URL } from '@/shared/config/constants'
import type {
  ApiResponse,
  SignUpRequest,
  SignUpResponse,
  SignInRequest,
  AccessTokenResponse,
} from './types'

const authAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cookie 전송을 위해 필요
})

export const authApi = {
  signUp: async (data: SignUpRequest): Promise<ApiResponse<SignUpResponse>> => {
    const response = await authAxios.post<ApiResponse<SignUpResponse>>('/api/auth/signup', data)
    return response.data
  },

  signIn: async (data: SignInRequest): Promise<ApiResponse<AccessTokenResponse>> => {
    const response = await authAxios.post<ApiResponse<AccessTokenResponse>>('/api/auth/signin', data)
    return response.data
  },

  refresh: async (): Promise<ApiResponse<AccessTokenResponse>> => {
    const response = await authAxios.post<ApiResponse<AccessTokenResponse>>('/api/auth/refresh')
    return response.data
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await authAxios.post<ApiResponse<{ message: string }>>('/api/auth/logout')
    return response.data
  },
}
