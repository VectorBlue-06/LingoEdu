import AddIcon from '@mui/icons-material/Add'
import ClassIcon from '@mui/icons-material/Class'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import SearchIcon from '@mui/icons-material/Search'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { useUser } from '../context/UserContext'
import { useI18n } from '../context/I18nContext'
import {
  createClassroom,
  deleteClassroom,
  joinClassroom,
  leaveClassroom,
  listAllClassrooms,
  listJoinedClassrooms,
  listTeacherClassrooms,
  searchClassrooms,
} from '../lib/classroomsApi'

export function ClassesPage() {
  const { user } = useUser()
  const { t } = useI18n()
  const isTeacher = user?.role === 'teacher'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Teacher state
  const [teacherClassrooms, setTeacherClassrooms] = useState([])
  const [newClassName, setNewClassName] = useState('')

  // Student state
  const [joinedRooms, setJoinedRooms] = useState([])
  const [allClassrooms, setAllClassrooms] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  // Load data on mount
  useEffect(() => {
    if (!user?.name) return
    ;(async () => {
      setLoading(true)
      try {
        if (isTeacher) {
          const data = await listTeacherClassrooms(user.name)
          setTeacherClassrooms(data)
        } else {
          const [joined, all] = await Promise.all([
            listJoinedClassrooms(user.name),
            listAllClassrooms(),
          ])
          setJoinedRooms(joined)
          setAllClassrooms(all)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.name, isTeacher])

  /* ── Teacher actions ── */
  const handleCreateClass = async () => {
    if (!newClassName.trim()) return
    setError(null)
    try {
      const room = await createClassroom({
        name: newClassName.trim(),
        teacher_name: user?.name,
      })
      setTeacherClassrooms((prev) => [room, ...prev])
      setNewClassName('')
      setSuccess(t('classes.classCreated'))
    } catch (err) {
      console.error(err)
      setError(t('classes.createError'))
    }
  }

  const handleDeleteClass = async (id) => {
    try {
      await deleteClassroom(id)
      setTeacherClassrooms((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
  }

  /* ── Student actions ── */
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }
    try {
      const results = await searchClassrooms(searchQuery)
      setSearchResults(results)
    } catch (err) {
      console.error(err)
    }
  }

  const handleJoin = async (code) => {
    try {
      await joinClassroom({ classroom_code: code, student_name: user?.name })
      const joined = await listJoinedClassrooms(user.name)
      setJoinedRooms(joined)
      setSuccess(t('classes.joinedSuccess'))
    } catch (err) {
      console.error(err)
      setError(t('classes.joinError'))
    }
  }

  const handleLeave = async (code) => {
    try {
      await leaveClassroom({ classroom_code: code, student_name: user?.name })
      setJoinedRooms((prev) => prev.filter((r) => r.code !== code))
    } catch (err) {
      console.error(err)
    }
  }

  const isJoined = (code) => joinedRooms.some((r) => r.code === code)

  const displayClasses = searchResults !== null ? searchResults : allClassrooms

  return (
    <Box className="page-enter">
      <TopBar
        title={t('classes.title')}
        subtitle={isTeacher ? t('classes.teacherSubtitle') : t('classes.studentSubtitle')}
      />

      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mx: 2, mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isTeacher ? (
        /* ══════════ TEACHER VIEW ══════════ */
        <Box sx={{ px: 2 }}>
          {/* Create classroom */}
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <TextField
              size="small"
              placeholder={t('classes.newClassName')}
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateClass()}
              sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button
              variant="contained"
              onClick={handleCreateClass}
              disabled={!newClassName.trim()}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2 }}
            >
              {t('common.create')}
            </Button>
          </Stack>

          {teacherClassrooms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <ClassIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">{t('classes.noClasses')}</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {teacherClassrooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <Card
                    variant="outlined"
                    className="card-enter"
                    sx={{
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {room.name}
                          </Typography>
                          <Chip
                            label={room.code}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', mt: 0.5 }}
                          />
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title={t('classes.copyCode')}>
                            <IconButton size="small" onClick={() => handleCopyCode(room.code)}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('common.delete')}>
                            <IconButton size="small" color="error" onClick={() => handleDeleteClass(room.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ) : (
        /* ══════════ STUDENT VIEW ══════════ */
        <Box sx={{ px: 2 }}>
          {/* Search */}
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <TextField
              size="small"
              placeholder={t('classes.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              sx={{ borderRadius: 2 }}
            >
              {t('common.search')}
            </Button>
          </Stack>

          {/* Joined classes */}
          {joinedRooms.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
                {t('classes.myClasses')}
              </Typography>
              <Grid container spacing={2}>
                {joinedRooms.map((room) => (
                  <Grid item xs={12} sm={6} md={4} key={room.code}>
                    <Card
                      variant="outlined"
                      className="card-enter"
                      sx={{
                        borderRadius: 2,
                        borderLeft: '4px solid',
                        borderLeftColor: 'primary.main',
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {room.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              by {room.teacher_name}
                            </Typography>
                          </Box>
                          <Tooltip title={t('student.leave')}>
                            <IconButton size="small" color="error" onClick={() => handleLeave(room.code)}>
                              <LogoutIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* All / search results */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
            {searchResults !== null ? t('classes.searchResults') : t('classes.allClasses')}
          </Typography>
          {displayClasses.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ClassIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">
                {searchResults !== null ? t('classes.noResults') : t('classes.noClasses')}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {displayClasses.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <Card
                    variant="outlined"
                    className="card-enter"
                    sx={{
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {room.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            by {room.teacher_name}
                          </Typography>
                        </Box>
                        {isJoined(room.code) ? (
                          <Chip label={t('classes.joined')} size="small" color="primary" variant="outlined" />
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<LoginIcon />}
                            onClick={() => handleJoin(room.code)}
                            sx={{ borderRadius: 2 }}
                          >
                            {t('student.join')}
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  )
}
