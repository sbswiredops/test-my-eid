import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import type { ApiResponse, CartItem } from '@/lib/types';

export class CartService {
    async addItem(data: any): Promise<ApiResponse<any>> {
        return apiClient.post<any>(API_CONFIG.ENDPOINTS.CART_ADD, data);
    }

    async getCart(): Promise<ApiResponse<any>> {
        return apiClient.get<any>(API_CONFIG.ENDPOINTS.CART);
    }

    async clearCart(): Promise<ApiResponse<any>> {
        return apiClient.delete(API_CONFIG.ENDPOINTS.CART_CLEAR);
    }

    async getCount(): Promise<ApiResponse<number>> {
        return apiClient.get<number>(API_CONFIG.ENDPOINTS.CART_COUNT);
    }

    async updateCart(data: any): Promise<ApiResponse<any>> {
        return apiClient.patch<any>(API_CONFIG.ENDPOINTS.CART_UPDATE, data);
    }

    async removeItem(cartItemId: string): Promise<ApiResponse<any>> {
        return apiClient.delete(API_CONFIG.ENDPOINTS.CART_REMOVE_ITEM(cartItemId));
    }
}

export const cartService = new CartService();
export default CartService;
