#!/usr/bin/env node
/**
 * Farm Link 데이터베이스 초기화 스크립트
 * 기본값 설정 테이블과 데이터를 생성합니다.
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: './env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  console.error('env.local 파일을 확인해주세요.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function initDatabase() {
  try {
    console.log('🚀 Farm Link 데이터베이스 초기화 시작...')

    // 1. 기본값 설정 테이블 생성
    console.log('📋 기본값 설정 테이블 생성 중...')
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS default_settings (
          id BIGSERIAL PRIMARY KEY,
          device_id VARCHAR(50) REFERENCES devices(id),
          setting_type VARCHAR(50) NOT NULL,
          setting_key VARCHAR(100) NOT NULL,
          setting_value TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(device_id, setting_type, setting_key)
        );
      `
    })

    if (createTableError) {
      console.log('⚠️ 테이블 생성 오류 (이미 존재할 수 있음):', createTableError.message)
    } else {
      console.log('✅ 기본값 설정 테이블 생성 완료')
    }

    // 2. 센서 임계값 테이블 생성
    console.log('📋 센서 임계값 테이블 생성 중...')
    const { error: createThresholdsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sensor_thresholds (
          id BIGSERIAL PRIMARY KEY,
          device_id VARCHAR(50) REFERENCES devices(id),
          sensor_type VARCHAR(50) NOT NULL,
          threshold_value DECIMAL(5,2) NOT NULL,
          control_action VARCHAR(50) NOT NULL,
          operator VARCHAR(10) NOT NULL,
          is_enabled BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })

    if (createThresholdsError) {
      console.log('⚠️ 센서 임계값 테이블 생성 오류 (이미 존재할 수 있음):', createThresholdsError.message)
    } else {
      console.log('✅ 센서 임계값 테이블 생성 완료')
    }

    // 3. 기본값 설정 데이터 삽입
    console.log('📊 기본값 설정 데이터 삽입 중...')
    const defaultSettings = [
      // 센서 임계값 기본값
      { device_id: 'farmlink-001', setting_type: 'sensor_threshold', setting_key: 'soil_moisture_water_pump', setting_value: '20.0', description: '토양 수분 물펌프 작동 임계값' },
      { device_id: 'farmlink-001', setting_type: 'sensor_threshold', setting_key: 'temperature_fan', setting_value: '30.0', description: '온도 팬 작동 임계값' },
      { device_id: 'farmlink-001', setting_type: 'sensor_threshold', setting_key: 'humidity_fan', setting_value: '70.0', description: '습도 팬 작동 임계값' },
      { device_id: 'farmlink-001', setting_type: 'sensor_threshold', setting_key: 'light_intensity_led', setting_value: '60.0', description: '조도 LED 작동 임계값' },
      
      // 제어 시간 기본값
      { device_id: 'farmlink-001', setting_type: 'control_duration', setting_key: 'water_pump', setting_value: '5000', description: '물펌프 기본 작동 시간 (밀리초)' },
      { device_id: 'farmlink-001', setting_type: 'control_duration', setting_key: 'fan', setting_value: '5000', description: '팬 기본 작동 시간 (밀리초)' },
      { device_id: 'farmlink-001', setting_type: 'control_duration', setting_key: 'led', setting_value: '5000', description: 'LED 기본 작동 시간 (밀리초)' },
      
      // 시스템 설정 기본값
      { device_id: 'farmlink-001', setting_type: 'system_config', setting_key: 'auto_control_enabled', setting_value: 'true', description: '자동 제어 활성화' },
      { device_id: 'farmlink-001', setting_type: 'system_config', setting_key: 'data_send_interval', setting_value: '5000', description: '데이터 전송 간격 (밀리초)' },
      { device_id: 'farmlink-001', setting_type: 'system_config', setting_key: 'sensor_read_interval', setting_value: '1000', description: '센서 읽기 간격 (밀리초)' },
      { device_id: 'farmlink-001', setting_type: 'system_config', setting_key: 'emergency_stop_threshold', setting_value: '95.0', description: '비상 정지 임계값 (%)' }
    ]

    const { error: insertDefaultsError } = await supabase
      .from('default_settings')
      .upsert(defaultSettings, { onConflict: 'device_id,setting_type,setting_key' })

    if (insertDefaultsError) {
      console.error('❌ 기본값 설정 데이터 삽입 오류:', insertDefaultsError)
    } else {
      console.log('✅ 기본값 설정 데이터 삽입 완료')
    }

    // 4. 센서 임계값 데이터 삽입
    console.log('📊 센서 임계값 데이터 삽입 중...')
    const sensorThresholds = [
      { device_id: 'farmlink-001', sensor_type: 'soil_moisture', threshold_value: 20.0, control_action: 'water_pump', operator: 'lt' },
      { device_id: 'farmlink-001', sensor_type: 'temperature', threshold_value: 30.0, control_action: 'fan', operator: 'gt' },
      { device_id: 'farmlink-001', sensor_type: 'humidity', threshold_value: 70.0, control_action: 'fan', operator: 'gt' },
      { device_id: 'farmlink-001', sensor_type: 'light_intensity', threshold_value: 60.0, control_action: 'led', operator: 'lt' }
    ]

    const { error: insertThresholdsError } = await supabase
      .from('sensor_thresholds')
      .upsert(sensorThresholds, { onConflict: 'device_id,sensor_type,control_action' })

    if (insertThresholdsError) {
      console.error('❌ 센서 임계값 데이터 삽입 오류:', insertThresholdsError)
    } else {
      console.log('✅ 센서 임계값 데이터 삽입 완료')
    }

    // 5. RLS 정책 설정
    console.log('🔒 RLS 정책 설정 중...')
    const rlsPolicies = [
      {
        sql: `ALTER TABLE default_settings ENABLE ROW LEVEL SECURITY;`,
        description: 'default_settings RLS 활성화'
      },
      {
        sql: `CREATE POLICY IF NOT EXISTS "Allow read access to default_settings" ON default_settings FOR SELECT USING (true);`,
        description: 'default_settings 읽기 정책'
      },
      {
        sql: `CREATE POLICY IF NOT EXISTS "Allow insert access to default_settings" ON default_settings FOR INSERT WITH CHECK (true);`,
        description: 'default_settings 삽입 정책'
      },
      {
        sql: `CREATE POLICY IF NOT EXISTS "Allow update access to default_settings" ON default_settings FOR UPDATE USING (true);`,
        description: 'default_settings 업데이트 정책'
      },
      {
        sql: `ALTER TABLE sensor_thresholds ENABLE ROW LEVEL SECURITY;`,
        description: 'sensor_thresholds RLS 활성화'
      },
      {
        sql: `CREATE POLICY IF NOT EXISTS "Allow read access to sensor_thresholds" ON sensor_thresholds FOR SELECT USING (true);`,
        description: 'sensor_thresholds 읽기 정책'
      },
      {
        sql: `CREATE POLICY IF NOT EXISTS "Allow insert access to sensor_thresholds" ON sensor_thresholds FOR INSERT WITH CHECK (true);`,
        description: 'sensor_thresholds 삽입 정책'
      },
      {
        sql: `CREATE POLICY IF NOT EXISTS "Allow update access to sensor_thresholds" ON sensor_thresholds FOR UPDATE USING (true);`,
        description: 'sensor_thresholds 업데이트 정책'
      }
    ]

    for (const policy of rlsPolicies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy.sql })
      if (policyError) {
        console.log(`⚠️ ${policy.description} 오류:`, policyError.message)
      } else {
        console.log(`✅ ${policy.description} 완료`)
      }
    }

    console.log('🎉 데이터베이스 초기화 완료!')
    console.log('📋 생성된 테이블:')
    console.log('  - default_settings (기본값 설정)')
    console.log('  - sensor_thresholds (센서 임계값)')
    console.log('📊 추가된 데이터:')
    console.log('  - 11개 기본값 설정')
    console.log('  - 4개 센서 임계값')

  } catch (error) {
    console.error('❌ 데이터베이스 초기화 오류:', error)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  initDatabase()
}

module.exports = { initDatabase }
