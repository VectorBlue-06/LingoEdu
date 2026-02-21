import FacebookIcon from '@mui/icons-material/Facebook'
import GoogleIcon from '@mui/icons-material/Google'
import GroupsIcon from '@mui/icons-material/Groups'
import VisibilityReduceIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
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

export function LoginPage() {
  const { login } = useUser()
  const { effectsEnabled, toggleEffects } = useThemeMode()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [touched, setTouched] = useState(false)

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
          ...(effectsEnabled && {
            backdropFilter: 'blur(10px)',
            bgcolor: 'rgba(255,255,255,0.85)',
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
              >
                Connect. Learn. Grow.
              </Typography>
            </Box>

            {/* Right side - form */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, mb: 0.5, color: '#333' }}
              >
                Get Started Now
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                It's free to join and gain full access to exciting learning opportunities.
              </Typography>

              {/* Role selection */}
              <FormControl component="fieldset" error={roleError} sx={{ mb: 2, width: '100%' }}>
                <RadioGroup row value={role} onChange={(e) => setRole(e.target.value)}>
                  <FormControlLabel
                    value="teacher"
                    control={<Radio size="small" />}
                    label="I'm a Teacher"
                    sx={{ '& .MuiTypography-root': { fontSize: 14 } }}
                  />
                  <FormControlLabel
                    value="student"
                    control={<Radio size="small" />}
                    label="I'm a Student"
                    sx={{ '& .MuiTypography-root': { fontSize: 14 } }}
                  />
                </RadioGroup>
                {roleError && (
                  <Typography variant="caption" color="error">
                    Please select a role.
                  </Typography>
                )}
              </FormControl>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                  {/* Email placeholder */}
                  <TextField
                    fullWidth
                    label="Email Address"
                    size="small"
                    disabled
                    placeholder="Coming soon"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Name - functional */}
                  <TextField
                    fullWidth
                    label="Name"
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={nameError}
                    helperText={nameError ? 'Name is required' : ''}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Password placeholder */}
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    size="small"
                    disabled
                    placeholder="Coming soon"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  {/* Checkboxes */}
                  <FormControlLabel
                    control={<Checkbox size="small" disabled />}
                    label={
                      <Typography variant="caption" color="text.secondary">
                        I agree to the website's Privacy Policy & Terms and Conditions.
                      </Typography>
                    }
                  />
                  {role === 'teacher' && (
                    <FormControlLabel
                      control={<Checkbox size="small" disabled />}
                      label={
                        <Typography variant="caption" color="text.secondary">
                          I certify that I am an accredited Teacher.
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
                    Continue
                  </Button>

                  {/* Sign in link placeholder */}
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Already have an account?{' '}
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: '#764ba2', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Sign In
                    </Typography>{' '}
                    here
                  </Typography>

                  {/* Social login placeholders */}
                  <Divider>
                    <Typography variant="caption" color="text.secondary">
                      OR Continue With
                    </Typography>
                  </Divider>
                  <Stack direction="row" justifyContent="center" spacing={2}>
                    <IconButton disabled sx={{ border: 1, borderColor: 'divider' }}>
                      <GoogleIcon />
                    </IconButton>
                    <IconButton disabled sx={{ border: 1, borderColor: 'divider' }}>
                      <FacebookIcon />
                    </IconButton>
                    <IconButton disabled sx={{ border: 1, borderColor: 'divider' }}>
                      <GroupsIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Performance toggle button */}
      <Tooltip title={effectsEnabled ? 'Disable effects (better performance)' : 'Enable effects'}>
        <IconButton
          onClick={toggleEffects}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(4px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
          }}
        >
          {effectsEnabled ? <VisibilityIcon /> : <VisibilityReduceIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  )
}
