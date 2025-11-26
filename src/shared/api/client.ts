import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_BASE_URL } from '@/shared/config/constants'
import type { ApiResponse, ApiError } from './types'
import { sessionApi } from '@/entities/session'

const ACCESS_TOKEN_KEY = 'accessToken'

class ApiClient {
  private instance: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (error?: unknown) => void
  }> = []

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
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

        if (error.response?.status === 401 && !originalRequest._retry) {
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
            window.location.href = '/login'
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
        console.error('API Error:', errorMessage)
        return Promise.reject(error)
      }
    )
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  }

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  }

  clearAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
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

  async download(url: string, filename: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  }

  getAxiosInstance(): AxiosInstance {
    return this.instance
  }
}

export const apiClient = new ApiClient()
