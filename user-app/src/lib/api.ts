import axios from 'axios';

// API 기본 URL (개발 환경에서는 localhost, 실제 배포시에는 서버 IP)
const API_BASE_URL = __DEV__ ? 'http://localhost:3000' : 'http://your-server-ip:3000';

// API 클라이언트 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 센서 데이터 타입 정의
export interface SensorData {
  id: number;
  device_id: string;
  soil_moisture: number;
  light_intensity: number;
  temperature: number;
  humidity: number;
  created_at: string;
}

// 디바이스 타입 정의
export interface Device {
  id: string;
  name: string;
  location: string;
  status: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

// API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Farm Link API 클래스
export class FarmLinkAPI {
  // 최신 센서 데이터 조회
  static async getLatestSensorData(deviceId: string = 'farmlink-001'): Promise<SensorData | null> {
    try {
      const response = await apiClient.get<ApiResponse<SensorData[]>>(
        `/api/sensor-data?device_id=${deviceId}&limit=1`
      );
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      }
      return null;
    } catch (error) {
      console.error('센서 데이터 조회 실패:', error);
      return null;
    }
  }

  // 센서 데이터 통계 조회
  static async getSensorStats(deviceId: string = 'farmlink-001'): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/api/sensor-data/stats?device_id=${deviceId}`
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('센서 통계 조회 실패:', error);
      return null;
    }
  }

  // 디바이스 목록 조회
  static async getDevices(): Promise<Device[]> {
    try {
      const response = await apiClient.get<ApiResponse<Device[]>>('/api/devices');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('디바이스 목록 조회 실패:', error);
      return [];
    }
  }

  // 디바이스 상태 조회
  static async getDeviceStatus(deviceId: string): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/api/device-status/${deviceId}`
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('디바이스 상태 조회 실패:', error);
      return null;
    }
  }
}

export default FarmLinkAPI;
