import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ldzsievvxhaqepipzral.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkenNpZXZ2eGhhcWVwaXB6cmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDEwNjcsImV4cCI6MjA3MjcxNzA2N30.MPs7K-9mpNDYglAmLWnow9CeLY8Gs4SRN66iI-i6Tm0'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 타입 정의
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

export interface Notification {
  id: number
  device_id: string
  notification_type: string
  threshold_value: number
  is_enabled: boolean
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
