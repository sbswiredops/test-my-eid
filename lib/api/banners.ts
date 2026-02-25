import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import { ApiResponse, Banner } from '@/lib/types';

export class BannerService {
  // Hero Banners
  async getHeroBanners(): Promise<ApiResponse<Banner[]>> {
    return apiClient.get<Banner[]>(API_CONFIG.ENDPOINTS.HEROBANNER);
  }

  async createHeroBanner(data: FormData): Promise<ApiResponse<Banner>> {
    return apiClient.upload<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_CREATE, data);
  }

  async updateHeroBanner(id: string, data: FormData): Promise<ApiResponse<Banner>> {
    // Use upload helper to ensure multipart XHR upload (better compatibility)
    return apiClient.upload<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_UPDATE(id), data);
  }

  async deleteHeroBanner(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.HEROBANNER_DELETE(id));
  }

  // Bottom Banners
  async getBottomBanners(): Promise<ApiResponse<Banner[]>> {
    return apiClient.get<Banner[]>(API_CONFIG.ENDPOINTS.HEROBANNER_BOTTOM);
  }

  async createBottomBanner(data: FormData): Promise<ApiResponse<Banner>> {
    return apiClient.upload<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_BOTTOM_CREATE, data);
  }

  async updateBottomBanner(id: string, data: FormData): Promise<ApiResponse<Banner>> {
    return apiClient.upload<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_BOTTOM_UPDATE(id), data);
  }

  async deleteBottomBanner(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.HEROBANNER_BOTTOM_DELETE(id));
  }

  // Middle Banners
  async getMiddleBanners(): Promise<ApiResponse<Banner[]>> {
    return apiClient.get<Banner[]>(API_CONFIG.ENDPOINTS.HEROBANNER_MIDDLE);
  }

  async createMiddleBanner(data: FormData): Promise<ApiResponse<Banner>> {
    return apiClient.upload<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_MIDDLE_CREATE, data);
  }

  async updateMiddleBanner(id: string, data: FormData): Promise<ApiResponse<Banner>> {
    return apiClient.upload<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_MIDDLE_UPDATE(id), data);
  }

  async deleteMiddleBanner(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.HEROBANNER_MIDDLE_DELETE(id));
  }

  // Give Banners
  async getGiveBanners(): Promise<ApiResponse<Banner[]>> {
    return apiClient.get<Banner[]>(API_CONFIG.ENDPOINTS.HEROBANNER_GIVE);
  }

  async createGiveBanner(data: FormData): Promise<ApiResponse<Banner>> {
    return apiClient.upload<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_GIVE_CREATE, data);
  }

  async updateGiveBanner(id: string, data: FormData): Promise<ApiResponse<Banner>> {
    return apiClient.upload<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_GIVE_UPDATE(id), data);
  }

  async deleteGiveBanner(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.HEROBANNER_GIVE_DELETE(id));
  }

  // Active toggles
  async setHeroBannerActive(id: string, active: boolean): Promise<ApiResponse<Banner>> {
    return apiClient.put<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_SET_ACTIVE(id), { active });
  }

  async setBottomBannerActive(id: string, active: boolean): Promise<ApiResponse<Banner>> {
    return apiClient.put<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_BOTTOM_SET_ACTIVE(id), { active });
  }

  async setMiddleBannerActive(id: string, active: boolean): Promise<ApiResponse<Banner>> {
    return apiClient.put<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_MIDDLE_SET_ACTIVE(id), { active });
  }

  async setGiveBannerActive(id: string, active: boolean): Promise<ApiResponse<Banner>> {
    return apiClient.put<Banner>(API_CONFIG.ENDPOINTS.HEROBANNER_GIVE_SET_ACTIVE(id), { active });
  }
}

export const bannerService = new BannerService();
export default BannerService;
