import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'

interface ThresholdConfig {
  id?: number
  device_id: string
  config_name: string
  temperature_threshold?: number
  humidity_threshold?: number
  soil_moisture_threshold?: number
  light_intensity_threshold?: number
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
}

interface Device {
  id: string
  name: string
  location: string
  status: string
  created_at: string
}

const ThresholdSettings: React.FC = () => {
  const [configs, setConfigs] = useState<ThresholdConfig[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ show: boolean; message: string; severity: 'success' | 'error' }>({
    show: false,
    message: '',
    severity: 'success'
  })
  const [dialog, setDialog] = useState<{ open: boolean; config: ThresholdConfig | null }>({
    open: false,
    config: null
  })
  const [formData, setFormData] = useState<Partial<ThresholdConfig>>({
    config_name: '',
    temperature_threshold: 30,
    humidity_threshold: 70,
    soil_moisture_threshold: 20,
    light_intensity_threshold: 60,
    is_active: false
  })

  // 장치 목록 조회
  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('장치 목록 API 응답:', result)
      const devicesData = result.success ? result.data : []
      console.log('장치 데이터:', devicesData)
      setDevices(devicesData || [])
      
      // 첫 번째 장치를 기본 선택
      if (devicesData && devicesData.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(devicesData[0].id)
      }
    } catch (error) {
      console.error('장치 목록 조회 오류:', error)
      setAlert({ show: true, message: '장치 목록 조회 실패', severity: 'error' })
    }
  }

  // 임계치 설정 조회
  const fetchConfigs = async () => {
    if (!selectedDeviceId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/threshold-configs/${selectedDeviceId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setConfigs(data || [])
    } catch (error) {
      console.error('임계치 설정 조회 오류:', error)
      setAlert({ show: true, message: '임계치 설정 조회 실패', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // 임계치 설정 저장
  const saveConfig = async () => {
    try {
      setSaving(true)
      const url = dialog.config?.id 
        ? `/api/threshold-configs/${dialog.config.id}`
        : `/api/threshold-configs/${selectedDeviceId}`
      
      const method = dialog.config?.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      setAlert({ 
        show: true, 
        message: dialog.config?.id ? '설정이 수정되었습니다.' : '설정이 저장되었습니다.', 
        severity: 'success' 
      })
      
      setDialog({ open: false, config: null })
      setFormData({
        config_name: '',
        temperature_threshold: 30,
        humidity_threshold: 70,
        soil_moisture_threshold: 20,
        light_intensity_threshold: 60,
        is_active: false
      })
      fetchConfigs()
    } catch (error) {
      console.error('임계치 설정 저장 오류:', error)
      setAlert({ 
        show: true, 
        message: `설정 저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, 
        severity: 'error' 
      })
    } finally {
      setSaving(false)
    }
  }

  // 설정 활성화/비활성화
  const toggleActive = async (config: ThresholdConfig) => {
    try {
      const response = await fetch(`/api/threshold-configs/${config.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !config.is_active })
      })

      if (!response.ok) {
        throw new Error('상태 변경 실패')
      }

      setAlert({ 
        show: true, 
        message: config.is_active ? '설정이 비활성화되었습니다.' : '설정이 활성화되었습니다.', 
        severity: 'success' 
      })
      fetchConfigs()
    } catch (error) {
      console.error('상태 변경 오류:', error)
      setAlert({ show: true, message: '상태 변경 실패', severity: 'error' })
    }
  }

  // 설정 삭제
  const deleteConfig = async (id: number) => {
    if (!window.confirm('이 설정을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/threshold-configs/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('삭제 실패')
      }

      setAlert({ show: true, message: '설정이 삭제되었습니다.', severity: 'success' })
      fetchConfigs()
    } catch (error) {
      console.error('삭제 오류:', error)
      setAlert({ show: true, message: '삭제 실패', severity: 'error' })
    }
  }


  // 새 설정 추가
  const addConfig = () => {
    setFormData({
      config_name: '',
      temperature_threshold: 30,
      humidity_threshold: 70,
      soil_moisture_threshold: 20,
      light_intensity_threshold: 60,
      is_active: false
    })
    setDialog({ open: true, config: null })
  }

  // 설정 편집
  const editConfig = (config: ThresholdConfig) => {
    setFormData(config)
    setDialog({ open: true, config })
  }

  // 장치 변경 시 임계치 설정 다시 로드
  useEffect(() => {
    if (selectedDeviceId) {
      fetchConfigs()
    }
  }, [selectedDeviceId])

  // 컴포넌트 마운트 시 장치 목록 로드
  useEffect(() => {
    fetchDevices()
  }, [])

  // 알림 자동 숨김
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert(prev => ({ ...prev, show: false }))
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [alert.show])

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, color: '#1877F2', fontWeight: 700 }}>
        센서 임계치 설정
      </Typography>

      {alert.show && (
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 3 }}
          onClose={() => setAlert(prev => ({ ...prev, show: false }))}
        >
          {alert.message}
        </Alert>
      )}

      {/* 장치 선택 및 설정 추가 버튼 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>장치 선택</InputLabel>
          <Select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            label="장치 선택"
          >
            {Array.isArray(devices) && devices.map((device) => (
              <MenuItem key={device.id} value={device.id}>
                {device.name} ({device.location})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={addConfig}
          disabled={!selectedDeviceId}
          sx={{ backgroundColor: '#1877F2' }}
        >
          새 설정 추가
        </Button>
      </Box>

      {/* 설정 목록 테이블 */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SettingsIcon sx={{ mr: 1, color: '#1877F2' }} />
            <Typography variant="h6" sx={{ color: '#1877F2', fontWeight: 600 }}>
              임계치 설정 목록
            </Typography>
          </Box>

          {!selectedDeviceId ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                장치를 선택해주세요.
              </Typography>
            </Box>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>설정명</TableCell>
                    <TableCell>온도 (≥)</TableCell>
                    <TableCell>습도 (≥)</TableCell>
                    <TableCell>수분량 (&lt;)</TableCell>
                    <TableCell>조도 (&gt;)</TableCell>
                    <TableCell>상태</TableCell>
                    <TableCell>설정일</TableCell>
                    <TableCell>작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {config.config_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {config.temperature_threshold ? `${config.temperature_threshold}°C` : '-'}
                      </TableCell>
                      <TableCell>
                        {config.humidity_threshold ? `${config.humidity_threshold}%` : '-'}
                      </TableCell>
                      <TableCell>
                        {config.soil_moisture_threshold ? `${config.soil_moisture_threshold}%` : '-'}
                      </TableCell>
                      <TableCell>
                        {config.light_intensity_threshold ? `${config.light_intensity_threshold}ph` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={config.is_active ? '활성' : '비활성'}
                          color={config.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(config.created_at).toLocaleDateString('ko-KR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleActive(config)}
                          color={config.is_active ? 'warning' : 'success'}
                        >
                          <Switch checked={config.is_active} size="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editConfig(config)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteConfig(config.id!)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* 설정 편집 다이얼로그 */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, config: null })} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialog.config?.id ? '임계치 설정 편집' : '새 임계치 설정 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="설정명"
                  value={formData.config_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, config_name: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="온도 임계값 (≥)"
                  type="number"
                  value={formData.temperature_threshold || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, temperature_threshold: parseFloat(e.target.value) }))}
                  fullWidth
                  helperText="팬 작동 온도 (기본: 30°C)"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="습도 임계값 (≥)"
                  type="number"
                  value={formData.humidity_threshold || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, humidity_threshold: parseFloat(e.target.value) }))}
                  fullWidth
                  helperText="팬 작동 습도 (기본: 70%)"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="수분량 임계값 (<)"
                  type="number"
                  value={formData.soil_moisture_threshold || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, soil_moisture_threshold: parseFloat(e.target.value) }))}
                  fullWidth
                  helperText="펌프 작동 수분량 (기본: 20%)"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="조도 임계값 (>)"
                  type="number"
                  value={formData.light_intensity_threshold || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, light_intensity_threshold: parseFloat(e.target.value) }))}
                  fullWidth
                  helperText="LED 작동 조도 (기본: 60ph)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                  }
                  label="활성화 (활성화 시 다른 설정들은 자동으로 비활성화됩니다)"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, config: null })} startIcon={<CancelIcon />}>
            취소
          </Button>
          <Button 
            onClick={saveConfig} 
            variant="contained" 
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={saving || !formData.config_name}
          >
            {saving ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ThresholdSettings
