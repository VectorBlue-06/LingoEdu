import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material'
import { useMemo } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './components/AppLayout'
import { I18nProvider } from './context/I18nContext'
import { ThemeProvider, useThemeMode } from './context/ThemeContext'
import { UserProvider, useUser } from './context/UserContext'
import { CalendarPage } from './pages/CalendarPage'
import { CoursesPage } from './pages/CoursesPage'
import { LoginPage } from './pages/LoginPage'
import { ClassesPage } from './pages/ClassesPage'
import { SettingsPage } from './pages/SettingsPage'
import { StudentDashboard } from './pages/StudentDashboard'
import { TeacherDashboard } from './pages/TeacherDashboard'

// LingoEdu brand palette
const BRAND = {
  steelBlue: '#317BC6',
  indigoVelvet: '#47349D',
  lavender: '#CFCEE0',
  persianBlue: '#4F3CAF',
  deepTwilight: '#16195E',
}

function getTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: BRAND.persianBlue,
        dark: BRAND.indigoVelvet,
        light: BRAND.steelBlue,
      },
      secondary: {
        main: BRAND.steelBlue,
      },
      background: {
        default: mode === 'light' ? '#F4F3FA' : '#0e0e1a',
        paper: mode === 'light' ? '#FFFFFF' : '#1a1a2e',
      },
      text: {
        primary: mode === 'light' ? BRAND.deepTwilight : '#e8e8f0',
        secondary: mode === 'light' ? '#555770' : '#a0a0b8',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backdropFilter: 'blur(12px)',
            backgroundColor: mode === 'light'
              ? 'rgba(255, 255, 255, 0.70)'
              : 'rgba(26, 26, 46, 0.70)',
            border: `1px solid ${mode === 'light' ? 'rgba(207,206,224,0.5)' : 'rgba(207,206,224,0.08)'}`,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backdropFilter: 'blur(12px)',
            backgroundColor: mode === 'light'
              ? 'rgba(255, 255, 255, 0.75)'
              : 'rgba(26, 26, 46, 0.75)',
            border: `1px solid ${mode === 'light' ? 'rgba(207,206,224,0.4)' : 'rgba(207,206,224,0.08)'}`,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? BRAND.deepTwilight : '#e8e8f0',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? '#555770' : '#a0a0b8',
          },
        },
      },
    },
  })
}

function RequireUser({ children, allowedRole }) {
  const { user } = useUser()

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />
  }

  return children
}

function RequireAuth({ children }) {
  const { user } = useUser()
  if (!user) {
    return <Navigate to="/" replace />
  }
  return children
}

/** Redirect logged-in users from "/" to their dashboard */
function LoginRoute() {
  const { user } = useUser()
  if (user) {
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
  }
  return <LoginPage />
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<LoginRoute />} />
        <Route
          path="/teacher"
          element={
            <RequireUser allowedRole="teacher">
              <TeacherDashboard />
            </RequireUser>
          }
        />
        <Route
          path="/student"
          element={
            <RequireUser allowedRole="student">
              <StudentDashboard />
            </RequireUser>
          }
        />
        <Route
          path="/courses"
          element={
            <RequireAuth>
              <CoursesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/calendar"
          element={
            <RequireAuth>
              <CalendarPage />
            </RequireAuth>
          }
        />
        <Route
          path="/classes"
          element={
            <RequireAuth>
              <ClassesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

function ThemedApp() {
  const { mode } = useThemeMode()
  const theme = useMemo(() => getTheme(mode), [mode])

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <I18nProvider>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </I18nProvider>
      </BrowserRouter>
    </MuiThemeProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  )
}

export default App
