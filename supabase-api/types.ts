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
          timestamp: string
          device_id: string
          created_at: string
        }
        Insert: {
          id?: number
          soil_moisture: number
          light_intensity: number
          temperature: number
          humidity: number
          timestamp?: string
          device_id?: string
          created_at?: string
        }
        Update: {
          id?: number
          soil_moisture?: number
          light_intensity?: number
          temperature?: number
          humidity?: number
          timestamp?: string
          device_id?: string
          created_at?: string
        }
      }
      devices: {
        Row: {
          id: string
          name: string
          location: string | null
          status: string
          last_seen: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          location?: string | null
          status?: string
          last_seen?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          status?: string
          last_seen?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          device_id: string
          notification_type: string
          threshold_value: number
          is_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: number
          device_id: string
          notification_type: string
          threshold_value: number
          is_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          device_id?: string
          notification_type?: string
          threshold_value?: number
          is_enabled?: boolean
          created_at?: string
        }
      }
      control_logs: {
        Row: {
          id: number
          device_id: string
          action: string
          duration: number | null
          triggered_by: string | null
          sensor_data_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          device_id: string
          action: string
          duration?: number | null
          triggered_by?: string | null
          sensor_data_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          device_id?: string
          action?: string
          duration?: number | null
          triggered_by?: string | null
          sensor_data_id?: number | null
          created_at?: string
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
