import { apiClient } from '@/shared/api/client'
import type { LinkResource, LinkResourceCreateRequest } from '../model/types'

const ENDPOINTS = {
    list: '/api/resources/links',
    detail: (id: number) => `/api/resources/links/${id}`,
    reorder: '/api/resources/links/order',
} as const

export const linkResourceApi = {
    /** 링크 리소스 목록 조회 */
    getList: async (linkCategory?: string): Promise<LinkResource[]> => {
        const params = linkCategory ? { linkCategory } : undefined
        try {
            const response = await apiClient.get<LinkResource[]>(ENDPOINTS.list, { params })
            return response
        } catch (error) {
            console.warn('Link Resource API failed, using mock data:', error)
            // Mock data matching new LinkResource interface
            const allMocks: LinkResource[] = [
                {
                    resourceLinkId: 1,
                    linkCategory: 'infraeye2',
                    subCategory: 'notion',
                    linkName: 'Infraeye2 Requirements',
                    linkUrl: 'https://notion.so/ie2-req',
                    description: 'Requirements document',
                    sortOrder: 1,
                    createdAt: new Date().toISOString()
                },
                {
                    resourceLinkId: 2,
                    linkCategory: 'infrastructure',
                    subCategory: 'dashboard',
                    linkName: 'Grafana Dashboard',
                    linkUrl: 'https://grafana.example.com',
                    description: 'Main monitoring dashboard',
                    sortOrder: 1,
                    createdAt: new Date().toISOString()
                }
            ]

            if (linkCategory) {
                return allMocks.filter(r => r.linkCategory === linkCategory)
            }
            return allMocks
        }
    },

    /** 링크 리소스 생성 */
    create: async (data: LinkResourceCreateRequest): Promise<LinkResource> => {
        const response = await apiClient.post<LinkResource>(ENDPOINTS.list, data)
        return response
    },

    /** 링크 리소스 상세 조회 */
    getDetail: async (id: number): Promise<LinkResource> => {
        const response = await apiClient.get<LinkResource>(ENDPOINTS.detail(id))
        return response
    },

    /** 링크 리소스 수정 */
    update: async (id: number, data: LinkResourceCreateRequest): Promise<LinkResource> => {
        const response = await apiClient.put<LinkResource>(ENDPOINTS.detail(id), data)
        return response
    },

    /** 링크 리소스 삭제 */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(ENDPOINTS.detail(id))
    },

    /** 링크 리소스 순서 변경 */
    reorder: async (linkCategory: string, resourceLinkIds: number[]): Promise<void> => {
        await apiClient.patch(ENDPOINTS.reorder, { linkCategory, resourceLinkIds })
    },
}
