import React, { useState, useEffect } from 'react'
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material'
import {
  WaterDrop as WaterIcon,
  Air as FanIcon,
  LightMode as LightIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { farmLinkAPI, ControlLog } from '../lib/api'

const RecentLogs: React.FC = () => {
  const [logs, setLogs] = useState<ControlLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentLogs()
    
    // 10초마다 로그 데이터 자동 새로고침
    const interval = setInterval(() => {
      fetchRecentLogs()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchRecentLogs = async () => {
    try {
      setLoading(true)
      
      const response = await farmLinkAPI.getControlLogs({
        device_id: 'farmlink-001',
        limit: 5
      })

      if (!response.success || !response.data) {
        console.error('Control logs fetch error:', response.error)
        return
      }

      setLogs(response.data)
    } catch (error) {
      console.error('Recent logs fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'water_pump':
        return <WaterIcon color="primary" />
      case 'fan':
        return <FanIcon color="secondary" />
      case 'led':
        return <LightIcon color="warning" />
      default:
        return <WarningIcon color="inherit" />
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case 'water_pump':
        return '물펌프 작동'
      case 'fan':
        return '팬 작동'
      case 'led':
        return 'LED 작동'
      default:
        return action
    }
  }

  const getTriggeredByText = (triggeredBy: string) => {
    return triggeredBy === 'auto' ? '자동' : '수동'
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (logs.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
        최근 제어 로그가 없습니다.
      </Typography>
    )
  }

  return (
    <List dense>
      {logs.map((log) => (
        <ListItem key={log.id} sx={{ px: 0 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            {getActionIcon(log.action)}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {getActionText(log.action)}
                </Typography>
                <Chip
                  label={getTriggeredByText(log.triggered_by)}
                  size="small"
                  color={log.triggered_by === 'auto' ? 'primary' : 'default'}
                  variant="outlined"
                />
                {log.duration && (
                  <Typography variant="caption" color="text.secondary">
                    ({log.duration}초)
                  </Typography>
                )}
              </Box>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {formatTime(log.created_at)}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  )
}

export default RecentLogs
