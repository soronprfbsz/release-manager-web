import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

import { sessionApi } from '@/entities/auth/session'

import { API_BASE_URL, API_TIMEOUT } from '@/shared/config/constants'

import type { ApiResponse, ApiError } from './types'

// 인증 실패 시 호출되는 콜백 (AuthProvider에서 설정)
type AuthFailureCallback = () => void

class ApiClient {
  private instance: AxiosInstance
  private accessToken: string | null = null // in-memory 저장
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (error?: unknown) => void
  }> = []
  private onAuthFailure: AuthFailureCallback | null = null

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT.DEFAULT,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  private processQueue(error: AxiosError | null, token: string | null = null): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve(token)
      }
    })
    this.failedQueue = []
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<unknown>>) => {
        return response
      },
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        // 401 에러 처리
        if (error.response?.status === 401) {
          // 이미 재시도한 요청이 또 401이면 바로 로그인 페이지로 이동
          if (originalRequest._retry) {
            this.clearAccessToken()
            this.handleAuthFailureWithFallback()
            return Promise.reject(error)
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`
                }
                return this.instance(originalRequest)
              })
              .catch((err) => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const response = await sessionApi.refresh()
            const { accessToken } = response.data
            this.setAccessToken(accessToken)
            this.processQueue(null, accessToken)

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
            }
            return this.instance(originalRequest)
          } catch (refreshError) {
            this.processQueue(refreshError as AxiosError, null)
            this.clearAccessToken()
            // AuthProvider에서 설정한 콜백 호출 (로그아웃 처리 및 로그인 페이지 이동)
            this.handleAuthFailureWithFallback()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // 백엔드 에러 응답 처리
        if (error.response?.data) {
          const apiError = error.response.data as ApiError
          if (apiError.status === 'fail' || apiError.status === 'error') {
            // 백엔드에서 전달한 에러 메시지를 Error 객체로 변환
            const errorMessage = apiError.data.message || 'An error occurred'
            const customError = new Error(errorMessage) as Error & {
              code?: string
              detail?: unknown
            }
            customError.code = apiError.data.code
            customError.detail = apiError.data.detail
            console.error('API Error:', errorMessage, apiError.data)
            return Promise.reject(customError)
          }
        }

        // 기본 에러 처리
        const errorMessage = error.message || 'An error occurred'
        console.error('API Error:', errorMessage)
        return Promise.reject(new Error(errorMessage))
      }
    )
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  setAccessToken(token: string): void {
    this.accessToken = token
  }

  clearAccessToken(): void {
    this.accessToken = null
  }

  setAuthFailureCallback(callback: AuthFailureCallback): void {
    this.onAuthFailure = callback
  }

  // 인증 실패 처리 (콜백이 없으면 직접 로그인 페이지로 이동)
  private handleAuthFailureWithFallback(): void {
    if (this.onAuthFailure) {
      this.onAuthFailure()
    } else {
      // 콜백이 등록되지 않은 경우 직접 리다이렉트
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url, config)
    return response.data.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config)
    return response.data.data
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async upload<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig & {
      onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
      timeout?: number
    }
  ): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        // 커스텀 헤더(예: X-Progress-Id) 를 병합한 뒤 Content-Type 고정
        ...(config?.headers ?? {}),
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: config?.onUploadProgress,
      timeout: config?.timeout || undefined,
    })
    return response.data.data
  }

  getAxiosInstance(): AxiosInstance {
    return this.instance
  }
}

export const apiClient = new ApiClient()
