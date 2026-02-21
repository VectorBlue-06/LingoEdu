import NoteAltIcon from '@mui/icons-material/NoteAlt'
import { Box, Typography } from '@mui/material'
import { TopBar } from '../components/TopBar'

export function NotesPage() {
    return (
        <Box>
            <TopBar title="Notes" subtitle="Your personal notes" />
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
                <NoteAltIcon sx={{ fontSize: 72, color: 'text.disabled' }} />
                <Typography variant="h6" color="text.secondary">
                    Notes coming soon
                </Typography>
                <Typography variant="body2" color="text.disabled">
                    This feature is currently under development.
                </Typography>
            </Box>
        </Box>
    )
}
