// Farm Link API 클라이언트
const API_BASE_URL = process.env.REACT_APP_API_URL || ''

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  count?: number
}

export interface SensorData {
  id: number
  soil_moisture: number
  light_intensity: number
  temperature: number
  humidity: number
  timestamp: string
  device_id: string
  created_at: string
}

export interface Device {
  id: string
  name: string
  location: string
  status: string
  last_seen: string | null
  created_at: string
  updated_at: string
}

export interface ControlLog {
  id: number
  device_id: string
  action: string
  duration: number | null
  triggered_by: string
  sensor_data_id: number | null
  threshold_id: number | null
  created_at: string
}

export interface SensorThreshold {
  id: number
  device_id: string
  sensor_type: string
  threshold_value: number
  control_action: string
  operator: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export interface SensorStats {
  avg_soil_moisture: number
  avg_light_intensity: number
  avg_temperature: number
  avg_humidity: number
  min_soil_moisture: number
  max_soil_moisture: number
  min_temperature: number
  max_temperature: number
  record_count: number
  time_range: {
    start: string
    end: string
  }
}

class FarmLinkAPI {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // 센서 데이터 관련 API
  async getSensorData(params?: {
    limit?: number
    device_id?: string
    start_date?: string
    end_date?: string
  }): Promise<ApiResponse<SensorData[]>> {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.device_id) queryParams.append('device_id', params.device_id)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    const queryString = queryParams.toString()
    const endpoint = `/api/sensor-data${queryString ? `?${queryString}` : ''}`
    
    return this.request<SensorData[]>(endpoint)
  }

  async getLatestSensorData(deviceId?: string): Promise<ApiResponse<SensorData>> {
    const response = await this.getSensorData({ limit: 1, device_id: deviceId })
    if (response.success && response.data && response.data.length > 0) {
      return {
        success: true,
        data: response.data[0]
      }
    }
    return {
      success: false,
      error: 'No sensor data found'
    }
  }

  async getSensorStats(params?: {
    device_id?: string
    start_date?: string
    end_date?: string
  }): Promise<ApiResponse<SensorStats>> {
    const queryParams = new URLSearchParams()
    if (params?.device_id) queryParams.append('device_id', params.device_id)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    const queryString = queryParams.toString()
    const endpoint = `/api/sensor-data/stats${queryString ? `?${queryString}` : ''}`
    
    return this.request<SensorStats>(endpoint)
  }

  async createSensorData(data: {
    soil_moisture: number
    light_intensity: number
    temperature: number
    humidity: number
    device_id?: string
  }): Promise<ApiResponse<SensorData>> {
    return this.request<SensorData>('/api/sensor-data', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // 디바이스 관련 API
  async getDevices(): Promise<ApiResponse<Device[]>> {
    return this.request<Device[]>('/api/devices')
  }

  async getDeviceStatus(deviceId: string): Promise<ApiResponse<{
    sensor_data: SensorData | null
    control_logs: ControlLog[]
    thresholds: SensorThreshold[]
  }>> {
    return this.request(`/api/device-status/${deviceId}`)
  }

  // 제어 로그 관련 API
  async getControlLogs(params?: {
    device_id?: string
    limit?: number
  }): Promise<ApiResponse<ControlLog[]>> {
    const queryParams = new URLSearchParams()
    if (params?.device_id) queryParams.append('device_id', params.device_id)
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString()
    const endpoint = `/api/control-logs${queryString ? `?${queryString}` : ''}`
    
    return this.request<ControlLog[]>(endpoint)
  }

  async createControlLog(data: {
    device_id: string
    action: string
    duration?: number
    triggered_by?: string
    sensor_data_id?: number
  }): Promise<ApiResponse<ControlLog>> {
    return this.request<ControlLog>('/api/control-logs', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // 센서 임계값 관련 API
  async getThresholds(deviceId: string): Promise<ApiResponse<SensorThreshold[]>> {
    return this.request<SensorThreshold[]>(`/api/thresholds/${deviceId}`)
  }

  async updateThresholds(deviceId: string, thresholds: Omit<SensorThreshold, 'id' | 'device_id' | 'created_at' | 'updated_at'>[]): Promise<ApiResponse<SensorThreshold[]>> {
    return this.request<SensorThreshold[]>(`/api/thresholds/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ thresholds })
    })
  }

  // 장치 제어 API
  async controlDevice(deviceId: string, action: string, duration?: number, triggered_by?: string): Promise<ApiResponse<{
    message: string
    log_id?: number
    output?: string
  }>> {
    return this.request(`/api/control/${deviceId}`, {
      method: 'POST',
      body: JSON.stringify({ action, duration, triggered_by })
    })
  }

  // 기본값 설정 관련 API
  async getDefaultSettings(deviceId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/api/default-settings/${deviceId}`)
  }

  async resetToDefaults(deviceId: string, settingType?: string): Promise<ApiResponse<{
    message: string
    restored_settings: number
  }>> {
    return this.request(`/api/reset-to-defaults/${deviceId}`, {
      method: 'POST',
      body: JSON.stringify({ settingType })
    })
  }

  // 헬스 체크
  async healthCheck(): Promise<ApiResponse<{
    status: string
    timestamp: string
    service: string
  }>> {
    return this.request('/health')
  }
}

// 싱글톤 인스턴스 생성
export const farmLinkAPI = new FarmLinkAPI()

// 기본 export
export default farmLinkAPI
