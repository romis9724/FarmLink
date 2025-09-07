// Farm Link Project - Express.js API Server
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = process.env.PORT || 3000

// Supabase 클라이언트 설정
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

// 미들웨어 설정
app.use(helmet()) // 보안 헤더
app.use(cors()) // CORS 허용
app.use(express.json({ limit: '10mb' })) // JSON 파싱

// 모든 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 1000 // 최대 1000 요청
})
app.use('/api/', limiter)

// 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Farm Link API'
  })
})


// 센서 데이터 API
app.post('/api/sensor-data', async (req, res) => {
  try {
    const { soil_moisture, light_intensity, temperature, humidity, device_id } = req.body

    // 데이터 유효성 검사
    if (!soil_moisture || !light_intensity || !temperature || !humidity) {
      return res.status(400).json({
        success: false,
        error: '필수 센서 데이터가 누락되었습니다.'
      })
    }

    // Supabase에 데이터 저장
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('sensor_data')
      .insert([{
        soil_moisture: parseFloat(soil_moisture),
        light_intensity: parseFloat(light_intensity),
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        device_id: device_id || 'farmlink-001',
        timestamp: now,
        created_at: now
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase 저장 오류:', error)
      return res.status(500).json({
        success: false,
        error: '데이터 저장에 실패했습니다.'
      })
    }

    // 디바이스 상태 업데이트
    await supabase
      .from('devices')
      .update({ 
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', device_id || 'farmlink-001')

    res.json({
      success: true,
      data: data,
      message: '센서 데이터가 성공적으로 저장되었습니다.'
    })

  } catch (error) {
    console.error('센서 데이터 API 오류:', error)
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    })
  }
})

// 센서 데이터 조회 API
app.get('/api/sensor-data', async (req, res) => {
  try {
    const { limit = 100, device_id, start_date, end_date } = req.query

    let query = supabase
      .from('sensor_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (device_id) {
      query = query.eq('device_id', device_id)
    }
    if (start_date) {
      query = query.gte('timestamp', start_date)
    }
    if (end_date) {
      query = query.lte('timestamp', end_date)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase 조회 오류:', error)
      return res.status(500).json({
        success: false,
        error: '데이터 조회에 실패했습니다.'
      })
    }

    res.json({
      success: true,
      data: data,
      count: data.length
    })

  } catch (error) {
    console.error('센서 데이터 조회 API 오류:', error)
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    })
  }
})

// 센서 데이터 통계 API
app.get('/api/sensor-data/stats', async (req, res) => {
  try {
    const { device_id, start_date, end_date } = req.query

    let query = supabase
      .from('sensor_data')
      .select('soil_moisture, light_intensity, temperature, humidity, created_at')
      .order('created_at', { ascending: false })

    if (device_id) {
      query = query.eq('device_id', device_id)
    }
    if (start_date) {
      query = query.gte('created_at', start_date)
    }
    if (end_date) {
      query = query.lte('created_at', end_date)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase 통계 조회 오류:', error)
      return res.status(500).json({
        success: false,
        error: '통계 데이터 조회에 실패했습니다.'
      })
    }

    if (!data || data.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: '조회된 데이터가 없습니다.'
      })
    }

    // 통계 계산
    const stats = {
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
        start: data[data.length - 1].timestamp,
        end: data[0].timestamp
      }
    }

    res.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('센서 통계 API 오류:', error)
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    })
  }
})

// 디바이스 목록 조회 API
app.get('/api/devices', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase 디바이스 조회 오류:', error)
      return res.status(500).json({
        success: false,
        error: '디바이스 조회에 실패했습니다.'
      })
    }

    res.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('디바이스 조회 API 오류:', error)
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    })
  }
})



// 실시간 장치 제어
app.post('/api/control/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params
    const { action, duration = 5000, triggered_by = 'manual' } = req.body

    // 제어 로그 기록
    const { data: logData, error: logError } = await supabase
      .from('control_logs')
      .insert({
        device_id: deviceId,
        action: action,
        duration: Math.floor(duration / 1000), // 밀리초를 초로 변환
        triggered_by: triggered_by
      })
      .select()

    if (logError) throw logError

    // 실제 아두이노에 제어 명령 전송 (Python 스크립트 실행)
    const { spawn } = require('child_process')
    
    const pythonProcess = spawn('python', [
      'arduino-project/remote_control.py',
      '--port', 'COM7',
      '--action', action,
      '--duration', duration.toString()
    ])

    let output = ''
    let error = ''

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('아두이노 제어 성공:', output)
        res.json({ 
          success: true, 
          message: `${action} 제어 명령이 전송되었습니다.`,
          log_id: logData[0]?.id,
          output: output
        })
      } else {
        console.error('아두이노 제어 실패:', error)
        res.status(500).json({ 
          error: '아두이노 제어 실패', 
          details: error 
        })
      }
    })

  } catch (error) {
    console.error('장치 제어 오류:', error)
    res.status(500).json({ error: '장치 제어 실패' })
  }
})

