import { Box } from '@mui/material'
import { useUser } from '../context/UserContext'
import { Sidebar } from './Sidebar'
import { UserPanel } from './UserPanel'

export function AppLayout({ children }) {
  const { user } = useUser()

  // For login page (no user), render full-width without sidebar/panel
  if (!user) {
    return <>{children}</>
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          overflow: 'auto',
          animation: 'fadeIn 0.35s ease-out both',
        }}
      >
        {children}
      </Box>
      <UserPanel />
    </Box>
  )
}
