// Farm Link Project - Supabase TypeScript Types
// 자동 생성된 타입 정의

export interface Database {
  public: {
    Tables: {
      sensor_data: {
        Row: {
          id: number
          soil_moisture: number
          light_intensity: number
          temperature: number
          humidity: number
          timestamp: string | null
          device_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          soil_moisture: number
          light_intensity: number
          temperature: number
          humidity: number
          timestamp?: string | null
          device_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          soil_moisture?: number
          light_intensity?: number
          temperature?: number
          humidity?: number
          timestamp?: string | null
          device_id?: string | null
          created_at?: string | null
        }
      }
      devices: {
        Row: {
          id: string
          name: string
          location: string | null
          status: string | null
          last_seen: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          location?: string | null
          status?: string | null
          last_seen?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          status?: string | null
          last_seen?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      sensor_threshold_configs: {
        Row: {
          id: number
          device_id: string
          config_name: string
          temperature_threshold: number | null
          humidity_threshold: number | null
          soil_moisture_threshold: number | null
          light_intensity_threshold: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: number
          device_id: string
          config_name: string
          temperature_threshold?: number | null
          humidity_threshold?: number | null
          soil_moisture_threshold?: number | null
          light_intensity_threshold?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: number
          device_id?: string
          config_name?: string
          temperature_threshold?: number | null
          humidity_threshold?: number | null
          soil_moisture_threshold?: number | null
          light_intensity_threshold?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 센서 데이터 타입
export interface SensorData {
  soil_moisture: number
  light_intensity: number
  temperature: number
  humidity: number
  timestamp?: string
  device_id?: string
}

// 디바이스 정보 타입
export interface Device {
  id: string
  name: string
  location?: string
  status: 'active' | 'inactive' | 'maintenance'
  last_seen?: string
}

// 알림 설정 타입
export interface Notification {
  id?: number
  device_id: string
  notification_type: 'low_moisture' | 'high_temp' | 'high_humidity'
  threshold_value: number
  is_enabled: boolean
}

// 제어 로그 타입
export interface ControlLog {
  id?: number
  device_id: string
  action: 'water_pump' | 'fan' | 'led'
  duration?: number
  triggered_by: 'auto' | 'manual'
  sensor_data_id?: number
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// 통계 데이터 타입
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
