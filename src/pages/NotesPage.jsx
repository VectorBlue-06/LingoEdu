import NoteAltIcon from '@mui/icons-material/NoteAlt'
import { Box, Typography } from '@mui/material'
import { TopBar } from '../components/TopBar'
import { useI18n } from '../context/I18nContext'

export function NotesPage() {
    const { t } = useI18n()
    return (
        <Box className="page-enter">
            <TopBar title={t('notes.title')} subtitle={t('notes.subtitle')} />
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
                    {t('notes.comingSoon')}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                    {t('notes.underDev')}
                </Typography>
            </Box>
        </Box>
    )
}
