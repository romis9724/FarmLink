import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { supabase, SensorData } from '../lib/supabase'

const SensorDataPage: React.FC = () => {
  const [data, setData] = useState<SensorData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deviceFilter, setDeviceFilter] = useState('all')
  const [devices, setDevices] = useState<string[]>([])

  useEffect(() => {
    fetchSensorData()
    fetchDevices()
  }, [])

  const fetchSensorData = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('sensor_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (deviceFilter !== 'all') {
        query = query.eq('device_id', deviceFilter)
      }

      const { data: sensorData, error } = await query

      if (error) {
        console.error('Sensor data fetch error:', error)
        return
      }

      setData(sensorData || [])
    } catch (error) {
      console.error('Sensor data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDevices = async () => {
    const { data: deviceData, error } = await supabase
      .from('devices')
      .select('id, name')

    if (error) {
      console.error('Devices fetch error:', error)
      return
    }

    setDevices(deviceData?.map(d => d.id) || [])
  }

  const getStatusColor = (value: number, type: string) => {
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

  const filteredData = data.filter((item) => {
    const matchesSearch = searchTerm === '' || 
      item.device_id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'device_id',
      headerName: '디바이스 ID',
      width: 180,
      minWidth: 150,
      flex: 0.3,
    },
    {
      field: 'soil_moisture',
      headerName: '토양 수분',
      width: 140,
      minWidth: 120,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <Chip
          label={`${params.value}%`}
          color={getStatusColor(params.value, 'moisture')}
          size="small"
        />
      ),
    },
    {
      field: 'temperature',
      headerName: '온도',
      width: 120,
      minWidth: 100,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <Chip
          label={`${params.value}°C`}
          color={getStatusColor(params.value, 'temperature')}
          size="small"
        />
      ),
    },
    {
      field: 'humidity',
      headerName: '습도',
      width: 120,
      minWidth: 100,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <Chip
          label={`${params.value}%`}
          color={getStatusColor(params.value, 'humidity')}
          size="small"
        />
      ),
    },
    {
      field: 'light_intensity',
      headerName: '조도',
      width: 120,
      minWidth: 100,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <Chip
          label={`${params.value}ph`}
          color={getStatusColor(params.value, 'light')}
          size="small"
        />
      ),
    },
    {
      field: 'created_at',
      headerName: '측정 시간',
      width: 200,
      minWidth: 180,
      flex: 0.4,
      renderCell: (params: any) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleString('ko-KR')}
        </Typography>
      ),
    },
  ]

  const handleExport = () => {
    const csvContent = [
      ['ID', '디바이스 ID', '토양 수분 (%)', '온도 (°C)', '습도 (%)', '조도 (ph)', '측정 시간'],
      ...filteredData.map(item => [
        item.id,
        item.device_id,
        item.soil_moisture,
        item.temperature,
        item.humidity,
        item.light_intensity,
        new Date(item.created_at).toLocaleString('ko-KR')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `sensor_data_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#1877F2', fontWeight: 700 }}>
          센서 데이터
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            CSV 내보내기
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSensorData}
          >
            새로고침
          </Button>
        </Stack>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="디바이스 ID 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>디바이스 필터</InputLabel>
              <Select
                value={deviceFilter}
                label="디바이스 필터"
                onChange={(e) => setDeviceFilter(e.target.value)}
              >
                <MenuItem value="all">전체</MenuItem>
                {devices.map((deviceId) => (
                  <MenuItem key={deviceId} value={deviceId}>
                    {deviceId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              loading={loading}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(145, 158, 171, 0.12)',
                  fontSize: '0.875rem',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'rgba(24, 119, 242, 0.08)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#1877F2',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(24, 119, 242, 0.04)',
                },
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid rgba(145, 158, 171, 0.12)',
                },
                '& .MuiDataGrid-root': {
                  border: 'none',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SensorDataPage
