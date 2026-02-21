import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LogoutIcon from '@mui/icons-material/Logout'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { useThemeMode } from '../context/ThemeContext'
import { useUser } from '../context/UserContext'
import { useI18n } from '../context/I18nContext'
import { LANGUAGES } from '../lib/languages'

export function SettingsPage() {
  const { user, logout } = useUser()
  const { mode, toggleMode } = useThemeMode()
  const { locale, setLocale, t } = useI18n()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const selectedLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0]

  return (
    <Box>
      <TopBar title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <Stack spacing={3} sx={{ px: 1, maxWidth: 600 }}>
        {/* Appearance */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? '#fafbfc' : '#252530',
          }}
        >
          <CardContent>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
            >
              {t('settings.appearance')}
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" color="text.primary">
                {t('settings.theme')}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                onClick={toggleMode}
                sx={{ borderRadius: 2 }}
              >
                {mode === 'light' ? t('settings.dark') : t('settings.light')}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Language */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? '#fafcff' : '#252535',
          }}
        >
          <CardContent>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
            >
              {t('settings.language')}
            </Typography>
            <Autocomplete
              options={LANGUAGES}
              getOptionLabel={(option) => option.label}
              value={selectedLang}
              onChange={(_, newValue) => {
                if (newValue) setLocale(newValue.code)
              }}
              renderInput={(params) => (
                <TextField {...params} label={t('settings.language')} size="small" />
              )}
              disableClearable
              sx={{ maxWidth: 350 }}
            />
          </CardContent>
        </Card>

        {/* Account */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? '#fcfaff' : '#282530',
          }}
        >
          <CardContent>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
            >
              {t('settings.account')}
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('settings.name')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {user?.name}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('settings.role')}
                </Typography>
                <Chip
                  label={user?.role}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ borderRadius: 2, alignSelf: 'flex-start' }}
        >
          {t('panel.logout')}
        </Button>
      </Stack>
    </Box>
  )
}
