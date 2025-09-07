import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box } from '@mui/material'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import SensorData from './pages/SensorData'
import Devices from './pages/Devices'
import ThresholdSettings from './pages/ThresholdSettings'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#73BAFB',
      main: '#1877F2',
      dark: '#0C44AE',
      contrastText: '#FFFFFF',
    },
    secondary: {
      light: '#C684FF',
      main: '#8E33FF',
      dark: '#5119B7',
      contrastText: '#FFFFFF',
    },
    info: {
      light: '#61F3F3',
      main: '#00B8D9',
      dark: '#006C9C',
      contrastText: '#FFFFFF',
    },
    success: {
      light: '#77ED8B',
      main: '#22C55E',
      dark: '#118D57',
      contrastText: '#FFFFFF',
    },
    warning: {
      light: '#FFD666',
      main: '#FFAB00',
      dark: '#B76E00',
      contrastText: '#FFFFFF',
    },
    error: {
      light: '#FFAC82',
      main: '#FF5630',
      dark: '#B71D18',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"DM Sans Variable", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 0 1px rgba(145, 158, 171, 0.08), 0 2px 4px 0 rgba(145, 158, 171, 0.12)',
          borderRadius: 16,
          border: '1px solid rgba(145, 158, 171, 0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 0 0 1px rgba(145, 158, 171, 0.12), 0 8px 16px 0 rgba(145, 158, 171, 0.16)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
          fontSize: '0.875rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(24, 119, 242, 0.15)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(24, 119, 242, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)',
          },
        },
        outlined: {
          borderColor: '#E2E8F0',
          color: '#1877F2',
          '&:hover': {
            backgroundColor: 'rgba(24, 119, 242, 0.04)',
            borderColor: '#1877F2',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1877F2',
            },
          },
        },
      },
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              minHeight: '100vh',
              backgroundColor: '#f8fafc',
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sensor-data" element={<SensorData />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/threshold-settings" element={<ThresholdSettings />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App
