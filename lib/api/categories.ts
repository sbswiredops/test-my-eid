import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import { ApiResponse, Category } from '@/lib/types';

export class CategoryService {
  async getAll(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES);
  }

  async getById(id: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id));
  }

  async getBySlug(slug: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(API_CONFIG.ENDPOINTS.CATEGORY_BY_SLUG(slug));
  }

  async create(data: FormData | Record<string, any>): Promise<ApiResponse<Category>> {
    // If FormData, send as is; else, send as JSON
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return apiClient.post<Category>(API_CONFIG.ENDPOINTS.CATEGORIES_CREATE, data);
    }
    return apiClient.post<Category>(API_CONFIG.ENDPOINTS.CATEGORIES_CREATE, data);
  }

  async update(id: string, data: FormData | Record<string, any>): Promise<ApiResponse<Category>> {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return apiClient.patch<Category>(API_CONFIG.ENDPOINTS.CATEGORY_UPDATE(id), data);
    }
    return apiClient.patch<Category>(API_CONFIG.ENDPOINTS.CATEGORY_UPDATE(id), data);
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.CATEGORY_DELETE(id));
  }
}

export const categoryService = new CategoryService();
export default CategoryService;
