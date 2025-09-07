import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { farmLinkAPI, SensorData } from '../lib/api'

const SensorChart: React.FC = () => {
  const [data, setData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState('24h')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSensorData()
    
    // 30초마다 차트 데이터 자동 새로고침 (그래프는 자주 업데이트할 필요 없음)
    const interval = setInterval(() => {
      fetchSensorData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchSensorData = async () => {
    try {
      setLoading(true)
      
      let hours = 24
      switch (timeRange) {
        case '1h':
          hours = 1
          break
        case '6h':
          hours = 6
          break
        case '24h':
          hours = 24
          break
        case '7d':
          hours = 24 * 7
          break
      }

      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
      const response = await farmLinkAPI.getSensorData({
        limit: 100,
        device_id: 'farmlink-001',
        start_date: startDate
      })

      if (!response.success || !response.data) {
        console.error('Sensor data fetch error:', response.error)
        // 샘플 데이터 생성
        const sampleData = []
        const now = new Date()
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000)
          sampleData.push({
            time: time.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            fullTime: time.toLocaleString('ko-KR'),
            수분: 60 + Math.random() * 20,
            온도: 20 + Math.random() * 10,
            습도: 50 + Math.random() * 20,
            조도: 30 + Math.random() * 40,
          })
        }
        setData(sampleData)
        return
      }

      // 데이터 포맷팅
      const formattedData = response.data.map((item: SensorData) => ({
        time: new Date(item.created_at).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        fullTime: new Date(item.created_at).toLocaleString('ko-KR'),
        수분: item.soil_moisture,
        온도: item.temperature,
        습도: item.humidity,
        조도: item.light_intensity,
      }))

      setData(formattedData)
    } catch (error) {
      console.error('Chart data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>차트 데이터를 불러오는 중...</Typography>
      </Box>
    )
  }

  if (data.length === 0) {
    return (
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          표시할 센서 데이터가 없습니다.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>시간 범위</InputLabel>
          <Select
            value={timeRange}
            label="시간 범위"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="1h">1시간</MenuItem>
            <MenuItem value="6h">6시간</MenuItem>
            <MenuItem value="24h">24시간</MenuItem>
            <MenuItem value="7d">7일</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(value, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullTime
              }
              return value
            }}
            formatter={(value, name) => [
              typeof value === 'number' ? value.toFixed(1) : value,
              name
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="수분"
            stroke="#4CAF50"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="토양 수분 (%)"
          />
          <Line
            type="monotone"
            dataKey="온도"
            stroke="#FF9800"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="온도 (°C)"
          />
          <Line
            type="monotone"
            dataKey="습도"
            stroke="#2196F3"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="습도 (%)"
          />
          <Line
            type="monotone"
            dataKey="조도"
            stroke="#9C27B0"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="조도 (ph)"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default SensorChart
