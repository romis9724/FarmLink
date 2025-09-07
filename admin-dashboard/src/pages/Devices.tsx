import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { supabase, Device } from '../lib/supabase'

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Devices fetch error:', error)
        return
      }

      setDevices(data || [])
    } catch (error) {
      console.error('Devices fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '디바이스 ID',
      width: 180,
      minWidth: 150,
      flex: 0.3,
    },
    {
      field: 'name',
      headerName: '디바이스 이름',
      width: 200,
      minWidth: 180,
      flex: 0.4,
    },
    {
      field: 'location',
      headerName: '위치',
      width: 150,
      minWidth: 120,
      flex: 0.2,
    },
    {
      field: 'status',
      headerName: '상태',
      width: 100,
      minWidth: 80,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'last_seen',
      headerName: '마지막 접속',
      width: 180,
      minWidth: 160,
      flex: 0.3,
      renderCell: (params: any) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleString('ko-KR') : '없음'}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: '생성일',
      width: 180,
      minWidth: 160,
      flex: 0.3,
      renderCell: (params: any) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleString('ko-KR')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 120,
      minWidth: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params: any) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="편집">
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton size="small" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ]

  const handleEdit = (device: Device) => {
    // 편집 로직 구현
    console.log('Edit device:', device)
  }

  const handleDelete = async (deviceId: string) => {
    if (window.confirm('정말로 이 디바이스를 삭제하시겠습니까?')) {
      try {
        const { error } = await supabase
          .from('devices')
          .delete()
          .eq('id', deviceId)

        if (error) {
          console.error('Delete error:', error)
          return
        }

        await fetchDevices()
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }

  const handleAdd = () => {
    // 추가 로직 구현
    console.log('Add new device')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: '#1877F2', fontWeight: 700 }}>
          디바이스 관리
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            디바이스 추가
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDevices}
          >
            새로고침
          </Button>
        </Stack>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={devices}
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

export default DevicesPage
