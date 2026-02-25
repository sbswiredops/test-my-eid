import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import type { ApiResponse, User } from '@/lib/types';

export class UsersService {
    async getProfile(): Promise<ApiResponse<User>> {
        return apiClient.get<User>(API_CONFIG.ENDPOINTS.USERS_PROFILE);
    }

    async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
        return apiClient.patch<User>(API_CONFIG.ENDPOINTS.USERS_UPDATE_PROFILE, data);
    }

    async deleteProfile(): Promise<ApiResponse<null>> {
        return apiClient.delete(API_CONFIG.ENDPOINTS.USERS_DELETE_PROFILE);
    }

    async getAll(): Promise<ApiResponse<User[]>> {
        return apiClient.get<User[]>(API_CONFIG.ENDPOINTS.USERS);
    }

    async getById(id: string): Promise<ApiResponse<User>> {
        return apiClient.get<User>(API_CONFIG.ENDPOINTS.USER_BY_ID(id));
    }
}

export const usersService = new UsersService();
export default UsersService;
