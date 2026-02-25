import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import { ApiResponse, Order } from '@/lib/types';

export class OrderService {
  async create(data: any): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(API_CONFIG.ENDPOINTS.ORDERS_CREATE, data);
  }

  async getAll(): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(API_CONFIG.ENDPOINTS.ORDERS);
  }

  async getMyOrders(): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(API_CONFIG.ENDPOINTS.ORDERS_MY);
  }

  async getMyStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ORDERS_MY_STATS);
  }

  async getById(id: string): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(API_CONFIG.ENDPOINTS.ORDER_BY_ID(id));
  }

  async getByOrderId(orderId: string): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(API_CONFIG.ENDPOINTS.ORDER_BY_ORDER_ID(orderId));
  }

  async updateStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    return apiClient.patch<Order>(API_CONFIG.ENDPOINTS.ORDER_UPDATE_STATUS(id), { status });
  }

  async cancel(id: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(API_CONFIG.ENDPOINTS.ORDER_CANCEL(id));
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
  }
}

export const orderService = new OrderService();
export default OrderService;
