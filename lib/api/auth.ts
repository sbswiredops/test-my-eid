import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import type { ApiResponse, User, LoginCredentials, RegisterData } from '@/lib/types';

export class AuthService {
  async register(data: RegisterData): Promise<any> {
    const res = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH_REGISTER, data);
    const payload: { user?: User; accessToken?: string; refreshToken?: string } = res?.data ?? {};
    if (payload.accessToken) localStorage.setItem('eid-token', payload.accessToken);
    return {
      user: payload.user,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      raw: res,
    };
  }

  async login(credentials: LoginCredentials): Promise<any> {
    const res = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN, credentials);
    const payload: { user?: User; accessToken?: string; refreshToken?: string } = res?.data ?? {};
    if (payload.accessToken) localStorage.setItem('eid-token', payload.accessToken);
    return {
      user: payload.user,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      raw: res,
    };
  }

  async refresh(refreshToken: string): Promise<any> {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH_REFRESH, { refreshToken });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_CONFIG.ENDPOINTS.AUTH_PROFILE);
  }

  async logout(): Promise<any> {
    localStorage.removeItem('eid-token');
    localStorage.removeItem('eid-current-user');
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH_LOGOUT);
  }
}

export const authService = new AuthService();
export default AuthService;
