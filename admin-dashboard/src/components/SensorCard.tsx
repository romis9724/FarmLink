import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material'
import { farmLinkAPI, SensorData } from '../lib/api'

interface SensorCardProps {
  title: string
  icon: React.ReactNode
  valueKey: keyof SensorData
  unit: string
  type: 'moisture' | 'temperature' | 'humidity' | 'light'
  deviceId: string
  refreshInterval?: number
}

const SensorCard: React.FC<SensorCardProps> = ({
  title,
  icon,
  valueKey,
  unit,
  type,
  deviceId,
  refreshInterval = 1000
}) => {
  const [data, setData] = useState<SensorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      console.log(`${title} 데이터 가져오기 시도... (${new Date().toLocaleTimeString()})`)
      const response = await farmLinkAPI.getLatestSensorData(deviceId)
      
      console.log(`${title} API 응답:`, response)
      
      if (!response.success || !response.data) {
        console.log(`${title} API 실패, 샘플 데이터 사용`)
        // 샘플 데이터 사용
        const sampleData: SensorData = {
          id: 1,
          soil_moisture: 65 + Math.random() * 10,
          light_intensity: 45 + Math.random() * 10,
          temperature: 24.5 + Math.random() * 5,
          humidity: 55 + Math.random() * 10,
          timestamp: new Date().toISOString(),
          device_id: deviceId,
          created_at: new Date().toISOString()
        }
        setData(sampleData)
        setError(null)
      } else {
        console.log(`${title} 실제 데이터 사용:`, response.data)
        console.log(`${title} 데이터 시간:`, response.data.created_at)
        setData(response.data)
        setError(null)
      }
    } catch (err) {
      console.error(`${title} 데이터 가져오기 오류:`, err)
      setError('데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }, [title, deviceId])

  useEffect(() => {
    fetchData()
    
    // 개별 카드별 새로고침 간격
    const interval = setInterval(() => {
      fetchData()
    }, refreshInterval)

    return () => {
      clearInterval(interval)
    }
  }, [deviceId, refreshInterval, fetchData])

  const getStatusColor = (value: number, type: string): 'error' | 'warning' | 'success' | 'default' => {
    switch (type) {
      case 'moisture':
        return value < 20 ? 'error' : value < 40 ? 'warning' : 'success'
      case 'temperature':
        return value > 30 ? 'error' : value > 25 ? 'warning' : 'success'
      case 'humidity':
        return value > 70 ? 'error' : value > 50 ? 'warning' : 'success'
      case 'light':
        return value < 30 ? 'error' : value < 50 ? 'warning' : 'success'
      default:
        return 'default'
    }
  }

  const getStatusText = (value: number, type: string) => {
    switch (type) {
      case 'moisture':
        return value < 20 ? '매우 건조' : value < 40 ? '건조' : '적정'
      case 'temperature':
        return value > 30 ? '높음' : value > 25 ? '보통' : '적정'
      case 'humidity':
        return value > 70 ? '높음' : value > 50 ? '보통' : '적정'
      case 'light':
        return value < 30 ? '어둠' : value < 50 ? '보통' : '밝음'
      default:
        return '알 수 없음'
    }
  }

  const getValue = () => {
    if (!data) return '--'
    const value = data[valueKey]
    if (typeof value === 'number') {
      return value.toFixed(1)
    }
    return value
  }

  const getStatus = (): { color: 'error' | 'warning' | 'success' | 'default'; text: string } => {
    if (!data) return { color: 'default', text: '데이터 없음' }
    const value = data[valueKey]
    if (typeof value === 'number') {
      return {
        color: getStatusColor(value, type),
        text: getStatusText(value, type)
      }
    }
    return { color: 'default', text: '알 수 없음' }
  }

  const status = getStatus()

  return (
    <Card sx={{ 
      transition: 'all 0.3s ease-in-out',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
          {loading && (
            <CircularProgress size={16} sx={{ ml: 1 }} />
          )}
        </Box>
        
        <Typography 
          variant="h3" 
          component="div" 
          sx={{ 
            mb: 1,
            transition: 'all 0.3s ease-in-out',
            animation: data ? 'fadeIn 0.5s ease-in-out' : 'none'
          }}
        >
          {getValue()}{unit}
        </Typography>
        
        <Chip
          label={status.text}
          color={status.color}
          size="small"
        />
        
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default SensorCard
