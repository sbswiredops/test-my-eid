import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import type { ApiResponse } from '@/lib/types';

export class HomeCategoryService {
    async create(data: FormData | Record<string, any>): Promise<ApiResponse<any>> {
        if (typeof FormData !== 'undefined' && data instanceof FormData) {
            return apiClient.post<any>(API_CONFIG.ENDPOINTS.HOMECATEGORY_CREATE, data);
        }
        return apiClient.post<any>(API_CONFIG.ENDPOINTS.HOMECATEGORY_CREATE, data);
    }

    async getAll(): Promise<ApiResponse<any>> {
        return apiClient.get<any>(API_CONFIG.ENDPOINTS.HOMECATEGORY);
    }

    async getById(id: string): Promise<ApiResponse<any>> {
        return apiClient.get<any>(API_CONFIG.ENDPOINTS.HOMECATEGORY_BY_ID(id));
    }

    async update(id: string, data: FormData | Record<string, any>): Promise<ApiResponse<any>> {
        if (typeof FormData !== 'undefined' && data instanceof FormData) {
            return apiClient.put<any>(API_CONFIG.ENDPOINTS.HOMECATEGORY_UPDATE(id), data);
        }
        return apiClient.put<any>(API_CONFIG.ENDPOINTS.HOMECATEGORY_UPDATE(id), data);
    }

    async delete(id: string): Promise<ApiResponse<null>> {
        return apiClient.delete(API_CONFIG.ENDPOINTS.HOMECATEGORY_DELETE(id));
    }
}

export const homeCategoryService = new HomeCategoryService();
export default HomeCategoryService;
