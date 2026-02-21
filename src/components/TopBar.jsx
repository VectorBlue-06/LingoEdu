import SearchIcon from '@mui/icons-material/Search'
import {
    Box,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material'
import { useI18n } from '../context/I18nContext'

export function TopBar({ title, subtitle }) {
    const { t } = useI18n()
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                py: 1.5,
                gap: 2,
            }}
        >
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Box>
            <TextField
                size="small"
                placeholder={t('common.search')}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    width: 260,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.default',
                    },
                }}
            />
        </Box>
    )
}
