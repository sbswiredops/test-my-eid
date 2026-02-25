import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import type { ApiResponse, User, Order, Product } from '@/lib/types';

export class AdminService {
    async getDashboard(): Promise<ApiResponse<any>> {
        return apiClient.get<any>(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
    }

    async getUsers(params?: Record<string, any>): Promise<ApiResponse<User[]>> {
        return apiClient.get<User[]>(API_CONFIG.ENDPOINTS.ADMIN_USERS, params);
    }

    async updateUserRole(userId: string, role: string): Promise<ApiResponse<User>> {
        return apiClient.patch<User>(API_CONFIG.ENDPOINTS.ADMIN_UPDATE_USER_ROLE(userId), { role });
    }

    async deleteUser(userId: string): Promise<ApiResponse<null>> {
        return apiClient.delete(API_CONFIG.ENDPOINTS.ADMIN_DELETE_USER(userId));
    }

    async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
        return apiClient.get<Product[]>(API_CONFIG.ENDPOINTS.ADMIN_LOW_STOCK_PRODUCTS);
    }

    async getOrdersByDateRange(params: { startDate: string; endDate: string }): Promise<ApiResponse<Order[]>> {
        return apiClient.get<Order[]>(API_CONFIG.ENDPOINTS.ADMIN_ORDERS_DATE_RANGE, params);
    }
}

export const adminService = new AdminService();
export default AdminService;
