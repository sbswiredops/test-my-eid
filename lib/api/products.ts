import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import type { ApiResponse, Product } from '@/lib/types';

export class ProductService {
  async getAll(params?: Record<string, any>): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS, params);
  }

  async getById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id));
  }

  async getBySlug(slug: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(API_CONFIG.ENDPOINTS.PRODUCT_BY_SLUG(slug));
  }

  async create(data: FormData | Record<string, any>): Promise<ApiResponse<Product>> {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return apiClient.post<Product>(API_CONFIG.ENDPOINTS.PRODUCTS_CREATE, data);
    }
    return apiClient.post<Product>(API_CONFIG.ENDPOINTS.PRODUCTS_CREATE, data);
  }

  async update(id: string, data: FormData | Record<string, any>): Promise<ApiResponse<Product>> {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return apiClient.patch<Product>(API_CONFIG.ENDPOINTS.PRODUCT_UPDATE(id), data);
    }
    return apiClient.patch<Product>(API_CONFIG.ENDPOINTS.PRODUCT_UPDATE(id), data);
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.PRODUCT_DELETE(id));
  }

  async getLowStock(): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(API_CONFIG.ENDPOINTS.ADMIN_LOW_STOCK_PRODUCTS);
  }

  // Product size management
  async createSize(data: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.post(API_CONFIG.ENDPOINTS.PRODUCT_SIZE_CREATE, data);
  }

  async updateSize(id: string, data: Record<string, any>): Promise<ApiResponse<any>> {
    return apiClient.patch(API_CONFIG.ENDPOINTS.PRODUCT_SIZE_UPDATE(id), data);
  }

  async getSizeById(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(API_CONFIG.ENDPOINTS.PRODUCT_SIZE_BY_ID(id));
  }

  async deleteSize(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.PRODUCT_SIZE_DELETE(id));
  }

  async getSizes(): Promise<ApiResponse<any>> {
    return apiClient.get(API_CONFIG.ENDPOINTS.PRODUCT_SIZES);
  }
}

export const productService = new ProductService();
export default ProductService;
