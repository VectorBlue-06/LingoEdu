import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { Box, Typography } from '@mui/material'
import { TopBar } from '../components/TopBar'

export function CalendarPage() {
    return (
        <Box>
            <TopBar title="Calendar" subtitle="Keep track of your schedule" />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 12,
                    gap: 2,
                }}
            >
                <CalendarMonthIcon sx={{ fontSize: 72, color: 'text.disabled' }} />
                <Typography variant="h6" color="text.secondary">
                    Calendar coming soon
                </Typography>
                <Typography variant="body2" color="text.disabled">
                    This feature is currently under development.
                </Typography>
            </Box>
        </Box>
    )
}
