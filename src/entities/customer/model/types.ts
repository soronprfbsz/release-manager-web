/**
 * Customer Entity Types
 * 고객사 도메인 타입 정의
 */

export interface Customer {
  customerId: number
  customerCode: string
  customerName: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomerCreateRequest {
  customerCode: string
  customerName: string
  description?: string
  isActive?: boolean
}

export interface CustomerUpdateRequest {
  customerName?: string
  description?: string
  isActive?: boolean
}
