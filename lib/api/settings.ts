import { apiClient } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';
import type { ApiResponse, StoreSettings } from '@/lib/types';

export class SettingsService {
  async get(): Promise<ApiResponse<StoreSettings>> {
    return apiClient.get<StoreSettings>(API_CONFIG.ENDPOINTS.SETTINGS_GET);
  }

  async update(data: Partial<StoreSettings>): Promise<ApiResponse<StoreSettings>> {
    return apiClient.post<StoreSettings>(API_CONFIG.ENDPOINTS.SETTINGS_UPDATE, data);
  }
}

export const settingsService = new SettingsService();
export default SettingsService;