// 장치 상태 조회
app.get('/api/device-status/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params

    // 최신 센서 데이터
    const { data: sensorData, error: sensorError } = await supabase
      .from('sensor_data')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    // 최근 제어 로그
    const { data: controlLogs, error: controlError } = await supabase
      .from('control_logs')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (sensorError && sensorError.code !== 'PGRST116') throw sensorError
    if (controlError) throw controlError

    res.json({
      sensor_data: sensorData,
      control_logs: controlLogs || []
    })
  } catch (error) {
    console.error('장치 상태 조회 오류:', error)
    res.status(500).json({ error: '장치 상태 조회 실패' })
  }
})




// 센서 임계치 설정 조회
app.get('/api/threshold-configs/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params
    const { data, error } = await supabase
      .from('sensor_threshold_configs')
      .select('*')
      .eq('device_id', deviceId)
      .order('id', { descending: true })

    if (error) throw error
    res.json(data || [])
  } catch (error) {
    console.error('임계치 설정 조회 오류:', error)
    res.status(500).json({ error: '임계치 설정 조회 실패' })
  }
})

// 센서 임계치 설정 생성
app.post('/api/threshold-configs/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params
    const { config_name, temperature_threshold, humidity_threshold, soil_moisture_threshold, light_intensity_threshold } = req.body

    // 기존 활성 설정 비활성화
    if (req.body.is_active) {
      await supabase
        .from('sensor_threshold_configs')
        .update({ is_active: false })
        .eq('device_id', deviceId)
    }

    const { data, error } = await supabase
      .from('sensor_threshold_configs')
      .insert([{
        device_id: deviceId,
        config_name,
        temperature_threshold,
        humidity_threshold,
        soil_moisture_threshold,
        light_intensity_threshold,
        is_active: req.body.is_active || false,
        created_by: 'admin'
      }])
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('임계치 설정 생성 오류:', error)
    res.status(500).json({ error: '임계치 설정 생성 실패' })
  }
})

// 센서 임계치 설정 업데이트
app.put('/api/threshold-configs/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { is_active } = req.body

    // 활성화하는 경우 다른 설정들 비활성화
    if (is_active) {
      const { data: config } = await supabase
        .from('sensor_threshold_configs')
        .select('device_id')
        .eq('id', id)
        .single()

      if (config) {
        await supabase
          .from('sensor_threshold_configs')
          .update({ is_active: false })
          .eq('device_id', config.device_id)
          .neq('id', id)
      }
    }

    const { data, error } = await supabase
      .from('sensor_threshold_configs')
      .update({ 
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error('임계치 설정 업데이트 오류:', error)
    res.status(500).json({ error: '임계치 설정 업데이트 실패' })
  }
})

// 센서 임계치 설정 삭제
app.delete('/api/threshold-configs/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase
      .from('sensor_threshold_configs')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ success: true, message: '임계치 설정이 삭제되었습니다.' })
  } catch (error) {
    console.error('임계치 설정 삭제 오류:', error)
    res.status(500).json({ error: '임계치 설정 삭제 실패' })
  }
})

// 활성화된 센서 임계치 설정 조회
app.get('/api/threshold-configs/:deviceId/active', async (req, res) => {
  try {
    const { deviceId } = req.params
    const { data, error } = await supabase
      .from('sensor_threshold_configs')
      .select('*')
      .eq('device_id', deviceId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 활성화된 설정이 없는 경우
        return res.json({
          success: true,
          data: null,
          message: '활성화된 임계치 설정이 없습니다.'
        })
      }
      throw error
    }

    res.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('활성화된 임계치 설정 조회 오류:', error)
    res.status(500).json({ 
      success: false,
      error: '활성화된 임계치 설정 조회 실패' 
    })
  }
})


// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 엔드포인트를 찾을 수 없습니다.'
  })
})

// 에러 핸들러
app.use((error, req, res, next) => {
  console.error('서버 오류:', error)
  res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다.'
  })
})


// 서버 시작
app.listen(PORT, () => {
  console.log(`Farm Link API 서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`헬스 체크: http://localhost:${PORT}/health`)
  console.log('등록된 엔드포인트:')
  console.log('- GET /api/sensor-data')
  console.log('- POST /api/sensor-data')
  console.log('- GET /api/devices')
  console.log('- GET /api/device-status/:deviceId')
  console.log('- POST /api/control/:deviceId')
  console.log('- GET /api/threshold-configs/:deviceId')
  console.log('- GET /api/threshold-configs/:deviceId/active')
  console.log('- POST /api/threshold-configs/:deviceId')
  console.log('- PUT /api/threshold-configs/:id')
  console.log('- DELETE /api/threshold-configs/:id')
})

module.exports = app
