import FacebookIcon from '@mui/icons-material/Facebook'
import GoogleIcon from '@mui/icons-material/Google'
import GroupsIcon from '@mui/icons-material/Groups'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useThemeMode } from '../context/ThemeContext'
import { useI18n } from '../context/I18nContext'
import { LANGUAGES } from '../lib/languages'

export function LoginPage() {
  const { login } = useUser()
  const { effectsEnabled } = useThemeMode()
  const { locale, setLocale, t, tOriginal, isTranslated } = useI18n()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [touched, setTouched] = useState(false)

  const selectedLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0]

  const handleSubmit = (event) => {
    event.preventDefault()
    setTouched(true)

    if (!name.trim() || !role) {
      return
    }

    login({ name: name.trim(), role })
    navigate(role === 'teacher' ? '/teacher' : '/student')
  }

  const nameError = touched && !name.trim()
  const roleError = touched && !role

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        ...(effectsEnabled
          ? {
            background:
              'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #5ee7df 100%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background:
                'radial-gradient(circle at 20% 80%, rgba(120, 200, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(200, 120, 255, 0.3) 0%, transparent 50%)',
              animation: 'float 8s ease-in-out infinite alternate',
            },
          }
          : {
            bgcolor: '#f0e6ff',
          }),
      }}
    >
      <Card
        elevation={effectsEnabled ? 8 : 2}
        sx={{
          maxWidth: 820,
          width: '100%',
          mx: 2,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          animation: 'slideUp 0.5s ease-out both',
          ...(effectsEnabled && {
            backdropFilter: 'blur(20px) saturate(180%)',
            bgcolor: 'rgba(255,255,255,0.60)',
            border: '1px solid rgba(255,255,255,0.45)',
            boxShadow: '0 8px 32px rgba(118, 75, 162, 0.25)',
          }),
          ...(!effectsEnabled && {
            bgcolor: 'rgba(255,255,255,0.95)',
          }),
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              alignItems: 'center',
            }}
          >
            {/* Left side - decorative illustration placeholder */}
            <Box
              sx={{
                flex: 1,
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                py: 4,
              }}
            >
              <GroupsIcon sx={{ fontSize: 120, color: '#764ba2', opacity: 0.8 }} />
              <Typography
                variant="body2"
                sx={{ color: '#764ba2', textAlign: 'center', fontWeight: 500 }}
                title={isTranslated ? tOriginal('login.connect') : undefined}
              >
                {t('login.connect')}
              </Typography>
            </Box>

            {/* Right side - form */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, mb: 0.5, color: '#2d1b4e' }}
                title={isTranslated ? tOriginal('login.title') : undefined}
              >
                {t('login.title')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: '#555' }}
                title={isTranslated ? tOriginal('login.subtitle') : undefined}
              >
                {t('login.subtitle')}
              </Typography>

              {/* Role selection */}
              <FormControl component="fieldset" error={roleError} sx={{ mb: 2, width: '100%' }}>
                <RadioGroup row value={role} onChange={(e) => setRole(e.target.value)}>
                  <FormControlLabel
                    value="teacher"
                    control={<Radio size="small" />}
                    label={t('login.teacher')}
                    title={isTranslated ? tOriginal('login.teacher') : undefined}
                    sx={{ '& .MuiTypography-root': { fontSize: 14, color: '#3d2a5c' } }}
                  />
                  <FormControlLabel
                    value="student"
                    control={<Radio size="small" />}
                    label={t('login.student')}
                    title={isTranslated ? tOriginal('login.student') : undefined}
                    sx={{ '& .MuiTypography-root': { fontSize: 14, color: '#3d2a5c' } }}
                  />
                </RadioGroup>
                {roleError && (
                  <Typography variant="caption" color="error">
                    {t('login.selectRole')}
                  </Typography>
                )}
              </FormControl>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                  {/* Interface language selector */}
                  <Autocomplete
                    options={LANGUAGES}
                    getOptionLabel={(option) => option.label}
                    value={selectedLang}
                    onChange={(_, newValue) => {
                      if (newValue) setLocale(newValue.code)
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('login.uiLanguage')}
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius: 2 },
                          '& .MuiInputBase-input': { color: '#2d1b4e' },
                          '& .MuiInputLabel-root': { color: '#5a4478' },
                        }}
                      />
                    )}
                    disableClearable
                    size="small"
                  />

                  {/* Email placeholder */}
                  <Tooltip title={t('login.comingSoonFeature')} placement="top" arrow>
                    <TextField
                      fullWidth
                      label={t('login.email')}
                      size="small"
                      disabled
                      placeholder={t('common.comingSoon')}
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        '& .MuiInputLabel-root': { color: '#5a4478' },
                        '& .Mui-disabled': { WebkitTextFillColor: '#7a6a94' },
                        '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(118, 75, 162, 0.3)' },
                      }}
                    />
                  </Tooltip>

                  {/* Name - functional */}
                  <TextField
                    fullWidth
                    label={t('login.name')}
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={nameError}
                    helperText={nameError ? t('login.nameRequired') : ''}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                      '& .MuiInputBase-input': { color: '#2d1b4e' },
                      '& .MuiInputLabel-root': { color: '#5a4478' },
                    }}
                  />

                  {/* Password placeholder */}
                  <Tooltip title={t('login.comingSoonFeature')} placement="top" arrow>
                    <TextField
                      fullWidth
                      label={t('login.password')}
                      type="password"
                      size="small"
                      disabled
                      placeholder={t('common.comingSoon')}
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                        '& .MuiInputLabel-root': { color: '#5a4478' },
                        '& .Mui-disabled': { WebkitTextFillColor: '#7a6a94' },
                        '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(118, 75, 162, 0.3)' },
                      }}
                    />
                  </Tooltip>

                  {/* Teacher certification checkbox */}
                  {role === 'teacher' && (
                    <FormControlLabel
                      control={<Checkbox size="small" disabled sx={{ color: '#764ba2' }} />}
                      label={
                        <Typography variant="caption" sx={{ color: '#5a4478' }}>
                          {t('login.certify')}
                        </Typography>
                      }
                    />
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      py: 1.2,
                      borderRadius: 2,
                      fontSize: 15,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #764ba2, #667eea)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5e3a82, #5268d0)',
                      },
                    }}
                  >
                    {t('login.continue')}
                  </Button>

                  {/* Sign in link placeholder */}
                  <Typography variant="body2" sx={{ color: '#5a4478' }} textAlign="center"
                    title={isTranslated ? tOriginal('login.signIn') : undefined}
                  >
                    {t('login.signIn')}{' '}
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: '#764ba2', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {t('login.signInLink')}
                    </Typography>{' '}
                    here
                  </Typography>

                  {/* Social login placeholders */}
                  <Divider>
                    <Typography variant="caption" sx={{ color: '#5a4478' }}>
                      {t('login.orContinue')}
                    </Typography>
                  </Divider>
                  <Stack direction="row" justifyContent="center" spacing={2}>
                    <Tooltip title={t('login.comingSoonFeature')} arrow>
                      <span>
                        <IconButton disabled sx={{ border: 1, borderColor: 'rgba(118, 75, 162, 0.3)' }}>
                          <GoogleIcon sx={{ color: '#764ba2' }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={t('login.comingSoonFeature')} arrow>
                      <span>
                        <IconButton disabled sx={{ border: 1, borderColor: 'rgba(118, 75, 162, 0.3)' }}>
                          <FacebookIcon sx={{ color: '#764ba2' }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={t('login.comingSoonFeature')} arrow>
                      <span>
                        <IconButton disabled sx={{ border: 1, borderColor: 'rgba(118, 75, 162, 0.3)' }}>
                          <GroupsIcon sx={{ color: '#764ba2' }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
