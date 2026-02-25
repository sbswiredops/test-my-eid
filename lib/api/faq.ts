import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import type { ApiResponse } from '@/lib/types';

export class FAQService {
    async getAll(params?: Record<string, any>): Promise<ApiResponse<any>> {
        return apiClient.get<any>(API_CONFIG.ENDPOINTS.FAQS, params);
    }

    async getById(id: string): Promise<ApiResponse<any>> {
        return apiClient.get<any>(API_CONFIG.ENDPOINTS.FAQ_BY_ID(id));
    }

    async create(data: FormData | Record<string, any>): Promise<ApiResponse<any>> {
        if (typeof FormData !== 'undefined' && data instanceof FormData) {
            return apiClient.post<any>(API_CONFIG.ENDPOINTS.FAQS_CREATE, data);
        }
        return apiClient.post<any>(API_CONFIG.ENDPOINTS.FAQS_CREATE, data);
    }

    async update(id: string, data: FormData | Record<string, any>): Promise<ApiResponse<any>> {
        if (typeof FormData !== 'undefined' && data instanceof FormData) {
            return apiClient.patch<any>(API_CONFIG.ENDPOINTS.FAQ_UPDATE(id), data);
        }
        return apiClient.patch<any>(API_CONFIG.ENDPOINTS.FAQ_UPDATE(id), data);
    }

    async delete(id: string): Promise<ApiResponse<null>> {
        return apiClient.delete(API_CONFIG.ENDPOINTS.FAQ_DELETE(id));
    }

    async search(query: string): Promise<ApiResponse<any>> {
        return apiClient.post<any>(API_CONFIG.ENDPOINTS.FAQS_SEARCH, { query });
    }

    async feedback(id: string, feedback: any): Promise<ApiResponse<any>> {
        return apiClient.post<any>(API_CONFIG.ENDPOINTS.FAQ_FEEDBACK(id), feedback);
    }

    async getPopular(): Promise<ApiResponse<any>> {
        return apiClient.get<any>(API_CONFIG.ENDPOINTS.FAQS_POPULAR);
    }

    async getByType(type: string): Promise<ApiResponse<any>> {
        return apiClient.get<any>(API_CONFIG.ENDPOINTS.FAQS_BY_TYPE(type));
    }

    async getStatistics(): Promise<ApiResponse<any>> {
        return apiClient.get<any>(API_CONFIG.ENDPOINTS.FAQS_STATISTICS);
    }

    async getRelated(id: string): Promise<ApiResponse<any>> {
        return apiClient.get<any>(API_CONFIG.ENDPOINTS.FAQS_RELATED(id));
    }

    async remove(data: any): Promise<ApiResponse<any>> {
        return apiClient.post<any>(API_CONFIG.ENDPOINTS.FAQS_REMOVE, data);
    }

    async reorder(data: any): Promise<ApiResponse<any>> {
        return apiClient.post<any>(API_CONFIG.ENDPOINTS.FAQS_REORDER, data);
    }

    async bulk(data: any): Promise<ApiResponse<any>> {
        return apiClient.post<any>(API_CONFIG.ENDPOINTS.FAQS_BULK, data);
    }

    async restore(id: string): Promise<ApiResponse<any>> {
        return apiClient.post<any>(API_CONFIG.ENDPOINTS.FAQ_RESTORE(id));
    }
}

export const faqService = new FAQService();
export default FAQService;
