import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material'
import { useMemo } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './components/AppLayout'
import { ThemeProvider, useThemeMode } from './context/ThemeContext'
import { UserProvider, useUser } from './context/UserContext'
import { CalendarPage } from './pages/CalendarPage'
import { CoursesPage } from './pages/CoursesPage'
import { LoginPage } from './pages/LoginPage'
import { NotesPage } from './pages/NotesPage'
import { StudentDashboard } from './pages/StudentDashboard'
import { TeacherDashboard } from './pages/TeacherDashboard'

function getTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#4CAF50' : '#66BB6A',
      },
      secondary: {
        main: '#9C27B0',
      },
      background: {
        default: mode === 'light' ? '#F5F5F5' : '#121212',
        paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
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

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
          path="/notes"
          element={
            <RequireAuth>
              <NotesPage />
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
        <UserProvider>
          <AppRoutes />
        </UserProvider>
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
