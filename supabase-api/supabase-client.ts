// Farm Link Project - Supabase Client Configuration
import { createClient } from '@supabase/supabase-js'
import { Database, SensorData, Device, ControlLog, SensorStats } from './types'

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Supabase 클라이언트 생성
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// 센서 데이터 관련 함수들
export class SensorDataService {
  /**
   * 새로운 센서 데이터 저장
   */
  static async createSensorData(data: SensorData) {
    try {
      const { data: result, error } = await supabase
        .from('sensor_data')
        .insert([{
          soil_moisture: data.soil_moisture,
          light_intensity: data.light_intensity,
          temperature: data.temperature,
          humidity: data.humidity,
          device_id: data.device_id || 'farmlink-001',
          timestamp: data.timestamp || new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return { data: result, error: null }
    } catch (error) {
      console.error('센서 데이터 저장 오류:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * 센서 데이터 조회 (최근 N개)
   */
  static async getRecentSensorData(limit: number = 100) {
    try {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('센서 데이터 조회 오류:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * 특정 기간의 센서 데이터 조회
   */
  static async getSensorDataByDateRange(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('기간별 센서 데이터 조회 오류:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * 센서 데이터 통계 조회
   */
  static async getSensorStats(startDate?: string, endDate?: string): Promise<{ data: SensorStats | null, error: string | null }> {
    try {
      let query = supabase
        .from('sensor_data')
        .select('soil_moisture, light_intensity, temperature, humidity, timestamp')

      if (startDate) {
        query = query.gte('timestamp', startDate)
      }
      if (endDate) {
        query = query.lte('timestamp', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      if (!data || data.length === 0) {
        return { data: null, error: '데이터가 없습니다.' }
      }

      // 통계 계산
      const stats: SensorStats = {
        avg_soil_moisture: data.reduce((sum, item) => sum + item.soil_moisture, 0) / data.length,
        avg_light_intensity: data.reduce((sum, item) => sum + item.light_intensity, 0) / data.length,
        avg_temperature: data.reduce((sum, item) => sum + item.temperature, 0) / data.length,
        avg_humidity: data.reduce((sum, item) => sum + item.humidity, 0) / data.length,
        min_soil_moisture: Math.min(...data.map(item => item.soil_moisture)),
        max_soil_moisture: Math.max(...data.map(item => item.soil_moisture)),
        min_temperature: Math.min(...data.map(item => item.temperature)),
        max_temperature: Math.max(...data.map(item => item.temperature)),
        record_count: data.length,
        time_range: {
          start: data[0].timestamp,
          end: data[data.length - 1].timestamp
        }
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('센서 통계 조회 오류:', error)
      return { data: null, error: error.message }
    }
  }
}

// 디바이스 관련 함수들
export class DeviceService {
  /**
   * 모든 디바이스 조회
   */
  static async getAllDevices() {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('디바이스 조회 오류:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * 디바이스 상태 업데이트
   */
  static async updateDeviceStatus(deviceId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('devices')
        .update({ 
          status,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('디바이스 상태 업데이트 오류:', error)
      return { data: null, error: error.message }
    }
  }
}

// 제어 로그 관련 함수들
export class ControlLogService {
  /**
   * 제어 로그 저장
   */
  static async createControlLog(log: ControlLog) {
    try {
      const { data, error } = await supabase
        .from('control_logs')
        .insert([{
          device_id: log.device_id,
          action: log.action,
          duration: log.duration,
          triggered_by: log.triggered_by,
          sensor_data_id: log.sensor_data_id
        }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('제어 로그 저장 오류:', error)
      return { data: null, error: error.message }
    }
  }

  /**
   * 제어 로그 조회
   */
  static async getControlLogs(deviceId?: string, limit: number = 100) {
    try {
      let query = supabase
        .from('control_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (deviceId) {
        query = query.eq('device_id', deviceId)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('제어 로그 조회 오류:', error)
      return { data: null, error: error.message }
    }
  }
}

// 실시간 데이터 구독
export class RealtimeService {
  /**
   * 센서 데이터 실시간 구독
   */
  static subscribeToSensorData(callback: (payload: any) => void) {
    return supabase
      .channel('sensor_data_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'sensor_data' 
        }, 
        callback
      )
      .subscribe()
  }

  /**
   * 제어 로그 실시간 구독
   */
  static subscribeToControlLogs(callback: (payload: any) => void) {
    return supabase
      .channel('control_logs_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'control_logs' 
        }, 
        callback
      )
      .subscribe()
  }
}
