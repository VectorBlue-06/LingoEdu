import ClassIcon from '@mui/icons-material/Class'
import HistoryIcon from '@mui/icons-material/History'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import LoginIcon from '@mui/icons-material/Login'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import TranslateIcon from '@mui/icons-material/Translate'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { useUser } from '../context/UserContext'
import { useI18n } from '../context/I18nContext'
import { getTextById, listTexts } from '../lib/textsApi'
import { joinClassroom, leaveClassroom, listJoinedClassrooms } from '../lib/classroomsApi'
import { translateText } from '../lib/translationApi'
import { LANGUAGES } from '../lib/languages'

export function StudentDashboard() {
  const { user } = useUser()
  const { t } = useI18n()
  const [selectedText, setSelectedText] = useState(null)
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[0])
  const [translation, setTranslation] = useState('')
  const [fromCache, setFromCache] = useState(false)
  const [loadingText, setLoadingText] = useState(false)
  const [loadingTranslate, setLoadingTranslate] = useState(false)
  const [error, setError] = useState(null)

  // Classroom (Supabase)
  const [classroomCode, setClassroomCode] = useState('')
  const [joinedRooms, setJoinedRooms] = useState([]) // full classroom objects
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [activeRoom, setActiveRoom] = useState(null) // currently viewed room object
  const [roomTexts, setRoomTexts] = useState([])
  const [loadingRoomTexts, setLoadingRoomTexts] = useState(false)

  // Load joined classrooms from Supabase
  useEffect(() => {
    if (!user?.name) return
    ;(async () => {
      setRoomsLoading(true)
      try {
        const data = await listJoinedClassrooms(user.name)
        setJoinedRooms(data)
      } catch (err) {
        console.error('Failed to load joined classrooms:', err)
      } finally {
        setRoomsLoading(false)
      }
    })()
  }, [user?.name])

  const handleJoinClassroom = async () => {
    const code = classroomCode.trim().toUpperCase()
    if (!code) return
    if (joinedRooms.some((r) => r.code === code)) {
      setError(t('student.alreadyJoined'))
      return
    }
    try {
      await joinClassroom({ classroom_code: code, student_name: user?.name })
      // Reload joined rooms to get the full classroom data
      const data = await listJoinedClassrooms(user.name)
      setJoinedRooms(data)
      setClassroomCode('')
    } catch (err) {
      console.error('Failed to join classroom:', err)
      setError('Could not join classroom. Check the code and try again.')
    }
  }

  const handleLeaveClassroom = async (code) => {
    try {
      await leaveClassroom({ classroom_code: code, student_name: user?.name })
      setJoinedRooms((prev) => prev.filter((r) => r.code !== code))
      if (activeRoom?.code === code) setActiveRoom(null)
    } catch (err) {
      console.error('Failed to leave classroom:', err)
    }
  }

  // Load texts when entering a classroom
  useEffect(() => {
    if (!activeRoom) {
      setRoomTexts([])
      return
    }
    ;(async () => {
      setLoadingRoomTexts(true)
      try {
        const data = await listTexts(activeRoom.code)
        setRoomTexts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingRoomTexts(false)
      }
    })()
  }, [activeRoom])

  const handleSelectText = async (id) => {
    if (!id) {
      setSelectedText(null)
      setTranslation('')
      setFromCache(false)
      return
    }

    setLoadingText(true)
    setError(null)
    try {
      const data = await getTextById(id)
      setSelectedText(data)
      setTranslation('')
      setFromCache(false)
      setTargetLanguage(LANGUAGES[0])
    } catch (err) {
      console.error(err)
      setError(t('student.loadError'))
    } finally {
      setLoadingText(false)
    }
  }

  const handleTranslate = async () => {
    if (!selectedText || !targetLanguage) return

    setLoadingTranslate(true)
    setError(null)
    try {
      const data = await translateText({
        textId: selectedText.id,
        content: selectedText.content,
        sourceLanguage: selectedText.language,
        targetLanguage: targetLanguage.code,
      })
      setTranslation(data?.translatedText ?? '')
      setFromCache(Boolean(data?.fromCache))
    } catch (err) {
      console.error(err)
      setError(t('student.translateError'))
    } finally {
      setLoadingTranslate(false)
    }
  }

  return (
    <Box className="page-enter">
      <TopBar title={`${t('student.welcome')}, ${user?.name || 'Student'}!`} />

      {/* ── Info cards: current course & last class ── */}
      {!selectedText && !activeRoom && (
        <Grid container spacing={2} sx={{ mb: 3, px: 1 }}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" className="card-enter" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <MenuBookIcon sx={{ fontSize: 32, color: 'primary.main', mb: 0.5 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {joinedRooms.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('student.joinedRooms')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" className="card-enter" sx={{ borderRadius: 2, animationDelay: '0.08s' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <HistoryIcon sx={{ fontSize: 32, color: 'secondary.main', mb: 0.5 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                  {selectedText ? selectedText.title : t('student.noRecentCourse')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('student.lastViewed')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── Join Classroom ── */}
      {!selectedText && !activeRoom && (
        <Paper
          className="card-enter"
          sx={{ p: 2.5, mb: 3, mx: 1, borderRadius: 2 }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.primary',
            }}
          >
            <ClassIcon fontSize="small" color="primary" /> {t('student.joinClassroom')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <TextField
              size="small"
              placeholder={t('student.classroomCode')}
              value={classroomCode}
              onChange={(e) => setClassroomCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinClassroom()}
              sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleJoinClassroom}
              disabled={!classroomCode.trim()}
              startIcon={<LoginIcon />}
              sx={{ borderRadius: 2 }}
            >
              {t('student.join')}
            </Button>
          </Stack>

          {error && !activeRoom && (
            <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Joined classrooms */}
          {roomsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : joinedRooms.length > 0 ? (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                {t('student.joinedRooms')}
              </Typography>
              <Grid container spacing={1.5}>
                {joinedRooms.map((room) => (
                  <Grid item xs={12} sm={6} md={4} key={room.code}>
                    <Card
                      variant="outlined"
                      className="card-enter"
                      sx={{
                        borderRadius: 2,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                      }}
                    >
                      <CardActionArea onClick={() => setActiveRoom(room)}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
                          <ClassIcon color="primary" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {room.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              by {room.teacher_name} · {room.code}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              {t('student.noRooms')}
            </Typography>
          )}
        </Paper>
      )}

      {/* ── Inside a classroom: text list ── */}
      {activeRoom && !selectedText && (
        <Box className="page-enter" sx={{ px: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Button size="small" onClick={() => setActiveRoom(null)} sx={{ borderRadius: 2 }}>
              {t('common.back')}
            </Button>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
              <ClassIcon color="primary" fontSize="small" />
              {activeRoom.name}
              <Chip label={activeRoom.code} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              by {activeRoom.teacher_name}
            </Typography>
            <Chip
              label={t('student.leave')}
              size="small"
              color="error"
              variant="outlined"
              onDelete={() => handleLeaveClassroom(activeRoom.code)}
            />
          </Stack>

          {loadingRoomTexts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : roomTexts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <LibraryBooksIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {t('student.noCourses')}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {roomTexts.map((text) => (
                <Grid item xs={12} sm={6} md={4} key={text.id}>
                  <Card
                    variant="outlined"
                    className="card-enter"
                    sx={{
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                    }}
                  >
                    <CardActionArea onClick={() => handleSelectText(text.id)}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {text.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {text.language}{text.created_by ? ` · by ${text.created_by}` : ''}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ── Selected text: translate ── */}
      {selectedText && (
        <Paper className="card-enter" sx={{ p: 3, mx: 1, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {selectedText.title}
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  setSelectedText(null)
                  setTranslation('')
                }}
                sx={{ borderRadius: 2 }}
              >
                {t('common.back')}
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {t('student.sourceLang')}: {selectedText.language}
            </Typography>
            <TextField
              label={t('student.original')}
              value={selectedText.content}
              multiline
              minRows={4}
              InputProps={{ readOnly: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Autocomplete
                options={LANGUAGES}
                getOptionLabel={(option) => option.label}
                value={targetLanguage}
                onChange={(_, v) => { if (v) setTargetLanguage(v) }}
                renderInput={(params) => <TextField {...params} label={t('student.targetLang')} size="small" />}
                disableClearable
                sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                variant="contained"
                onClick={handleTranslate}
                disabled={loadingTranslate}
                startIcon={<TranslateIcon />}
                sx={{ borderRadius: 2 }}
              >
                {loadingTranslate ? t('student.translating') : t('student.translate')}
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {translation && (
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                    {t('student.translated')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fromCache ? t('student.fromCache') : t('student.newTranslation')}
                  </Typography>
                </Stack>
                <TextField
                  value={translation}
                  multiline
                  minRows={4}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            )}
          </Stack>
        </Paper>
      )}

      {loadingText && (
        <Paper sx={{ p: 3, mx: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </Paper>
      )}
    </Box>
  )
}
