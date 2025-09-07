import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Sensors as SensorsIcon,
  Devices as DevicesIcon,
  ControlCamera as ControlIcon,
} from '@mui/icons-material'

const drawerWidth = 200

const menuItems = [
  { text: '대시보드', icon: <DashboardIcon />, path: '/' },
  { text: '센서 데이터', icon: <SensorsIcon />, path: '/sensor-data' },
  { text: '디바이스 관리', icon: <DevicesIcon />, path: '/devices' },
  { text: '임계치 설정', icon: <ControlIcon />, path: '/threshold-settings' },
]

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1877F2',
          color: 'white',
          position: 'relative',
          height: '100vh',
          border: 'none',
          boxShadow: '0 0 0 1px rgba(145, 158, 171, 0.08), 0 2px 4px 0 rgba(145, 158, 171, 0.12)',
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          🌱 Farm Link
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
          관리자 대시보드
        </Typography>
      </Box>
      
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
      
      <List sx={{ pt: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}

export default Sidebar
