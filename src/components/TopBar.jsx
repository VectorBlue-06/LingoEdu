import SearchIcon from '@mui/icons-material/Search'
import {
    Box,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material'

export function TopBar({ title, subtitle }) {
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
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
                placeholder="Search..."
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
