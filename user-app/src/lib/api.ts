// Farm Link API 클라이언트
const API_BASE_URL = 'http://localhost:3000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface SensorData {
  id: number;
  soil_moisture: number;
  light_intensity: number;
  temperature: number;
  humidity: number;
  timestamp: string;
  device_id: string;
  created_at: string;
}

export interface Device {
  id: string;
  name: string;
  location: string;
  status: string;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
}

export interface ControlLog {
  id: number;
  device_id: string;
  action: string;
  duration: number | null;
  triggered_by: string;
  sensor_data_id: number | null;
  threshold_id: number | null;
  created_at: string;
}

export interface SensorThreshold {
  id: number;
  device_id: string;
  sensor_type: string;
  threshold_value: number;
  control_action: string;
  operator: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SensorStats {
  avg_soil_moisture: number;
  avg_light_intensity: number;
  avg_temperature: number;
  avg_humidity: number;
  min_soil_moisture: number;
  max_soil_moisture: number;
  min_temperature: number;
  max_temperature: number;
  record_count: number;
  time_range: {
    start: string;
    end: string;
  };
}

// 임계치 설정 인터페이스 (admin-dashboard와 호환)
export interface ThresholdConfig {
  id?: number;
  device_id: string;
  config_name: string;
  temperature_threshold?: number;
  humidity_threshold?: number;
  soil_moisture_threshold?: number;
  light_intensity_threshold?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // 센서 데이터 관련 API
  async getSensorData(params?: {
    limit?: number;
    device_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<SensorData[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.device_id) queryParams.append('device_id', params.device_id);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    const endpoint = `/api/sensor-data${queryString ? `?${queryString}` : ''}`;
    
    return this.request<SensorData[]>(endpoint);
  }

  async getLatestSensorData(deviceId?: string): Promise<ApiResponse<SensorData>> {
    const response = await this.getSensorData({ limit: 1, device_id: deviceId });
    if (response.success && response.data && response.data.length > 0) {
      return {
        success: true,
        data: response.data[0]
      };
    }
    return {
      success: false,
      error: 'No sensor data found'
    };
  }

  async getSensorStats(params?: {
    device_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<SensorStats>> {
    const queryParams = new URLSearchParams();
    if (params?.device_id) queryParams.append('device_id', params.device_id);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const queryString = queryParams.toString();
    const endpoint = `/api/sensor-data/stats${queryString ? `?${queryString}` : ''}`;
    
    return this.request<SensorStats>(endpoint);
  }

  // 디바이스 관련 API
  async getDevices(): Promise<ApiResponse<Device[]>> {
    return this.request<Device[]>('/api/devices');
  }

  async getDeviceStatus(deviceId: string): Promise<ApiResponse<{
    sensor_data: SensorData | null;
    control_logs: ControlLog[];
    thresholds: SensorThreshold[];
  }>> {
    return this.request(`/api/device-status/${deviceId}`);
  }

  // 제어 로그 관련 API
  async getControlLogs(params?: {
    device_id?: string;
    limit?: number;
  }): Promise<ApiResponse<ControlLog[]>> {
    const queryParams = new URLSearchParams();
    if (params?.device_id) queryParams.append('device_id', params.device_id);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/control-logs${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ControlLog[]>(endpoint);
  }

  // 센서 임계값 관련 API
  async getThresholds(deviceId: string): Promise<ApiResponse<SensorThreshold[]>> {
    return this.request<SensorThreshold[]>(`/api/thresholds/${deviceId}`);
  }

  async updateThresholds(deviceId: string, thresholds: Omit<SensorThreshold, 'id' | 'device_id' | 'created_at' | 'updated_at'>[]): Promise<ApiResponse<SensorThreshold[]>> {
    return this.request<SensorThreshold[]>(`/api/thresholds/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ thresholds })
    });
  }

  // 임계치 설정 관련 API (admin-dashboard와 호환)
  async getThresholdConfigs(deviceId: string): Promise<ApiResponse<ThresholdConfig[]>> {
    return this.request<ThresholdConfig[]>(`/api/threshold-configs/${deviceId}`);
  }

  async saveThresholdConfig(deviceId: string, config: Partial<ThresholdConfig>): Promise<ApiResponse<ThresholdConfig>> {
    const url = config.id 
      ? `/api/threshold-configs/${config.id}`
      : `/api/threshold-configs/${deviceId}`;
    
    const method = config.id ? 'PUT' : 'POST';
    
    return this.request<ThresholdConfig>(url, {
      method,
      body: JSON.stringify(config)
    });
  }

  async deleteThresholdConfig(configId: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/threshold-configs/${configId}`, {
      method: 'DELETE'
    });
  }

  // 장치 제어 API
  async controlDevice(deviceId: string, action: string, duration?: number, triggered_by?: string): Promise<ApiResponse<{
    message: string;
    log_id?: number;
    output?: string;
  }>> {
    return this.request(`/api/control/${deviceId}`, {
      method: 'POST',
      body: JSON.stringify({ action, duration, triggered_by })
    });
  }

  // 헬스 체크
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
    service: string;
  }>> {
    return this.request('/health');
  }
}

// 싱글톤 인스턴스 생성
const apiClient = new APIClient();

// admin-dashboard와 동일한 방식의 FarmLinkAPI 객체
export const FarmLinkAPI = {
  async getLatestSensorData(deviceId: string = 'farmlink-001'): Promise<SensorData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sensor-data?limit=1&device_id=${deviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const data = result.success ? result.data : [];
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('센서 데이터 조회 실패:', error);
      return null;
    }
  },

  async getDevices(): Promise<Device[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/devices`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.success ? result.data || [] : [];
    } catch (error) {
      console.error('장치 목록 조회 실패:', error);
      return [];
    }
  },

  async getDeviceStatus(deviceId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/device-status/${deviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('장치 상태 조회 실패:', error);
      return null;
    }
  },

  async getThresholdConfigs(deviceId: string): Promise<ThresholdConfig[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/threshold-configs/${deviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('임계치 설정 조회 실패:', error);
      return [];
    }
  },

  async saveThresholdConfig(deviceId: string, config: Partial<ThresholdConfig>): Promise<boolean> {
    try {
      const url = config.id 
        ? `${API_BASE_URL}/api/threshold-configs/${config.id}`
        : `${API_BASE_URL}/api/threshold-configs/${deviceId}`;
      
      const method = config.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('임계치 설정 저장 실패:', error);
      return false;
    }
  },

  async deleteThresholdConfig(configId: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/threshold-configs/${configId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('임계치 설정 삭제 실패:', error);
      return false;
    }
  }
};

// 기본 export
export default FarmLinkAPI;