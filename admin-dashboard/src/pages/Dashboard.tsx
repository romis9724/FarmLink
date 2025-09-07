import React, { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material'
import {
  WaterDrop as WaterIcon,
  Thermostat as TempIcon,
  LightMode as LightIcon,
  Air as HumidityIcon,
  DeviceHub as DeviceIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { farmLinkAPI, Device } from '../lib/api'
import SensorChart from '../components/SensorChart'
import RecentLogs from '../components/RecentLogs'
import SensorCard from '../components/SensorCard'

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const response = await farmLinkAPI.getDevices()

      if (!response.success || !response.data) {
        console.error('Devices fetch error:', response.error)
        // 샘플 디바이스 데이터 사용
        setDevices([{
          id: 'farmlink-001',
          name: 'Farm Link Main Device',
          location: 'Greenhouse A',
          status: 'active',
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        return
      }

      setDevices(response.data)
    } catch (err) {
      setError('디바이스 데이터를 불러오는 중 오류가 발생했습니다.')
      console.error('Devices fetch error:', err)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          대시보드
        </Typography>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            데이터를 불러오는 중...
          </Typography>
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', p: 0, m: -3 }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: '#1877F2', fontWeight: 700 }}>
            대시보드
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: '#4CAF50',
              animation: 'pulse 5s infinite'
            }} />
            <Typography variant="body2" color="text.secondary">
              5초마다 업데이트
            </Typography>
          </Box>
        </Box>

      {/* 센서 데이터 카드들 - 개별 새로고침 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SensorCard
            title="토양 수분"
            icon={<WaterIcon sx={{ color: '#1877F2' }} />}
            valueKey="soil_moisture"
            unit="%"
            type="moisture"
            deviceId="farmlink-001"
            refreshInterval={5000}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SensorCard
            title="온도"
            icon={<TempIcon sx={{ color: '#FFAB00' }} />}
            valueKey="temperature"
            unit="°C"
            type="temperature"
            deviceId="farmlink-001"
            refreshInterval={5000}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SensorCard
            title="습도"
            icon={<HumidityIcon sx={{ color: '#00B8D9' }} />}
            valueKey="humidity"
            unit="%"
            type="humidity"
            deviceId="farmlink-001"
            refreshInterval={5000}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SensorCard
            title="조도"
            icon={<LightIcon sx={{ color: '#FFAB00' }} />}
            valueKey="light_intensity"
            unit="ph"
            type="light"
            deviceId="farmlink-001"
            refreshInterval={5000}
          />
        </Grid>
      </Grid>

      {/* 디바이스 상태 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DeviceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">디바이스 상태</Typography>
              </Box>
              {devices.length > 0 ? (
                devices.map((device) => (
                  <Box key={device.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {device.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      위치: {device.location}
                    </Typography>
                    <Chip
                      label={device.status}
                      color={device.status === 'active' ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                  등록된 디바이스가 없습니다.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">최근 알림</Typography>
              </Box>
              <RecentLogs />
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* 센서 데이터 차트 */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                센서 데이터 추이
              </Typography>
              <SensorChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>
    </Box>
  )
}

export default Dashboard
